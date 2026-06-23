import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CaveDwelling, CaveLevel, Building, BuildingEffect } from '@/core';
import { generateId } from '@/core';

interface CaveState {
  cave: CaveDwelling;
  upgradeCave: () => void;
  buildStructure: (type: Building['type']) => void;
  upgradeBuilding: (buildingId: string) => void;
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

    upgradeCave: () => set((s) => {
      if (s.cave.level < CaveLevel.LV5_CAVE_HEAVEN) {
        s.cave.level++;
        s.cave.cultivationBonus += 10;
        s.cave.spiritVeinQuality += 15;
      }
    }),

    buildStructure: (type) => set((s) => {
      const building: Building = {
        id: generateId(),
        type,
        level: 1,
        effects: getBuildingEffects(type, 1),
      };
      s.cave.buildings.push(building);
    }),

    upgradeBuilding: (buildingId) => set((s) => {
      const b = s.cave.buildings.find((b) => b.id === buildingId);
      if (b) {
        b.level++;
        b.effects = getBuildingEffects(b.type, b.level);
      }
    }),

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
