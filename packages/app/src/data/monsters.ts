import { Attributes } from '@/core';

// ============= 怪物难度等级 =============
export enum MonsterTier {
  LOW = 1,      // 简单 — 幽灵鬼灵
  MEDIUM = 2,   // 普通 — 银鬃狼、水蛇妖
  HIGH = 3,     // 困难 — 石傀儡
  BOSS = 4,     // Boss — 水月蛟龙（暂未实装到历练系统）
}

// ============= 怪物定义 =============
export interface MonsterDef {
  type: string;                    // 键名（wolf/ghost/golem/serpent/dragon）
  name: string;                    // 中文名
  tier: MonsterTier;               // 难度等级
  description: string;             // 简介
  sprite: string;                  // CSS sprite class
  attributes: Attributes;          // 战斗属性
  /** 基础灵石奖励（普攻击杀） */
  baseGold: number;
  /** 基础修为奖励（普攻击杀） */
  baseCultivation: number;
  /** 技能击杀奖励倍率 */
  skillMultiplier: number;
  /** 道具掉落率 0-1 */
  dropRate: number;
  /** 可能掉落的道具池 */
  dropPool: string[];
}

// ============= 怪物数据库 =============
export const MONSTER_DB: Record<string, MonsterDef> = {
  wolf: {
    type: 'wolf',
    name: '银鬃狼',
    tier: MonsterTier.MEDIUM,
    description: '青石村附近的凶猛妖兽，皮糙肉厚攻击强劲。适合筑基期以下修士磨炼战斗技巧。',
    sprite: 'sprite-enemy-wolf',
    attributes: {
      hp: 200, maxHp: 200, mp: 0, maxMp: 0,
      attack: 20, defense: 10, speed: 12, spirit: 3,
      critRate: 0.05, critDamage: 1.5,
    },
    baseGold: 55,
    baseCultivation: 35,
    skillMultiplier: 1.6,
    dropRate: 0.25,
    dropPool: ['pill_hp_small', 'herb_spirit', 'beast_core'],
  },
  ghost: {
    type: 'ghost',
    name: '幽灵鬼灵',
    tier: MonsterTier.LOW,
    description: '幽暗密林中游荡的怨灵，速度快但防御薄弱。擅长灵力攻击，对物理防御低的修士有威胁。',
    sprite: 'sprite-enemy-ghost',
    attributes: {
      hp: 150, maxHp: 150, mp: 40, maxMp: 40,
      attack: 15, defense: 5, speed: 18, spirit: 5,
      critRate: 0.1, critDamage: 1.8,
    },
    baseGold: 35,
    baseCultivation: 22,
    skillMultiplier: 1.6,
    dropRate: 0.30,
    dropPool: ['pill_mp_small', 'talisman_fire', 'herb_spirit', 'seed_spirit'],
  },
  golem: {
    type: 'golem',
    name: '石傀儡',
    tier: MonsterTier.HIGH,
    description: '矿脉中诞生的石灵生命，皮糙肉厚，攻击势大力沉。速度虽慢但很难被打倒。',
    sprite: 'sprite-enemy-golem',
    attributes: {
      hp: 350, maxHp: 350, mp: 0, maxMp: 0,
      attack: 25, defense: 20, speed: 6, spirit: 2,
      critRate: 0.02, critDamage: 1.3,
    },
    baseGold: 80,
    baseCultivation: 50,
    skillMultiplier: 1.6,
    dropRate: 0.35,
    dropPool: ['pill_hp_small', 'spirit_stone_low', 'sword_iron', 'beast_core'],
  },
  serpent: {
    type: 'serpent',
    name: '水蛇妖',
    tier: MonsterTier.MEDIUM,
    description: '水月湖中修炼多年的蛇妖，行动敏捷且有一定灵力修为。攻击附带微弱毒性。',
    sprite: 'sprite-enemy-serpent',
    attributes: {
      hp: 180, maxHp: 180, mp: 30, maxMp: 30,
      attack: 18, defense: 8, speed: 15, spirit: 4,
      critRate: 0.08, critDamage: 1.6,
    },
    baseGold: 45,
    baseCultivation: 28,
    skillMultiplier: 1.6,
    dropRate: 0.30,
    dropPool: ['pill_cult_small', 'herb_lingzhi', 'seed_lingzhi', 'spirit_stone_low'],
  },
  dragon: {
    type: 'dragon',
    name: '水月蛟龙',
    tier: MonsterTier.BOSS,
    description: '水月秘境的守护妖兽，实力堪比结丹初期修士。极难对付，但击败后收获丰厚。',
    sprite: 'sprite-enemy-dragon',
    attributes: {
      hp: 800, maxHp: 800, mp: 100, maxMp: 100,
      attack: 60, defense: 30, speed: 14, spirit: 15,
      critRate: 0.08, critDamage: 2.0,
    },
    baseGold: 200,
    baseCultivation: 120,
    skillMultiplier: 1.8,
    dropRate: 0.60,
    dropPool: ['pill_break', 'robe_silk', 'sword_steel', 'skill_mingguang', 'herb_lingzhi', 'beast_core'],
  },
};

// ============= 辅助函数 =============

/** 获取指定类型怪物的完整定义 */
export function getMonster(type: string): MonsterDef | undefined {
  return MONSTER_DB[type];
}

/**
 * 计算击杀奖励
 * @returns { gold: 灵石, cultivation: 修为, itemDrop?: 道具id }
 */
export function calcKillReward(monsterType: string, isSkillKill: boolean): {
  gold: number;
  cultivation: number;
  itemDrop?: string;
} {
  const m = MONSTER_DB[monsterType];
  if (!m) return { gold: 50, cultivation: 30 };

  const mult = isSkillKill ? m.skillMultiplier : 1;
  const gold = Math.floor(m.baseGold * mult);
  const cultivation = Math.floor(m.baseCultivation * mult);

  // 随机道具掉落
  let itemDrop: string | undefined;
  if (m.dropPool.length > 0 && Math.random() < m.dropRate) {
    itemDrop = m.dropPool[Math.floor(Math.random() * m.dropPool.length)];
  }

  return { gold, cultivation, itemDrop };
}

/** 获取怪物难度的中文标签 */
export function getTierLabel(tier: MonsterTier): string {
  switch (tier) {
    case MonsterTier.LOW: return '简单';
    case MonsterTier.MEDIUM: return '普通';
    case MonsterTier.HIGH: return '困难';
    case MonsterTier.BOSS: return '首领';
    default: return '未知';
  }
}

/** 获取所有历练可用怪物（排除 Boss） */
export function getAvailableMonsters(): MonsterDef[] {
  return Object.values(MONSTER_DB).filter((m) => m.tier !== MonsterTier.BOSS);
}
