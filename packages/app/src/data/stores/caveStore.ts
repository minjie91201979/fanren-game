import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CaveDwelling, CaveLevel, Building, BuildingEffect } from '@/core';
import { generateId } from '@/core';
import { usePlayerStore } from './playerStore';

// ========== 升级消耗表 ==========

/** 洞府整体升级消耗（灵石） */
export const CAVE_UPGRADE_COST: Record<number, number> = {
  1: 200,   // 1→2 石室 → 洞府
  2: 500,   // 2→3 洞府 → 灵室
  3: 1200,  // 3→4 灵室 → 洞天
  4: 3000,  // 4→5 洞天 → 仙府
};

/** 洞府等级名称 */
export const CAVE_LEVEL_NAMES: Record<number, string> = {
  1: '石室',
  2: '洞府',
  3: '灵室',
  4: '洞天',
  5: '仙府',
};

/** 新建筑建造消耗 */
export const BUILD_COST: Record<string, number> = {
  MEDITATION_ROOM: 150,
  ALCHEMY_ROOM: 300,
  FORGING_ROOM: 300,
  TREASURY: 200,
  GARDEN: 250,
  ARRAY_CENTER: 500,
};

/** 建筑升级消耗（每级） */
export function getBuildingUpgradeCost(buildingLevel: number): number {
  return buildingLevel * 150;
}

/** 获取洞府升级消耗 */
export function getCaveUpgradeCost(level: number): number {
  return CAVE_UPGRADE_COST[level] || 9999;
}

/** 获取已拥有建筑类型集合 */
export function getOwnedBuildingTypes(buildings: Building[]): Set<string> {
  return new Set(buildings.map((b) => b.type));
}

// ========== Store ==========

interface CaveState {
  cave: CaveDwelling;
  upgradeCave: () => boolean;
  buildStructure: (type: Building['type']) => boolean;
  upgradeBuilding: (buildingId: string) => boolean;
  setCave: (cave: CaveDwelling) => void;
}

const defaultCave: CaveDwelling = {
  level: CaveLevel.LV1_STONE_CHAMBER,
  buildings: [{ id: 'meditation_1', type: 'MEDITATION_ROOM', level: 1, effects: [{ type: 'cultivation_bonus', value: 5 }] }],
  spiritVeinQuality: 10,
  cultivationBonus: 5,
};

export const useCaveStore = create<CaveState>()(
  immer((set) => ({
    cave: defaultCave,

    upgradeCave: () => {
      const state = useCaveStore.getState();
      if (state.cave.level >= CaveLevel.LV5_CAVE_HEAVEN) return false;
      const cost = getCaveUpgradeCost(state.cave.level);
      const playerStore = usePlayerStore.getState();
      if (!playerStore.player || playerStore.player.gold < cost) return false;

      // 扣灵石
      playerStore.modifyGold(-cost);

      set((s) => {
        s.cave.level++;
        s.cave.cultivationBonus += 10;
        s.cave.spiritVeinQuality = Math.min(100, s.cave.spiritVeinQuality + 15);
      });
      return true;
    },

    buildStructure: (type) => {
      const state = useCaveStore.getState();
      const owned = new Set(state.cave.buildings.map((b) => b.type));
      if (owned.has(type)) return false; // 同类型只能有一个
      const cost = BUILD_COST[type] || 300;
      const playerStore = usePlayerStore.getState();
      if (!playerStore.player || playerStore.player.gold < cost) return false;

      playerStore.modifyGold(-cost);

      set((s) => {
        s.cave.buildings.push({
          id: generateId(),
          type,
          level: 1,
          effects: getBuildingEffects(type, 1),
        });
      });
      return true;
    },

    upgradeBuilding: (buildingId) => {
      const state = useCaveStore.getState();
      const b = state.cave.buildings.find((b) => b.id === buildingId);
      if (!b) return false;
      const cost = getBuildingUpgradeCost(b.level);
      const playerStore = usePlayerStore.getState();
      if (!playerStore.player || playerStore.player.gold < cost) return false;

      playerStore.modifyGold(-cost);

      set((s) => {
        const building = s.cave.buildings.find((b) => b.id === buildingId);
        if (building) {
          building.level++;
          building.effects = getBuildingEffects(building.type, building.level);
        }
      });
      return true;
    },

    setCave: (cave) => set((s) => { s.cave = cave; }),
  }))
);

function getBuildingEffects(type: Building['type'], level: number): BuildingEffect[] {
  const effects: Record<string, BuildingEffect[]> = {
    'MEDITATION_ROOM': [{ type: 'cultivation_bonus', value: 5 * level }],
    'ALCHEMY_ROOM': [{ type: 'alchemy_success', value: 5 * level }],
    'FORGING_ROOM': [{ type: 'forging_success', value: 5 * level }],
    'TREASURY': [{ type: 'storage_bonus', value: 10 * level }],
    'GARDEN': [{ type: 'herb_growth', value: 10 * level }],
    'ARRAY_CENTER': [{ type: 'defense_bonus', value: 8 * level }],
  };
  return effects[type] || [];
}
