// ========================================
// 凡人修仙传 - 核心类型定义
// ========================================

// ========== 境界系统 ==========
export enum Realm {
  MORTAL = 'MORTAL',
  QI_REFINING = 'QI_REFINING',
  FOUNDATION = 'FOUNDATION',
  CORE_FORMATION = 'CORE_FORMATION',
  NASCENT_SOUL = 'NASCENT_SOUL',
  DEITY_TRANSFORMATION = 'DEITY_TRANSFORMATION',
}

export const REALM_NAMES: Record<Realm, string> = {
  [Realm.MORTAL]: '凡人',
  [Realm.QI_REFINING]: '炼气期',
  [Realm.FOUNDATION]: '筑基期',
  [Realm.CORE_FORMATION]: '结丹期',
  [Realm.NASCENT_SOUL]: '元婴期',
  [Realm.DEITY_TRANSFORMATION]: '化神期',
};

// ========== 灵根系统 ==========
export enum SpiritRoot {
  NONE = 'NONE',
  GOLD = 'GOLD',
  WOOD = 'WOOD',
  WATER = 'WATER',
  FIRE = 'FIRE',
  EARTH = 'EARTH',
}

export const SPIRIT_ROOT_NAMES: Record<SpiritRoot, string> = {
  [SpiritRoot.NONE]: '无灵根',
  [SpiritRoot.GOLD]: '金灵根',
  [SpiritRoot.WOOD]: '木灵根',
  [SpiritRoot.WATER]: '水灵根',
  [SpiritRoot.FIRE]: '火灵根',
  [SpiritRoot.EARTH]: '土灵根',
};

export const SPIRIT_ROOT_COLORS: Record<SpiritRoot, string> = {
  [SpiritRoot.NONE]: '#A0A0A0',
  [SpiritRoot.GOLD]: '#C9A34A',
  [SpiritRoot.WOOD]: '#5B8C5A',
  [SpiritRoot.WATER]: '#4A7BA7',
  [SpiritRoot.FIRE]: '#C0503D',
  [SpiritRoot.EARTH]: '#8B7355',
};

export interface SpiritRootAffinity {
  root: SpiritRoot;
  value: number; // 1-100 灵根值
}

// ========== 属性系统 ==========
export interface Attributes {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  spirit: number; // 神识
  critRate: number; // 暴击率 0-1
  critDamage: number; // 暴击倍率
}

// ========== 角色数据 ==========
export interface PlayerData {
  id: string;
  name: string;
  title: string;
  gender: 'MALE' | 'FEMALE';
  realm: Realm;
  realmLayer: number; // 每个境界的层数 (1-13 炼气, 1-3 筑基等)
  spiritRoots: SpiritRootAffinity[];
  attributes: Attributes;
  cultivation: number; // 当前修为值
  cultivationToNext: number; // 突破所需修为
  age: number;
  lifespan: number; // 当前境界寿元上限
  pillToxin: number; // 丹毒 0-100
  karma: number; // 业力/杀戮值
  gold: number; // 灵石
  inventory: InventoryItem[];
  equipment: Equipment;
  skills: LearnedSkill[];
  techniques: LearnedTechnique[];
  reputation: Record<string, number>; // 各势力声望
  npcAffinity: Record<string, number>; // NPC好感度
  questFlags: Record<string, boolean>; // 任务标记
  unlockedMaps: string[];
  gameTime: GameTime;
}

// ========== 物品系统 ==========
export enum ItemType {
  CONSUMABLE = 'CONSUMABLE',
  EQUIPMENT = 'EQUIPMENT',
  MATERIAL = 'MATERIAL',
  SKILL_BOOK = 'SKILL_BOOK',
  QUEST = 'QUEST',
  SPECIAL = 'SPECIAL',
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
}

export const RARITY_NAMES: Record<Rarity, string> = {
  [Rarity.COMMON]: '普通',
  [Rarity.UNCOMMON]: '罕见',
  [Rarity.RARE]: '稀有',
  [Rarity.EPIC]: '史诗',
  [Rarity.LEGENDARY]: '传说',
  [Rarity.MYTHIC]: '神话',
};

export interface BaseItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  description: string;
  icon: string; // icon path
  stackable: boolean;
  maxStack: number;
  sellPrice: number;
}

export interface ConsumableItem extends BaseItem {
  type: ItemType.CONSUMABLE;
  effects: ConsumableEffect[];
}

