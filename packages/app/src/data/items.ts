import { Item, ItemType, Rarity, SpiritRoot } from '@/core';

/**
 * 游戏内全部物品定义
 * id 与 Trading / Inventory 通用
 */
export const ITEM_DB: Record<string, Item> = {
  // ---- 丹药 ----
  pill_hp_small: {
    id: 'pill_hp_small', name: '回春丹', description: '恢复50点生命值',
    type: ItemType.CONSUMABLE, rarity: Rarity.COMMON, level: 1,
    effects: [{ type: 'HEAL_HP', value: 50 }], price: 10, stackable: true, quantity: 1,
  },
  pill_mp_small: {
    id: 'pill_mp_small', name: '聚灵丹', description: '恢复30点灵力值',
    type: ItemType.CONSUMABLE, rarity: Rarity.COMMON, level: 1,
    effects: [{ type: 'HEAL_MP', value: 30 }], price: 15, stackable: true, quantity: 1,
  },
  pill_cult_small: {
    id: 'pill_cult_small', name: '培元丹', description: '增加20点修为',
    type: ItemType.CONSUMABLE, rarity: Rarity.UNCOMMON, level: 1,
    effects: [{ type: 'ADD_CULTIVATION', value: 20 }], price: 30, stackable: true, quantity: 1,
  },
  pill_hp_mid: {
    id: 'pill_hp_mid', name: '回灵丹', description: '恢复150点生命值',
    type: ItemType.CONSUMABLE, rarity: Rarity.UNCOMMON, level: 1,
    effects: [{ type: 'HEAL_HP', value: 150 }], price: 50, stackable: true, quantity: 1,
  },
  pill_break: {
    id: 'pill_break', name: '冲关丹', description: '突破时成功率+15%，丹毒+10',
    type: ItemType.CONSUMABLE, rarity: Rarity.RARE, level: 1,
    effects: [{ type: 'BREAKTHROUGH_BONUS', value: 15 }], price: 120, stackable: true, quantity: 1,
  },

  // ---- 武器 ----
  sword_iron: {
    id: 'sword_iron', name: '铁剑', description: '凡品铁剑，攻击+5',
    type: ItemType.EQUIPMENT, rarity: Rarity.COMMON, level: 1,
    equipmentSlot: 'WEAPON', spiritRootRequirement: [{ root: SpiritRoot.GOLD, value: 0 }],
    attributes: { attack: 5 }, price: 50,
  },
  sword_steel: {
    id: 'sword_steel', name: '钢剑', description: '凡品钢剑，攻击+10',
    type: ItemType.EQUIPMENT, rarity: Rarity.COMMON, level: 1,
    equipmentSlot: 'WEAPON', spiritRootRequirement: [{ root: SpiritRoot.GOLD, value: 0 }],
    attributes: { attack: 10 }, price: 100,
  },
  robe_cloth: {
    id: 'robe_cloth', name: '布袍', description: '凡品布袍，防御+3',
    type: ItemType.EQUIPMENT, rarity: Rarity.COMMON, level: 1,
    equipmentSlot: 'BODY', attributes: { defense: 3 }, price: 40,
  },
  robe_silk: {
    id: 'robe_silk', name: '丝袍', description: '凡品丝袍，防御+6，灵力+5',
    type: ItemType.EQUIPMENT, rarity: Rarity.UNCOMMON, level: 1,
    equipmentSlot: 'BODY', attributes: { defense: 6, maxMp: 5 }, price: 80,
  },

  // ---- 符箓 ----
  talisman_fire: {
    id: 'talisman_fire', name: '火球符', description: '一次性攻击符箓，造成30点火系伤害',
    type: ItemType.CONSUMABLE, rarity: Rarity.COMMON, level: 1,
    effects: [{ type: 'SPIRIT_ATTACK', value: 30 }], price: 20, stackable: true, quantity: 1,
  },
  talisman_shield: {
    id: 'talisman_shield', name: '护身符', description: '一次性防御符箓，减伤30%持续1回合',
    type: ItemType.CONSUMABLE, rarity: Rarity.UNCOMMON, level: 1,
    effects: [{ type: 'DEFEND', value: 30 }], price: 35, stackable: true, quantity: 1,
  },

  // ---- 材料 ----
  herb_spirit: {
    id: 'herb_spirit', name: '灵草', description: '炼丹基础材料，产于青石村周边',
    type: ItemType.MATERIAL, rarity: Rarity.COMMON, level: 1,
    price: 25, stackable: true, quantity: 1,
  },
  beast_core: {
    id: 'beast_core', name: '妖兽核', description: '低阶妖兽的兽核，可用于炼器',
    type: ItemType.MATERIAL, rarity: Rarity.UNCOMMON, level: 1,
    price: 60, stackable: true, quantity: 1,
  },
  spirit_stone_low: {
    id: 'spirit_stone_low', name: '下品灵石', description: '蕴含微量灵气的石头',
    type: ItemType.MATERIAL, rarity: Rarity.COMMON, level: 1,
    price: 5, stackable: true, quantity: 1,
  },

  // ---- 功法 ----
  skill_changchun: {
    id: 'skill_changchun', name: '长春功残篇', description: '人级木系基础功法，修炼速度+10%',
    type: ItemType.SKILL_BOOK, rarity: Rarity.UNCOMMON, level: 1,
    price: 100,
  },
  skill_mingguang: {
    id: 'skill_mingguang', name: '明光诀', description: '人级金系基础功法，攻击+3',
    type: ItemType.SKILL_BOOK, rarity: Rarity.UNCOMMON, level: 1,
    price: 100,
  },
};

/** 商店出售列表（含位置分类） */
export const SHOP_CATALOG = [
  { id: 'pill_hp_small',   category: '丹药' },
  { id: 'pill_mp_small',   category: '丹药' },
  { id: 'pill_cult_small',  category: '丹药' },
  { id: 'talisman_fire',    category: '符箓' },
  { id: 'talisman_shield',  category: '符箓' },
  { id: 'sword_iron',       category: '武器' },
  { id: 'robe_cloth',       category: '防具' },
  { id: 'herb_spirit',      category: '材料' },
  { id: 'skill_changchun',  category: '功法' },
];

/** 战斗掉落池（按区域） */
export const DROP_TABLE: Record<string, string[]> = {
  wolf_valley: ['pill_hp_small', 'herb_spirit', 'beast_core'],
  mine:        ['pill_hp_small', 'spirit_stone_low', 'sword_iron'],
  ruins:       ['pill_mp_small', 'talisman_fire', 'skill_changchun'],
  default:     ['pill_hp_small', 'herb_spirit'],
};

/** 根据id获取物品（返回副本） */
export function getItem(id: string): Item | undefined {
  const t = ITEM_DB[id];
  return t ? { ...t } : undefined;
}
