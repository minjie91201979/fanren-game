/**
 * 炼丹系统 —— 配方表 + 成功判定
 *
 * 成功率 = 基础成功率 + 炼丹室加成 (alchemy_success bonus)
 * 丹毒值按丹药品质累加，过高时修炼效率降低
 */

import { getItem } from './items';
import { useCaveStore } from './stores/caveStore';
import { Realm, REALM_NAMES } from '@/core';

const REALM_CN_ORDER = ['凡人', '炼气期', '筑基期', '结丹期', '元婴期', '化神期'] as const;

// ========== 类型 ==========

export interface AlchemyRecipe {
  id: string;
  name: string;
  resultItemId: string;   // 产出物品 id
  count: number;           // 产出一炉几颗
  materials: { itemId: string; count: number }[];
  goldCost: number;        // 额外消耗灵石
  baseRate: number;        // 基础成功率 (0-1)
  toxin: number;           // 丹毒增量
  minRealm: string;        // 最低境界要求 (string 匹配 player.realm)
}

export interface AlchemyResult {
  success: boolean;
  itemId: string;
  itemName: string;
  count: number;
  toxin: number;
}

// ========== 配方表 ==========

export const ALCHEMY_RECIPES: AlchemyRecipe[] = [
  {
    id: 'alch_hp_small',
    name: '回春丹',
    resultItemId: 'pill_hp_small',
    count: 2,
    materials: [{ itemId: 'herb_spirit', count: 2 }],
    goldCost: 10,
    baseRate: 0.75,
    toxin: 2,
    minRealm: '炼气期',
  },
  {
    id: 'alch_mp_small',
    name: '聚灵丹',
    resultItemId: 'pill_mp_small',
    count: 2,
    materials: [{ itemId: 'herb_spirit', count: 3 }],
    goldCost: 15,
    baseRate: 0.70,
    toxin: 3,
    minRealm: '炼气期',
  },
  {
    id: 'alch_cult_small',
    name: '培元丹',
    resultItemId: 'pill_cult_small',
    count: 1,
    materials: [
      { itemId: 'herb_spirit', count: 2 },
      { itemId: 'beast_core', count: 1 },
    ],
    goldCost: 25,
    baseRate: 0.60,
    toxin: 5,
    minRealm: '筑基期',
  },
  {
    id: 'alch_hp_mid',
    name: '回灵丹',
    resultItemId: 'pill_hp_mid',
    count: 1,
    materials: [
      { itemId: 'herb_spirit', count: 4 },
      { itemId: 'spirit_stone_low', count: 2 },
    ],
    goldCost: 40,
    baseRate: 0.55,
    toxin: 8,
    minRealm: '筑基期',
  },
  {
    id: 'alch_break',
    name: '冲关丹',
    resultItemId: 'pill_break',
    count: 1,
    materials: [
      { itemId: 'herb_spirit', count: 5 },
      { itemId: 'beast_core', count: 2 },
      { itemId: 'spirit_stone_low', count: 3 },
    ],
    goldCost: 80,
    baseRate: 0.40,
    toxin: 10,
    minRealm: '金丹期',
  },
];

// ========== 工具函数 ==========

/** 获取炼丹室等级加成（0-50） */
export function getAlchemyBonus(): number {
  const cave = useCaveStore.getState().cave;
  const alchemyRoom = cave.buildings.find((b) => b.type === 'ALCHEMY_ROOM');
  if (!alchemyRoom) return 0;
  const bonus = alchemyRoom.effects.find((e) => e.type === 'alchemy_success');
  return bonus ? bonus.value : 0;
}

/** 计算炼丹成功率 */
export function getAlchemyRate(recipe: AlchemyRecipe): number {
  return Math.min(0.95, recipe.baseRate + getAlchemyBonus() / 100);
}

/** 按境界筛选可用配方 */
export function getAvailableRecipes(realm: string): AlchemyRecipe[] {
  const realmCN = REALM_NAMES[realm as Realm] ?? realm;
  const playerIdx = REALM_CN_ORDER.indexOf(realmCN as any);
  if (playerIdx === -1) return [];
  return ALCHEMY_RECIPES.filter((r) => {
    const reqIdx = REALM_CN_ORDER.indexOf(r.minRealm as any);
    return playerIdx >= reqIdx;
  });
}

/** 检查玩家是否有足够材料 */
export function canCraftRecipe(
  recipe: AlchemyRecipe,
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