export interface ConsumableEffect {
  stat: keyof Attributes | 'cultivation' | 'pillToxin' | 'lifespan';
  value: number;
  isPercentage: boolean;
}

export interface EquipmentItem extends BaseItem {
  type: ItemType.EQUIPMENT;
  slot: EquipmentSlot;
  requiredRealm: Realm;
  statBonus: Partial<Attributes>;
  setBonus?: string; // 套装ID
}

export type EquipmentSlot = 'WEAPON' | 'HEAD' | 'BODY' | 'HANDS' | 'FEET' | 'ACCESSORY1' | 'ACCESSORY2';

export interface MaterialItem extends BaseItem {
  type: ItemType.MATERIAL;
  materialType: string; // 矿石/灵草/兽骨等
  quality: number; // 1-100
}

export interface SkillBookItem extends BaseItem {
  type: ItemType.SKILL_BOOK;
  skillId: string;
}

export interface QuestItem extends BaseItem {
  type: ItemType.QUEST;
  questId: string;
}

export type InventoryItem = ConsumableItem | EquipmentItem | MaterialItem | SkillBookItem | QuestItem;

export interface InventorySlot {
  item: InventoryItem;
  quantity: number;
}

export type Equipment = Partial<Record<EquipmentSlot, EquipmentItem>>;

// ========== 功法系统 ==========
export enum TechniqueType {
  MAIN = 'MAIN', // 主修功法
  AUXILIARY = 'AUXILIARY', // 辅修功法
  SECRET = 'SECRET', // 秘术
}

export enum TechniqueGrade {
  HUMAN = 'HUMAN',
  EARTH = 'EARTH',
  HEAVEN = 'HEAVEN',
  IMMORTAL = 'IMMORTAL',
}

export const TECHNIQUE_GRADE_NAMES: Record<TechniqueGrade, string> = {
  [TechniqueGrade.HUMAN]: '人级',
  [TechniqueGrade.EARTH]: '地级',
  [TechniqueGrade.HEAVEN]: '天级',
  [TechniqueGrade.IMMORTAL]: '仙级',
};

export interface Technique {
  id: string;
  name: string;
  type: TechniqueType;
  grade: TechniqueGrade;
  spiritRoot: SpiritRoot; // 对应灵根
  description: string;
  cultivationBonus: number; // 修炼速度加成
  attributeBonus: Partial<Attributes>;
  requiredRealm: Realm;
}

export interface LearnedTechnique {
  techniqueId: string;
  level: number; // 1-13
  proficiency: number; // 0-100
}

// ========== 技能系统 ==========
export enum SkillType {
  ATTACK = 'ATTACK',
  DEFENSE = 'DEFENSE',
  SUPPORT = 'SUPPORT',
  MOVEMENT = 'MOVEMENT',
  SPECIAL = 'SPECIAL',
}

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  spiritRoot: SpiritRoot;
  description: string;
  mpCost: number;
  cooldown: number; // 回合冷却
  power: number; // 威力系数
  requiredRealm: Realm;
  effects: SkillEffect[];
}

export interface SkillEffect {
  type: 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEBUFF' | 'SHIELD' | 'DOT' | 'STUN';
  target: 'SELF' | 'ENEMY' | 'ALL_ENEMIES' | 'ALLY';
  stat?: keyof Attributes;
  value: number;
  duration: number; // 持续回合
}

export interface LearnedSkill {
  skillId: string;
  level: number; // 1-10
  proficiency: number; // 0-100
}

// ========== 战斗系统 ==========
export interface CombatUnit {
  id: string;
  name: string;
  isPlayer: boolean;
  attributes: Attributes;
  currentAttributes: Attributes;
  buffs: Buff[];
  skills: Skill[];
  sprite: string;
  realm: Realm;
}

export interface Buff {
  id: string;
  name: string;
  type: 'BUFF' | 'DEBUFF';
  stat: keyof Attributes;
  value: number;
  remainingTurns: number;
}

export interface CombatAction {
  type: 'ATTACK' | 'SKILL' | 'DEFEND' | 'ITEM' | 'FLEE';
  skillId?: string;
  itemId?: string;
}

export type CombatResult = {
  victory: boolean;
  rewards: CombatReward;
  playerHpRemaining: number;
  turns: number;
};

export interface CombatReward {
  gold: number;
  cultivation: number;
  items: { itemId: string; quantity: number }[];
}

