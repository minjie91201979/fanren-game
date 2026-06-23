import { Skill, SkillType, SpiritRoot, Realm } from '@/core';

// ==================== 全技能数据库 ====================
// 按境界分组，由低到高解锁
export const SKILL_DB: Skill[] = [
  // ---------- 炼气期 ----------
  {
    id: 'skill_fireball',
    name: '火球术',
    type: SkillType.ATTACK,
    spiritRoot: SpiritRoot.FIRE,
    description: '凝聚火焰之力，发射一枚火球攻击敌人。最基础的攻击法术。',
    mpCost: 10,
    cooldown: 0,
    power: 1.3,
    requiredRealm: Realm.QI_REFINING,
    effects: [{ type: 'DAMAGE', target: 'ENEMY', value: 0, duration: 0 }],
  },
  {
    id: 'skill_icespike',
    name: '冰锥术',
    type: SkillType.ATTACK,
    spiritRoot: SpiritRoot.WATER,
    description: '凝结水汽成冰锥刺向敌人，有几率降低敌人速度。',
    mpCost: 18,
    cooldown: 0,
    power: 1.6,
    requiredRealm: Realm.QI_REFINING,
    effects: [
      { type: 'DAMAGE', target: 'ENEMY', value: 0, duration: 0 },
      { type: 'DEBUFF', target: 'ENEMY', stat: 'speed', value: -5, duration: 2 },
    ],
  },
  {
    id: 'skill_spiritshield',
    name: '灵气护盾',
    type: SkillType.DEFENSE,
    spiritRoot: SpiritRoot.EARTH,
    description: '以灵力在身周形成一层护盾，吸收即将到来的伤害。',
    mpCost: 15,
    cooldown: 3,
    power: 0,
    requiredRealm: Realm.QI_REFINING,
    effects: [{ type: 'SHIELD', target: 'SELF', value: 40, duration: 3 }],
  },
  {
    id: 'skill_healinglight',
    name: '聚灵术',
    type: SkillType.SUPPORT,
    spiritRoot: SpiritRoot.WOOD,
    description: '引天地灵气入体，快速恢复生命值。',
    mpCost: 8,
    cooldown: 2,
    power: 0,
    requiredRealm: Realm.QI_REFINING,
    effects: [{ type: 'HEAL', target: 'SELF', value: 35, duration: 0 }],
  },
  {
    id: 'skill_lightbody',
    name: '轻身术',
    type: SkillType.SUPPORT,
    spiritRoot: SpiritRoot.WIND,
    description: '风系法术，轻身提速，提升自身速度属性。',
    mpCost: 12,
    cooldown: 3,
    power: 0,
    requiredRealm: Realm.QI_REFINING,
    effects: [{ type: 'BUFF', target: 'SELF', stat: 'speed', value: 8, duration: 3 }],
  },

  // ---------- 筑基期 ----------
  {
    id: 'skill_swordqi',
    name: '剑气斩',
    type: SkillType.ATTACK,
    spiritRoot: SpiritRoot.GOLD,
    description: '以气御剑，凝聚剑气隔空斩出，威力远超普通攻击。',
    mpCost: 25,
    cooldown: 1,
    power: 2.2,
    requiredRealm: Realm.FOUNDATION,
    effects: [{ type: 'DAMAGE', target: 'ENEMY', value: 0, duration: 0 }],
  },
  {
    id: 'skill_thunderbolt',
    name: '雷击术',
    type: SkillType.ATTACK,
    spiritRoot: SpiritRoot.THUNDER,
    description: '引天雷之力轰击敌人，有一定概率造成麻痹。',
    mpCost: 30,
    cooldown: 1,
    power: 2.5,
    requiredRealm: Realm.FOUNDATION,
    effects: [
      { type: 'DAMAGE', target: 'ENEMY', value: 0, duration: 0 },
      { type: 'STUN', target: 'ENEMY', value: 0, duration: 1 },
    ],
  },
  {
    id: 'skill_trueyuanshield',
    name: '真元护体',
    type: SkillType.DEFENSE,
    spiritRoot: SpiritRoot.EARTH,
    description: '将真元外放形成坚固护盾，筑基期最强防御法术。',
    mpCost: 35,
    cooldown: 4,
    power: 0,
    requiredRealm: Realm.FOUNDATION,
    effects: [{ type: 'SHIELD', target: 'SELF', value: 100, duration: 3 }],
  },
  {
    id: 'skill_recovery',
    name: '回元术',
    type: SkillType.SUPPORT,
    spiritRoot: SpiritRoot.WOOD,
    description: '调动丹田真元转化为生命精华，中量恢复生命。',
    mpCost: 20,
    cooldown: 2,
    power: 0,
    requiredRealm: Realm.FOUNDATION,
    effects: [{ type: 'HEAL', target: 'SELF', value: 80, duration: 0 }],
  },

  // ---------- 金丹期 ----------
  {
    id: 'skill_truesamadhifire',
    name: '三昧真火',
    type: SkillType.ATTACK,
    spiritRoot: SpiritRoot.FIRE,
    description: '金丹真火，焚尽万物。高威力火系攻击，附带灼烧效果。',
    mpCost: 55,
    cooldown: 2,
    power: 3.2,
    requiredRealm: Realm.CORE_FORMATION,
    effects: [
      { type: 'DAMAGE', target: 'ENEMY', value: 0, duration: 0 },
      { type: 'DOT', target: 'ENEMY', stat: 'hp', value: 15, duration: 3 },
    ],
  },
  {
    id: 'skill_vajrabody',
    name: '金刚不坏',
    type: SkillType.DEFENSE,
    spiritRoot: SpiritRoot.EARTH,
    description: '金丹之力加持，大幅提升防御力，金身难破。',
    mpCost: 60,
    cooldown: 5,
    power: 0,
    requiredRealm: Realm.CORE_FORMATION,
    effects: [
      { type: 'BUFF', target: 'SELF', stat: 'defense', value: 30, duration: 3 },
      { type: 'SHIELD', target: 'SELF', value: 80, duration: 3 },
    ],
  },
  {
    id: 'skill_grandhealing',
    name: '大还丹术',
    type: SkillType.SUPPORT,
    spiritRoot: SpiritRoot.WOOD,
    description: '金丹期疗伤秘术，大量恢复生命值。',
    mpCost: 45,
    cooldown: 3,
    power: 0,
    requiredRealm: Realm.CORE_FORMATION,
    effects: [{ type: 'HEAL', target: 'SELF', value: 200, duration: 0 }],
  },

  // ---------- 元婴期 ----------
  {
    id: 'skill_heavenlythunder',
    name: '天雷正法',
    type: SkillType.ATTACK,
    spiritRoot: SpiritRoot.THUNDER,
    description: '元婴修士引动天道雷劫之力，毁天灭地的攻击法术，附带麻痹。',
    mpCost: 90,
    cooldown: 3,
    power: 4.5,
    requiredRealm: Realm.NASCENT_SOUL,
    effects: [
      { type: 'DAMAGE', target: 'ENEMY', value: 0, duration: 0 },
      { type: 'STUN', target: 'ENEMY', value: 0, duration: 1 },
    ],
  },
  {
    id: 'skill_immortalbody',
    name: '不死金身',
    type: SkillType.DEFENSE,
    spiritRoot: SpiritRoot.EARTH,
    description: '元婴出窍前的终极防御，形成多层护盾并大幅提升全属性。',
    mpCost: 110,
    cooldown: 6,
    power: 0,
    requiredRealm: Realm.NASCENT_SOUL,
    effects: [
      { type: 'SHIELD', target: 'SELF', value: 250, duration: 4 },
      { type: 'BUFF', target: 'SELF', stat: 'defense', value: 40, duration: 4 },
    ],
  },
  {
    id: 'skill_nascentescape',
    name: '元婴出窍',
    type: SkillType.SUPPORT,
    spiritRoot: SpiritRoot.NONE,
    description: '元婴修士的奥义，短时间内大幅提升全属性。',
    mpCost: 70,
    cooldown: 5,
    power: 0,
    requiredRealm: Realm.NASCENT_SOUL,
    effects: [
      { type: 'BUFF', target: 'SELF', stat: 'attack', value: 20, duration: 4 },
      { type: 'BUFF', target: 'SELF', stat: 'defense', value: 15, duration: 4 },
      { type: 'BUFF', target: 'SELF', stat: 'speed', value: 10, duration: 4 },
      { type: 'HEAL', target: 'SELF', value: 100, duration: 0 },
    ],
  },
];

