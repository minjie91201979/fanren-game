import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CombatUnit, Buff, CombatAction, Attributes, SkillEffect } from '@/core';
import { calculateDamage, generateId } from '@/core';
import { usePlayerStore } from './playerStore';
import { calcKillReward } from '@/data/monsters';
import { getItem } from '@/data/items';

interface SkillCooldown {
  skillId: string;
  remainingTurns: number;
}

interface CombatState {
  isActive: boolean;
  player: CombatUnit | null;
  enemy: CombatUnit | null;
  turn: 'PLAYER' | 'ENEMY';
  turnCount: number;
  log: string[];
  result: { victory: boolean; rewards?: unknown } | null;
  cooldowns: SkillCooldown[];

  startCombat: (player: CombatUnit, enemy: CombatUnit) => void;
  executeAction: (action: CombatAction) => void;
  endCombat: () => void;
  addLog: (msg: string) => void;
  isOnCooldown: (skillId: string) => boolean;
}

/**
 * 从敌人 ID 中提取怪物类型
 * ID 格式: "enemy_wolf" 或 "enemy_wolf_1680000000000"
 */
function extractEnemyType(enemyId: string): string {
  const parts = enemyId.split('_');
  return parts[1] || 'wolf';
}

/**
 * 胜利时发放奖励到 playerStore
 * 根据怪物类型计算差异化奖励，并处理随机道具掉落
 */
function grantRewards(enemyId: string, isSkillKill: boolean) {
  const monsterType = extractEnemyType(enemyId);
  const reward = calcKillReward(monsterType, isSkillKill);

  const ps = usePlayerStore.getState();
  ps.modifyGold(reward.gold);
  ps.addCultivation(reward.cultivation);

  // 道具掉落
  if (reward.itemDrop) {
    const item = getItem(reward.itemDrop);
    if (item) {
      ps.addItem(item, 1);
    }
  }

  return reward;
}

export const useCombatStore = create<CombatState>()(
  immer((set, get) => ({
    isActive: false,
    player: null,
    enemy: null,
    turn: 'PLAYER',
    turnCount: 0,
    log: [],
    result: null,
    cooldowns: [],

    startCombat: (player, enemy) => set((s) => {
      s.isActive = true;
      s.player = { ...player, currentAttributes: { ...player.attributes } };
      s.enemy = { ...enemy, currentAttributes: { ...enemy.attributes } };
      s.turn = 'PLAYER';
      s.turnCount = 0;
      s.log = [`⚔️ 战斗开始！遭遇了 ${enemy.name}！`];
      s.result = null;
      s.cooldowns = [];
    }),

    executeAction: (action) => {
      const state = get();
      if (!state.isActive || !state.player || !state.enemy) return;
      if (state.turn !== 'PLAYER') return;

      // ====== SKILL 分支 ======
      if (action.type === 'SKILL' && action.skillId) {
        const skill = (state.player.skills as any[]).find((s: any) => s.id === action.skillId);
        if (!skill) return;

        // 检查冷却
        const onCd = state.cooldowns.find((c) => c.skillId === action.skillId);
        if (onCd && onCd.remainingTurns > 0) return;

        // 检查 MP
        if (state.player.currentAttributes.mp < skill.mpCost) return;

        set((s) => {
          if (!s.player || !s.enemy) return;

          // 消耗 MP
          s.player.currentAttributes.mp -= skill.mpCost;

          // 获取技能等级
          const playerStore = (window as any).__playerStore;
          let skillLevel = 1;
          if (playerStore) {
            const learned = playerStore.player?.skills?.find((ls: any) => ls.skillId === action.skillId);
            if (learned) skillLevel = learned.level;
          }

          // 应用效果
          for (const eff of skill.effects) {
            applySkillEffect(s, eff, skill, skillLevel);
          }

          // 设置冷却
          if (skill.cooldown > 0) {
            const existing = s.cooldowns.find((c) => c.skillId === action.skillId);
            if (existing) {
              existing.remainingTurns = skill.cooldown + 1;
            } else {
              s.cooldowns.push({ skillId: action.skillId!, remainingTurns: skill.cooldown + 1 });
            }
          }

          // 检查敌方死亡
          if (s.enemy.currentAttributes.hp <= 0) {
            s.enemy.currentAttributes.hp = 0;
            s.isActive = false;
            const reward = grantRewards(s.enemy.id, true);
            s.result = { victory: true, rewards: reward };
            s.log.push(`🎉 击败了 ${s.enemy.name}！`);
            return;
          }

          // Buff 结算 + 切换回合
          processBuffs(s.player);
          s.turn = 'ENEMY';
        });

        // Enemy turn
        setTimeout(() => enemyTurn(set, get), 500);
        return;
      }

      // ====== 普攻/防御/逃跑 (原有逻辑) ======
      set((s) => {
        if (!s.player || !s.enemy) return;

        if (action.type === 'ATTACK') {
          const { damage, isCrit } = calculateDamage(
            s.player.currentAttributes.attack,
            s.enemy!.currentAttributes.defense,
            1,
            s.player.currentAttributes.critRate,
            s.player.currentAttributes.critDamage,
          );
          s.enemy.currentAttributes.hp -= damage;
          s.log.push(isCrit ? `💥 暴击！造成 ${damage} 点伤害！` : `🗡️ 攻击造成 ${damage} 点伤害`);
        } else if (action.type === 'DEFEND') {
          s.player.buffs.push({
            id: generateId(), name: '防御姿态', type: 'BUFF',
            stat: 'defense', value: Math.floor(s.player.currentAttributes.defense * 0.5),
            remainingTurns: 2,
          });
          s.log.push('🛡️ 进入防御姿态，防御力提升！');
        } else if (action.type === 'FLEE') {
          if (Math.random() < 0.5) {
            s.log.push('🏃 逃跑成功！');
            s.isActive = false;
            s.result = { victory: false };
            return;
          }
          s.log.push('❌ 逃跑失败！');
        }

        if (s.enemy.currentAttributes.hp <= 0) {
          s.enemy.currentAttributes.hp = 0;
          s.isActive = false;
          const reward = grantRewards(s.enemy.id, false);
          s.result = { victory: true, rewards: reward };
          s.log.push(`🎉 击败了 ${s.enemy.name}！`);
          return;
        }

        processBuffs(s.player);
        s.turn = 'ENEMY';
      });

      setTimeout(() => enemyTurn(set, get), 500);
    },

    endCombat: () => set((s) => { s.isActive = false; }),

    addLog: (msg) => set((s) => { s.log.push(msg); }),

    isOnCooldown: (skillId) => {
      const cd = get().cooldowns.find((c) => c.skillId === skillId);
      return !!(cd && cd.remainingTurns > 0);
    },
  }))
);