// ========== 洞府系统 ==========
export enum CaveLevel {
  LV1_STONE_CHAMBER = 1,
  LV2_CAVE_DWELLING = 2,
  LV3_SPIRIT_CHAMBER = 3,
  LV4_BLESSED_LAND = 4,
  LV5_CAVE_HEAVEN = 5,
}

export interface CaveDwelling {
  level: CaveLevel;
  buildings: Building[];
  spiritVeinQuality: number; // 灵脉质量 1-100
  cultivationBonus: number;
}

export interface Building {
  id: string;
  type: 'MEDITATION_ROOM' | 'ALCHEMY_ROOM' | 'FORGING_ROOM' | 'TREASURY' | 'GARDEN' | 'ARRAY_CENTER';
  level: number;
  effects: BuildingEffect[];
}

export interface BuildingEffect {
  type: string;
  value: number;
}

// ========== NPC系统 ==========
export enum NPCRole {
  ELDER = 'ELDER',
  DISCIPLE = 'DISCIPLE',
  MERCHANT = 'MERCHANT',
  CRAFTSMAN = 'CRAFTSMAN',
  RIVAL = 'RIVAL',
  MENTOR = 'MENTOR',
  MYSTERIOUS = 'MYSTERIOUS',
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  role: NPCRole;
  realm: Realm;
  spiritRoot: SpiritRoot;
  location: string;
  affinity: number; // 0-100
  description: string;
  dialogue: DialogueNode[];
  shopItems?: string[]; // item IDs for merchants
  teaches?: string[]; // skill/technique IDs for mentors
}

export interface DialogueNode {
  id: string;
  text: string;
  condition?: DialogueCondition;
  options: DialogueOption[];
}

export interface DialogueCondition {
  minAffinity?: number;
  questFlag?: string;
  minRealm?: Realm;
  hasItem?: string;
}

export interface DialogueOption {
  text: string;
  nextNode?: string;
  action?: DialogueAction;
  condition?: DialogueCondition;
}

export interface DialogueAction {
  type: 'GIVE_ITEM' | 'TEACH_SKILL' | 'START_QUEST' | 'CHANGE_AFFINITY' | 'TRADE';
  params: Record<string, unknown>;
}

// ========== 任务系统 ==========
export enum QuestType {
  MAIN = 'MAIN',
  SIDE = 'SIDE',
  DAILY = 'DAILY',
  HIDDEN = 'HIDDEN',
}

export enum QuestStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Quest {
  id: string;
  name: string;
  type: QuestType;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisiteQuests?: string[];
  requiredRealm?: Realm;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'KILL' | 'COLLECT' | 'TALK' | 'REACH' | 'CULTIVATE';
  target: string;
  required: number;
  current: number;
}

export interface QuestReward {
  gold: number;
  cultivation: number;
  items: { itemId: string; quantity: number }[];
  reputation: Record<string, number>;
}

export interface ActiveQuest {
  questId: string;
  status: QuestStatus;
  objectives: QuestObjective[];
}

// ========== 秘境系统 ==========
export interface SecretRealm {
  id: string;
  name: string;
  requiredRealm: Realm;
  description: string;
  floors: number;
  monsters: string[]; // enemy IDs
  boss: string;
  rewards: CombatReward;
  unlocked: boolean;
  bestRecord?: {
    time: number;
    deaths: number;
    explorationRate: number;
  };
}

// ========== 时间系统 ==========
export interface GameTime {
  year: number;
  month: number;
  day: number;
  hour: number;
}

export enum DayPeriod {
  DAWN = 'DAWN',
  DAY = 'DAY',
  DUSK = 'DUSK',
  NIGHT = 'NIGHT',
}

export enum Season {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER',
}

// ========== 存档系统 ==========
export interface SaveData {
  version: string;
  timestamp: number;
  player: PlayerData;
  npcs: NPC[];
  quests: ActiveQuest[];
  settings: GameSettings;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  textSpeed: 'SLOW' | 'NORMAL' | 'FAST';
  autoSave: boolean;
  language: 'zh-CN';
}

// ========== 地图系统 ==========
export interface WorldMapArea {
  id: string;
  name: string;
  description: string;
  levelRange: [number, number];
  locations: MapLocation[];
  unlocked: boolean;
  explored: number; // 0-100
}

export interface MapLocation {
  id: string;
  name: string;
  type: 'CITY' | 'SECT' | 'WILDERNESS' | 'DUNGEON' | 'SECRET_REALM' | 'RESOURCE';
  x: number;
  y: number;
  connectedTo: string[];
}
