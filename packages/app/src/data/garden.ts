/**
 * 灵药园系统 —— 种植 + 收获
 *
 * 最多 4 个种植槽位（建造灵药园后解锁）
 * 种植消耗种子，等待成熟后收获材料
 * 成长速度受灵药园等级加成 (herb_growth bonus)
 */

import { useCaveStore } from './stores/caveStore';
import { Realm, REALM_NAMES } from '@/core';
import type { InventorySlot } from '@/core';

// Realm 枚举 → 中文名的反向映射
const REALM_CN_ORDER = ['凡人', '炼气期', '筑基期', '结丹期', '元婴期', '化神期'] as const;

// ========== 类型 ==========

export interface CropData {
  id: string;
  name: string;
  seedItemId: string;
  harvestItemId: string;
  harvestMin: number;       // 最小收获数量
  harvestMax: number;       // 最大收获数量
  baseMinutes: number;      // 基础成长时间（现实分钟）
  goldCost: number;         // 种植消耗灵石
  minRealm: string;
}

export interface PlantedCrop {
  slotIndex: number;
  cropId: string;
  plantedAt: number;        // 种植时间戳 (ms)
}

// ========== 可种植作物 ==========

export const CROPS: CropData[] = [
  {
    id: 'crop_herb_spirit',
    name: '灵草',
    seedItemId: 'seed_spirit',
    harvestItemId: 'herb_spirit',
    harvestMin: 2,
    harvestMax: 4,
    baseMinutes: 5,       // 5 分钟成熟（测试友好）
    goldCost: 10,
    minRealm: '炼气期',
  },
  {
    id: 'crop_lingzhi',
    name: '灵芝',
    seedItemId: 'seed_lingzhi',
    harvestItemId: 'herb_lingzhi',
    harvestMin: 1,
    harvestMax: 2,
    baseMinutes: 10,
    goldCost: 30,
    minRealm: '筑基期',
  },
];

/** 种子 ID → 价格映射 */
export const SEED_PRICES: Record<string, number> = {
  seed_spirit: 15,
  seed_lingzhi: 50,
};

/** 种植槽位数量 */
export function getSlotCount(): number {
  const cave = useCaveStore.getState().cave;
  const garden = cave.buildings.find((b) => b.type === 'GARDEN');
  if (!garden) return 0;
  // Lv1=2槽, Lv2=3槽, Lv3+=4槽
  return Math.min(4, garden.level + 1);
}

/** 生长速度加成百分比 */
export function getHerbGrowthBonus(): number {
  const cave = useCaveStore.getState().cave;
  const garden = cave.buildings.find((b) => b.type === 'GARDEN');
  if (!garden) return 0;
  const bonus = garden.effects.find((e) => e.type === 'herb_growth');
  return bonus ? bonus.value : 0;
}

/** 计算某作物的实际成熟时间（秒） */
export function getGrowSeconds(crop: CropData): number {
  const bonus = getHerbGrowthBonus();
  const factor = 1 - Math.min(0.6, bonus / 100); // 最多缩短 60%
  return Math.round(crop.baseMinutes * 60 * factor);
}

/** 检查是否已成熟 */
export function isMature(planted: PlantedCrop, crop: CropData): boolean {
  const elapsed = (Date.now() - planted.plantedAt) / 1000;
  return elapsed >= getGrowSeconds(crop);
}

/** 获取成熟进度 (0-1) */
export function getMaturity(planted: PlantedCrop, crop: CropData): number {
  const elapsed = (Date.now() - planted.plantedAt) / 1000;
  return Math.min(1, elapsed / getGrowSeconds(crop));
}

/** 格式化剩余时间 */
export function formatRemaining(planted: PlantedCrop, crop: CropData): string {
  const remain = getGrowSeconds(crop) - (Date.now() - planted.plantedAt) / 1000;
  if (remain <= 0) return '已成熟';
  const m = Math.floor(remain / 60);
  const s = Math.floor(remain % 60);
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

/** 获取可用作物列表（基于背包中的种子） */
export function getAvailableCrops(realm: string, inventory?: InventorySlot[]): CropData[] {
  // 如果没有传入背包数据，回退到境界解锁逻辑
  if (!inventory) {
    const realmCN = REALM_NAMES[realm as Realm] ?? realm;
    const playerIdx = REALM_CN_ORDER.indexOf(realmCN as any);
    if (playerIdx === -1) return [];
    return CROPS.filter((c) => {
      const reqIdx = REALM_CN_ORDER.indexOf(c.minRealm as any);
      return playerIdx >= reqIdx;
    });
  }

  // 有背包数据：检查是否有对应种子
  return CROPS.filter((c) => {
    const owned = inventory.find((slot) => slot.item.id === c.seedItemId);
    return owned && owned.quantity > 0;
  });
}