// ==================== 查询函数 ====================

/** 根据 ID 获取技能 */
export function getSkill(id: string): Skill | undefined {
  return SKILL_DB.find((s) => s.id === id);
}

/** 获取某境界可解锁的全部技能 */
export function getSkillsByRealm(realm: Realm): Skill[] {
  return SKILL_DB.filter((s) => s.requiredRealm === realm);
}

/** 获取指定境界及以下全部技能 */
export function getSkillsUpToRealm(realm: Realm): Skill[] {
  const realmValues = Object.values(Realm) as Realm[];
  const targetIdx = realmValues.indexOf(realm);
  return SKILL_DB.filter((s) => {
    const skillIdx = realmValues.indexOf(s.requiredRealm);
    return skillIdx <= targetIdx && skillIdx >= realmValues.indexOf(Realm.QI_REFINING);
  });
}

/** 技能升级消耗 */
export function getSkillUpgradeCost(level: number): { gold: number; cultivation: number } {
  return {
    gold: 50 + level * 30,
    cultivation: 20 + level * 15,
  };
}

/** 技能威力随等级缩放 */
export function getSkillScaledPower(skill: Skill, level: number): number {
  return skill.power * (1 + (level - 1) * 0.15);
}

/** 技能效果数值随等级缩放 */
export function getSkillScaledEffectValue(effectValue: number, level: number): number {
  if (effectValue === 0) return 0;
  return Math.floor(effectValue * (1 + (level - 1) * 0.12));
}
