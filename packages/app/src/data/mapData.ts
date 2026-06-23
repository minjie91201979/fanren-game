import { Realm } from '@/core';

// ============= 地点类型 =============
export type LocationType = 'sect' | 'wild' | 'village' | 'city' | 'mine' | 'ruin' | 'realm' | 'faction' | 'special';

// ============= 地点动作 =============
export type LocationAction = 'combat' | 'trade' | 'rest' | 'explore' | 'quest';

export interface MapLocation {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  x: number;         // SVG 百分比坐标
  y: number;
  requiredRealm: Realm;
  icon: string;      // emoji 图标
  actions: LocationAction[];
  combatEnemies?: string[];  // 战斗敌人类型
}

// ============= 天南地图全部地点 =============
export const MAP_LOCATIONS: MapLocation[] = [
  {
    id: 'huangfeng_valley',
    name: '黄枫谷',
    type: 'sect',
    description: '太岳山脉七大宗门之一。以木系功法见长，门内有长老坐镇，是低阶弟子的修炼圣地。',
    x: 32, y: 35,
    requiredRealm: Realm.MORTAL,
    icon: '🏔️',
    actions: ['rest', 'trade', 'quest'],
  },
  {
    id: 'qing_stone_village',
    name: '青石村',
    type: 'village',
    description: '落凤坡下的凡人村落，偶有散修出没。村中有间简陋的客栈可以暂时驻足。',
    x: 28, y: 52,
    requiredRealm: Realm.MORTAL,
    icon: '🏘️',
    actions: ['rest', 'trade'],
  },
  {
    id: 'phoenix_slope',
    name: '落凤坡',
    type: 'wild',
    description: '传说上古时期有凤凰坠落于此，山石呈赤红色。常有低阶妖兽出没。',
    x: 38, y: 55,
    requiredRealm: Realm.MORTAL,
    icon: '🏞️',
    actions: ['combat', 'explore'],
    combatEnemies: ['wolf', 'ghost'],
  },
  {
    id: 'wolf_valley',
    name: '狼谷',
    type: 'wild',
    description: '银鬃狼群的领地。炼气初期修士常来此地历练，磨炼战斗技巧。',
    x: 42, y: 42,
    requiredRealm: Realm.QI_REFINING,
    icon: '🐺',
    actions: ['combat', 'explore'],
    combatEnemies: ['wolf', 'ghost'],
  },
  {
    id: 'taiyue_mountains',
    name: '太岳山脉',
    type: 'wild',
    description: '横贯天南的巍峨山脉，七大宗门分布其间。深山中藏有无数秘境与机缘。',
    x: 48, y: 28,
    requiredRealm: Realm.QI_REFINING,
    icon: '⛰️',
    actions: ['combat', 'explore'],
    combatEnemies: ['wolf', 'golem', 'ghost'],
  },
  {
    id: 'spirit_mine',
    name: '灵石矿脉',
    type: 'mine',
    description: '太岳山中的灵石矿区，出产低阶灵石。矿工时有遭遇石妖袭击的危险。',
    x: 46, y: 20,
    requiredRealm: Realm.QI_REFINING,
    icon: '💎',
    actions: ['combat', 'explore'],
    combatEnemies: ['golem'],
  },
  {
    id: 'yan_family_fortress',
    name: '燕家堡',
    type: 'faction',
    description: '天南修仙家族燕家的驻地，以阵法与炼器见长。堡内设坊市，供修士交易。',
    x: 55, y: 50,
    requiredRealm: Realm.QI_REFINING,
    icon: '🏯',
    actions: ['trade', 'quest'],
  },
  {
    id: 'jiayuan_city',
    name: '嘉元城',
    type: 'city',
    description: '天南西部大城，商贾云集，是散修交易丹药和功法的主要场所。',
    x: 60, y: 58,
    requiredRealm: Realm.FOUNDATION,
    icon: '🏛️',
    actions: ['trade', 'quest'],
  },
  {
    id: 'blood_forbidden',
    name: '血色禁地',
    type: 'realm',
    description: '上古修士封印的禁地，入口覆盖血色结界。内有无数机缘，也伴随着致命的危险。',
    x: 68, y: 40,
    requiredRealm: Realm.QI_REFINING,
    icon: '🔴',
    actions: ['explore', 'combat'],
    combatEnemies: ['golem', 'serpent'],
  },
  {
    id: 'water_moon_lake',
    name: '水月湖',
    type: 'realm',
    description: '筑基期秘境——水月秘境的入口。湖水终年不冻，月圆之夜秘境之门会短暂开启。',
    x: 72, y: 18,
    requiredRealm: Realm.FOUNDATION,
    icon: '🌙',
    actions: ['explore', 'combat'],
    combatEnemies: ['serpent', 'ghost'],
  },
  {
    id: 'broken_soul_cliff',
    name: '断魂崖',
    type: 'ruin',
    description: '一座古修士洞府的遗址，遍布禁制。传说有结丹修士在此留下传承。',
    x: 78, y: 12,
    requiredRealm: Realm.FOUNDATION,
    icon: '💀',
    actions: ['explore', 'combat'],
    combatEnemies: ['golem', 'ghost'],
  },
  {
    id: 'tiannan_city',
    name: '天南城',
    type: 'city',
    description: '天南第一城！各大宗门在此设立驻点，高阶修士云集。城中有拍卖行和珍品坊市。',
    x: 52, y: 68,
    requiredRealm: Realm.FOUNDATION,
    icon: '🌆',
    actions: ['trade', 'quest'],
  },
  {
    id: 'chaotic_star_sea',
    name: '乱星海入口',
    type: 'special',
    description: '天南极东之地的古传送阵，可通往遥远海外的乱星海。需要大量灵石才能启动。',
    x: 88, y: 55,
    requiredRealm: Realm.CORE_FORMATION,
    icon: '🌟',
    actions: [],
  },
];

