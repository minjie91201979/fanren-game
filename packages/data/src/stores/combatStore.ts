import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CombatUnit, Buff, CombatAction, Attributes } from '@fanren/core';
import { calculateDamage, generateId } from '@fanren/core';

interface CombatState {
  isActive: boolean;
  player: CombatUnit | null;
  enemy: CombatUnit | null;
  turn: 'PLAYER' | 'ENEMY';
  turnCount: number;
  log: string[];
  result: { victory: boolean; rewards?: unknown } | null;

  startCombat: (player: CombatUnit, enemy: CombatUnit) => void;
  executeAction: (action: CombatAction) => void;
  endCombat: () => void;
  addLog: (msg: string) => void;
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

    startCombat: (player, enemy) => set((s) => {
      s.isActive = true;
      s.player = { ...player, currentAttributes: { ...player.attributes } };
      s.enemy = { ...enemy, currentAttributes: { ...enemy.attributes } };
      s.turn = 'PLAYER';
      s.turnCount = 0;
      s.log = [`⚔️ 战斗开始！遭遇了 ${enemy.name}！`];
      s.result = null;
    }),

    executeAction: (action) => {
      const state = get();
      if (!state.isActive || !state.player || !state.enemy) return;
      if (state.turn !== 'PLAYER') return;

      set((s) => {
        if (!s.player || !s.enemy) return;

        // Player action
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

        // Check enemy death
        if (s.enemy.currentAttributes.hp <= 0) {
          s.enemy.currentAttributes.hp = 0;
          s.isActive = false;
          s.result = { victory: true, rewards: { gold: 50, cultivation: 30 } };
          s.log.push(`🎉 击败了 ${s.enemy.name}！`);
          return;
        }

        // Process buffs
        processBuffs(s.player);
        s.turn = 'ENEMY';
      });

      // Enemy turn (separate to avoid immer issues)
      setTimeout(() => {
        set((s) => {
          if (!s.isActive || !s.player || !s.enemy) return;

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
      }, 500);
    },

    endCombat: () => set((s) => { s.isActive = false; }),

    addLog: (msg) => set((s) => { s.log.push(msg); }),
  }))
);

function processBuffs(unit: CombatUnit) {
  unit.buffs = unit.buffs.filter((b) => {
    b.remainingTurns--;
    return b.remainingTurns > 0;
  });
}
