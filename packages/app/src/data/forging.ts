/**
 * 炼器系统 —— 配方表 + 成功判定
 *
 * 成功率 = 基础成功率 + 炼器室加成 (forging_success bonus)
 * 产出装备/符箓
 */

import { getItem } from './items';
import { useCaveStore } from './stores/caveStore';
import { Realm, REALM_NAMES } from '@/core';

const REALM_CN_ORDER = ['凡人', '炼气期', '筑基期', '结丹期', '元婴期', '化神期'] as const;

// ========== 类型 ==========

export interface ForgingRecipe {
  id: string;
  name: string;
  resultItemId: string;
  materials: { itemId: string; count: number }[];
  goldCost: number;
  baseRate: number;
  description: string;
  minRealm: string;
}

// ========== 配方表 ==========

export const FORGING_RECIPES: ForgingRecipe[] = [
  {
    id: 'forge_sword_iron',
    name: '铁剑',
    resultItemId: 'sword_iron',
    materials: [
      { itemId: 'beast_core', count: 1 },
      { itemId: 'spirit_stone_low', count: 2 },
    ],
    goldCost: 30,
    baseRate: 0.70,
    description: '凡品铁剑，攻击+5',
    minRealm: '炼气期',
  },
  {
    id: 'forge_robe_cloth',
    name: '布袍',
    resultItemId: 'robe_cloth',
    materials: [
      { itemId: 'herb_spirit', count: 2 },
      { itemId: 'spirit_stone_low', count: 2 },
    ],
    goldCost: 25,
    baseRate: 0.75,
    description: '凡品布袍，防御+3',
    minRealm: '炼气期',
  },
  {
    id: 'forge_talisman_fire',
    name: '火球符',
    resultItemId: 'talisman_fire',
    materials: [
      { itemId: 'herb_spirit', count: 2 },
      { itemId: 'beast_core', count: 1 },
    ],
    goldCost: 15,
    baseRate: 0.72,
    description: '一次性攻击符箓，30点火系伤害',
    minRealm: '炼气期',
  },
  {
    id: 'forge_sword_steel',
    name: '钢剑',
    resultItemId: 'sword_steel',
    materials: [
      { itemId: 'beast_core', count: 3 },
      { itemId: 'spirit_stone_low', count: 4 },
    ],
    goldCost: 60,
    baseRate: 0.55,
    description: '凡品钢剑，攻击+10',
    minRealm: '筑基期',
  },
  {
    id: 'forge_robe_silk',
    name: '丝袍',
    resultItemId: 'robe_silk',
    materials: [
      { itemId: 'herb_spirit', count: 4 },
      { itemId: 'spirit_stone_low', count: 4 },
    ],
    goldCost: 50,
    baseRate: 0.58,
    description: '凡品丝袍，防御+6，灵力+5',
    minRealm: '筑基期',
  },
  {
    id: 'forge_talisman_shield',
    name: '护身符',
    resultItemId: 'talisman_shield',
    materials: [
      { itemId: 'herb_spirit', count: 3 },
      { itemId: 'beast_core', count: 1 },
    ],
    goldCost: 25,
    baseRate: 0.60,
    description: '减伤30%持续1回合',
    minRealm: '筑基期',
  },
];

// ========== 工具函数 ==========

export function getForgingBonus(): number {
  const cave = useCaveStore.getState().cave;
  const forgingRoom = cave.buildings.find((b) => b.type === 'FORGING_ROOM');
  if (!forgingRoom) return 0;
  const bonus = forgingRoom.effects.find((e) => e.type === 'forging_success');
  return bonus ? bonus.value : 0;
}

export function getForgingRate(recipe: ForgingRecipe): number {
  return Math.min(0.95, recipe.baseRate + getForgingBonus() / 100);
}

export function getAvailableForgingRecipes(realm: string): ForgingRecipe[] {
  const realmCN = REALM_NAMES[realm as Realm] ?? realm;
  const playerIdx = REALM_CN_ORDER.indexOf(realmCN as any);
  if (playerIdx === -1) return [];
  return FORGING_RECIPES.filter((r) => {
    const reqIdx = REALM_CN_ORDER.indexOf(r.minRealm as any);
    return playerIdx >= reqIdx;
  });
}

export function canForgeRecipe(
  recipe: ForgingRecipe,
  inventory: { itemId: string; quantity: number }[],
  gold: number,
): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const m of recipe.materials) {
    const owned = inventory.find((inv) => inv.itemId === m.itemId);
    if (!owned || owned.quantity < m.count) {
      const item = getItem(m.itemId);
      missing.push(`${item?.name || m.itemId} (需${m.count})`);
    }
  }
  if (gold < recipe.goldCost) {
    missing.push(`灵石 (需${recipe.goldCost})`);
  }
  return { ok: missing.length === 0, missing };
}
