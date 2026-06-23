import React, { useState } from 'react';
import { useCombatStore, usePlayerStore } from '@fanren/data';
import { CombatAction } from '@fanren/core';
import { formatGold } from '@fanren/core';

export const Combat: React.FC = () => {
  const combat = useCombatStore();
  const player = usePlayerStore((s) => s.player);
  const [started, setStarted] = useState(false);

  const handleStartCombat = () => {
    if (!player) return;
    const playerUnit = {
      id: player.id,
      name: player.name,
      isPlayer: true,
      attributes: player.attributes,
      currentAttributes: { ...player.attributes },
      buffs: [],
      skills: [],
      sprite: 'player_male',
      realm: player.realm,
    };

    const enemyUnit = {
      id: 'enemy_test',
      name: '银鬃狼',
      isPlayer: false,
      attributes: { hp: 200, maxHp: 200, mp: 0, maxMp: 0, attack: 20, defense: 10, speed: 12, spirit: 3, critRate: 0.05, critDamage: 1.5 },
      currentAttributes: { hp: 200, maxHp: 200, mp: 0, maxMp: 0, attack: 20, defense: 10, speed: 12, spirit: 3, critRate: 0.05, critDamage: 1.5 },
      buffs: [],
      skills: [],
      sprite: 'enemy_wolf',
      realm: player.realm,
    };

    combat.startCombat(playerUnit, enemyUnit);
    setStarted(true);
  };

  const doAction = (action: CombatAction) => {
    combat.executeAction(action);
  };

  return (
    <div className="page-container">
      {!started && (
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <div className="panel" style={{ maxWidth: 400, margin: '0 auto' }}>
            <div className="panel-title">外出历练</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              在这片天地间历练，与妖兽战斗以磨炼自身。击败妖兽可获得修为与宝物。
            </p>
            <button className="btn btn-primary btn-lg" onClick={handleStartCombat} style={{ width: '100%' }}>
              ⚔️ 开始战斗
            </button>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="btn btn-sm">狼谷 (简单)</button>
              <button className="btn btn-sm">矿洞 (普通)</button>
              <button className="btn btn-sm">血蝠洞 (困难)</button>
              <button className="btn btn-sm">阴风峡谷 (危险)</button>
            </div>
          </div>
        </div>
      )}

      {started && combat.isActive && (
        <div className="fade-in" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          background: `url(assets/backgrounds/bg_combat_forest.png) center/cover`,
          minHeight: '60vh',
        }}>
          {/* Battle scene */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'space-around', padding: '0 40px',
            position: 'relative',
          }}>
            {/* Player */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 120, height: 160, background: 'var(--bg-overlay)',
                borderRadius: 'var(--radius-lg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 40 }}>🧙</span>
              </div>
              <div style={{ fontWeight: 600 }}>{combat.player?.name}</div>
              <div className="progress-bar" style={{ width: 120, marginTop: 4 }}>
                <div className="progress-bar-fill progress-hp" style={{
                  width: `${combat.player ? (combat.player.currentAttributes.hp / combat.player.attributes.maxHp) * 100 : 100}%`,
                }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {combat.player?.currentAttributes.hp}/{combat.player?.attributes.maxHp}
              </div>
            </div>

            {/* VS */}
            <div style={{ fontSize: 24, color: 'var(--brand-danger)', fontWeight: 700 }}>VS</div>

            {/* Enemy */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 120, height: 160, background: 'var(--bg-overlay)',
                borderRadius: 'var(--radius-lg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 40 }}>🐺</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--brand-danger)' }}>
                {combat.enemy?.name}
              </div>
              <div className="progress-bar" style={{ width: 120, marginTop: 4 }}>
                <div className="progress-bar-fill progress-hp" style={{
                  width: `${combat.enemy ? (combat.enemy.currentAttributes.hp / combat.enemy.attributes.maxHp) * 100 : 100}%`,
                }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {combat.enemy?.currentAttributes.hp}/{combat.enemy?.attributes.maxHp}
              </div>
            </div>
          </div>

          {/* Actions */}
          {combat.turn === 'PLAYER' && (
            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center',
              padding: 20, background: 'var(--bg-overlay)',
            }}>
              <button className="btn btn-primary btn-lg" onClick={() => doAction({ type: 'ATTACK' })}>
                🗡️ 攻击
              </button>
              <button className="btn btn-lg" onClick={() => doAction({ type: 'DEFEND' })}>
                🛡️ 防御
              </button>
              <button className="btn btn-lg" onClick={() => doAction({ type: 'FLEE' })}>
                🏃 逃跑
              </button>
            </div>
          )}

          {/* Enemy turn indicator */}
          {combat.turn === 'ENEMY' && (
            <div style={{
              textAlign: 'center', padding: 16, color: 'var(--brand-danger)',
              fontFamily: 'var(--font-title)', fontSize: 16,
            }}>
              敌人行动中...
            </div>
          )}

          {/* Combat log */}
          <div style={{
            maxHeight: 100, overflow: 'auto', padding: '8px 16px',
            background: 'var(--bg-overlay)', borderTop: '1px solid var(--border-default)',
          }}>
            {combat.log.slice(-4).map((line, i) => (
              <div key={i} style={{
                fontSize: 13, color: 'var(--text-primary)',
                marginBottom: 2, animation: 'fadeIn 0.3s ease',
              }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combat result */}
      {started && combat.result && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="panel fade-in" style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>
              {combat.result.victory ? '🎉' : '💀'}
            </div>
            <div className="panel-title">
              {combat.result.victory ? '战斗胜利！' : '战斗失败...'}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              {combat.result.victory
                ? '你击败了敌人，获得了宝贵的战斗经验和战利品。'
                : '被击败了，回到洞府休养吧。'}
            </p>
            {combat.result.rewards && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ color: 'var(--color-gold)' }}>💰 +50</span>
                <span style={{ marginLeft: 12, color: 'var(--color-blue)' }}>⚡ +30修为</span>
              </div>
            )}
            <button className="btn btn-primary" onClick={() => {
              combat.endCombat();
              setStarted(false);
              window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
            }}>
              返回洞府
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