// ========== 敌方回合 ==========
function enemyTurn(
  set: (fn: (s: CombatState) => void) => void,
  get: () => CombatState,
) {
  set((s) => {
    if (!s.isActive || !s.player || !s.enemy) return;

    // 降低冷却
    for (const cd of s.cooldowns) {
      if (cd.remainingTurns > 0) cd.remainingTurns--;
    }

    const { damage, isCrit } = calculateDamage(
      s.enemy!.currentAttributes.attack,
      s.player!.currentAttributes.defense,
    );
    s.player.currentAttributes.hp -= damage;
    s.log.push(isCrit ? `💔 ${s.enemy!.name} 暴击！受到 ${damage} 点伤害！` : `👊 ${s.enemy!.name} 攻击造成 ${damage} 点伤害`);

    if (s.player.currentAttributes.hp <= 0) {
      s.player.currentAttributes.hp = 0;
      s.isActive = false;
      s.result = { victory: false };
      s.log.push('💀 你被击败了...');
      return;
    }

    processBuffs(s.enemy!);
    s.turn = 'PLAYER';
    s.turnCount++;
  });
}

// ========== Buff 处理 ==========
function processBuffs(unit: CombatUnit) {
  unit.buffs = unit.buffs.filter((b) => {
    b.remainingTurns--;
    return b.remainingTurns > 0;
  });
}

// ========== 技能效果应用 ==========
function applySkillEffect(
  s: CombatState,
  eff: SkillEffect,
  skill: any,
  level: number,
) {
  if (!s.player || !s.enemy) return;

  const scale = 1 + (level - 1) * 0.12; // 等级缩放
  const scaledValue = Math.floor(eff.value * scale);

  switch (eff.type) {
    case 'DAMAGE': {
      const rawDamage = Math.floor(
        s.player!.currentAttributes.attack * skill.power * (1 + (level - 1) * 0.15)
      );
      const defense = Math.max(0, s.enemy!.currentAttributes.defense);
      const damage = Math.max(1, rawDamage - defense);
      s.enemy!.currentAttributes.hp -= damage;
      s.log.push(`✨ 【${skill.name}】造成 ${damage} 点伤害！`);
      break;
    }
    case 'HEAL': {
      const heal = Math.min(scaledValue, s.player!.attributes.maxHp - s.player!.currentAttributes.hp);
      s.player!.currentAttributes.hp += heal;
      s.log.push(`💚 【${skill.name}】恢复 ${heal} 点生命值`);
      break;
    }
    case 'SHIELD': {
      s.player!.buffs.push({
        id: generateId(),
        name: `${skill.name}·护盾`,
        type: 'BUFF',
        stat: 'defense',
        value: scaledValue,
        remainingTurns: eff.duration || 3,
      });
      s.log.push(`🛡️ 【${skill.name}】获得 ${scaledValue} 护盾，持续${eff.duration}回合`);
      break;
    }
    case 'BUFF': {
      s.player!.buffs.push({
        id: generateId(),
        name: `${skill.name}`,
        type: 'BUFF',
        stat: eff.stat || 'attack',
        value: scaledValue,
        remainingTurns: eff.duration || 3,
      });
      s.log.push(`⬆️ 【${skill.name}】${eff.stat} +${scaledValue}，持续${eff.duration}回合`);
      break;
    }
    case 'DEBUFF': {
      s.enemy!.buffs.push({
        id: generateId(),
        name: `${skill.name}`,
        type: 'DEBUFF',
        stat: eff.stat || 'speed',
        value: scaledValue,
        remainingTurns: eff.duration || 2,
      });
      s.log.push(`⬇️ 【${skill.name}】敌人${eff.stat} ${scaledValue}，持续${eff.duration}回合`);
      break;
    }
    case 'DOT': {
      s.enemy!.buffs.push({
        id: generateId(),
        name: `${skill.name}·灼烧`,
        type: 'DEBUFF',
        stat: 'hp',
        value: -scaledValue,
        remainingTurns: eff.duration || 3,
      });
      s.log.push(`🔥 【${skill.name}】附加灼烧 ${scaledValue}/回合，持续${eff.duration}回合`);
      break;
    }
    case 'STUN': {
      s.enemy!.buffs.push({
        id: generateId(),
        name: `${skill.name}·麻痹`,
        type: 'DEBUFF',
        stat: 'speed',
        value: -999,
        remainingTurns: eff.duration || 1,
      });
      s.log.push(`⚡ 【${skill.name}】敌人被麻痹 ${eff.duration} 回合！`);
      break;
    }
  }
}
