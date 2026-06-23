// 游戏常量定义
import { Realm, SpiritRoot, Attributes } from '../types';

// ========== 境界层数 ==========
export const REALM_MAX_LAYERS: Record<Realm, number> = {
  [Realm.MORTAL]: 1,
  [Realm.QI_REFINING]: 13,
  [Realm.FOUNDATION]: 3,
  [Realm.CORE_FORMATION]: 3,
  [Realm.NASCENT_SOUL]: 3,
  [Realm.DEITY_TRANSFORMATION]: 3,
};

// ========== 寿元上限 ==========
export const REALM_LIFESPAN: Record<Realm, number> = {
  [Realm.MORTAL]: 100,
  [Realm.QI_REFINING]: 150,
  [Realm.FOUNDATION]: 250,
  [Realm.CORE_FORMATION]: 500,
  [Realm.NASCENT_SOUL]: 1000,
  [Realm.DEITY_TRANSFORMATION]: 2000,
};

// ========== 突破基础概率 ==========
export const BREAKTHROUGH_BASE_RATE: Record<Realm, number> = {
  [Realm.MORTAL]: 1.0,
  [Realm.QI_REFINING]: 0.9,
  [Realm.FOUNDATION]: 0.5,
  [Realm.CORE_FORMATION]: 0.3,
  [Realm.NASCENT_SOUL]: 0.15,
  [Realm.DEITY_TRANSFORMATION]: 0.05,
};

// ========== 基础属性成长 ==========
export function getBaseAttributes(realm: Realm, layer: number, spiritRoot: SpiritRoot): Attributes {
  const baseStats: Record<Realm, Attributes> = {
    [Realm.MORTAL]: { hp: 100, maxHp: 100, mp: 0, maxMp: 0, attack: 10, defense: 5, speed: 10, spirit: 5, critRate: 0.05, critDamage: 1.5 },
    [Realm.QI_REFINING]: { hp: 150, maxHp: 150, mp: 50, maxMp: 50, attack: 20, defense: 10, speed: 15, spirit: 10, critRate: 0.05, critDamage: 1.5 },
    [Realm.FOUNDATION]: { hp: 500, maxHp: 500, mp: 200, maxMp: 200, attack: 50, defense: 30, speed: 30, spirit: 30, critRate: 0.08, critDamage: 1.5 },
    [Realm.CORE_FORMATION]: { hp: 1500, maxHp: 1500, mp: 600, maxMp: 600, attack: 120, defense: 80, speed: 60, spirit: 60, critRate: 0.10, critDamage: 1.6 },
    [Realm.NASCENT_SOUL]: { hp: 5000, maxHp: 5000, mp: 2000, maxMp: 2000, attack: 300, defense: 200, speed: 120, spirit: 150, critRate: 0.12, critDamage: 1.7 },
    [Realm.DEITY_TRANSFORMATION]: { hp: 15000, maxHp: 15000, mp: 6000, maxMp: 6000, attack: 800, defense: 500, speed: 250, spirit: 350, critRate: 0.15, critDamage: 1.8 },
  };

  const base = { ...baseStats[realm] };
  const multiplier = 1 + (layer - 1) * 0.15;
  for (const key of Object.keys(base) as (keyof Attributes)[]) {
    base[key] = Math.floor(base[key] * multiplier);
  }
  return base;
}

// ========== 修炼速度 ==========
export const CULTIVATION_SPEED_BASE = 10; // 基础修炼速度 修为/时辰
export const CULTIVATION_SPEED_PER_LAYER = 1.5;

// ========== 物品模板ID ==========
export const ITEM_IDS = {
  SPIRIT_STONE: 'item_spirit_stone',
  HEALING_PILL_SMALL: 'item_pill_hp_small',
  HEALING_PILL_MEDIUM: 'item_pill_hp_medium',
  MANA_PILL_SMALL: 'item_pill_mp_small',
  IRON_SWORD: 'item_sword_iron',
  CLOTH_ROBE: 'item_robe_cloth',
  SPIRIT_GRASS: 'item_grass_spirit',
} as const;

// ========== 灵根影响 ==========
export const SPIRIT_ROOT_BONUS: Record<SpiritRoot, Partial<Attributes>> = {
  [SpiritRoot.GOLD]: { attack: 5 },
  [SpiritRoot.WOOD]: { hp: 30 },
  [SpiritRoot.WATER]: { mp: 20, spirit: 3 },
  [SpiritRoot.FIRE]: { attack: 3, critRate: 0.02 },
  [SpiritRoot.EARTH]: { defense: 5 },
  [SpiritRoot.NONE]: {},
};