// ============= 地点查询 =============

export function getLocationById(id: string): MapLocation | undefined {
  return MAP_LOCATIONS.find((l) => l.id === id);
}

export function getLocationsByRealm(realm: Realm): MapLocation[] {
  const realmKeys = Object.values(Realm);
  const targetIdx = realmKeys.indexOf(realm);
  return MAP_LOCATIONS.filter((l) => {
    const locIdx = realmKeys.indexOf(l.requiredRealm);
    return locIdx <= targetIdx;
  });
}

export function canAccessLocation(location: MapLocation, playerRealm: Realm): boolean {
  const realmKeys = Object.values(Realm);
  const playerIdx = realmKeys.indexOf(playerRealm);
  const locIdx = realmKeys.indexOf(location.requiredRealm);
  return playerIdx >= locIdx;
}

// ============= 地点类型配置 =============

export const LOCATION_TYPE_CONFIG: Record<LocationType, { color: string; bgColor: string; label: string }> = {
  sect:    { color: '#C9A34A', bgColor: '#3E3020', label: '宗门' },
  wild:    { color: '#5B8C5A', bgColor: '#1A2E1A', label: '野外' },
  village: { color: '#A6893A', bgColor: '#2E2510', label: '村庄' },
  city:    { color: '#D4A830', bgColor: '#3A2A10', label: '城市' },
  mine:    { color: '#8BB0C0', bgColor: '#1A2A30', label: '矿脉' },
  ruin:    { color: '#7B6BAA', bgColor: '#1A1528', label: '遗迹' },
  realm:   { color: '#C0503D', bgColor: '#2A0A0A', label: '秘境' },
  faction: { color: '#A0A0C0', bgColor: '#202030', label: '势力' },
  special: { color: '#E0B040', bgColor: '#303010', label: '特殊' },
};

export const LOCATION_ACTION_NAME: Record<LocationAction, string> = {
  combat:  '⚔️ 历练',
  trade:   '💰 交易',
  rest:    '🛌 休息',
  explore: '🔍 探索',
  quest:   '📜 任务',
};
