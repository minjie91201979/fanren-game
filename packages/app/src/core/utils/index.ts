import { Attributes, Realm } from '../types';
import { REALM_MAX_LAYERS } from '../constants/game';

/** 生成唯一ID */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** 计算实际属性（含BUFF） */
export function calculateActualAttributes(base: Attributes, buffs: { stat: keyof Attributes; value: number }[]): Attributes {
  const actual = { ...base };
  for (const buff of buffs) {
    actual[buff.stat] += buff.value;
  }
  actual.hp = Math.max(0, Math.min(actual.hp, actual.maxHp));
  actual.mp = Math.max(0, Math.min(actual.mp, actual.maxMp));
  return actual;
}

/** 境界比较 */
export function compareRealm(a: Realm, b: Realm): number {
  const order = Object.values(Realm);
  return order.indexOf(a) - order.indexOf(b);
}

/** 是否到达境界满层 */
export function isRealmMaxLayer(realm: Realm, layer: number): boolean {
  return layer >= REALM_MAX_LAYERS[realm];
}

/** 突破到下一境界 */
export function getNextRealm(realm: Realm): Realm | null {
  const order = Object.values(Realm);
  const idx = order.indexOf(realm);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

/** 计算伤害 */
export function calculateDamage(
  attackerAttack: number,
  defenderDefense: number,
  powerCoefficient: number = 1,
  critRate: number = 0,
  critDamage: number = 1.5,
): { damage: number; isCrit: boolean } {
  const isCrit = Math.random() < critRate;
  const baseDamage = Math.max(1, attackerAttack * powerCoefficient - defenderDefense * 0.5);
  const variance = 0.9 + Math.random() * 0.2; // ±10%
  const finalDamage = Math.floor(baseDamage * variance * (isCrit ? critDamage : 1));
  return { damage: finalDamage, isCrit };
}

/** 计算突破成功率 */
export function calculateBreakthroughRate(
  baseRate: number,
  pillBonus: number = 0,
  spiritVeinBonus: number = 0,
  auxiliaryBonus: number = 0,
): number {
  return Math.min(0.95, baseRate + pillBonus + spiritVeinBonus + auxiliaryBonus);
}

/** 格式化灵石 */
export function formatGold(amount: number): string {
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万`;
  return amount.toLocaleString();
}

/** 深拷贝 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
