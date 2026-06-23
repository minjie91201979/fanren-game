import React, { useState } from 'react';
import { usePlayerStore } from '@/data';
import { Realm, SkillType, REALM_NAMES as CORE_REALM_NAMES } from '@/core';
import { SKILL_DB, getSkill, getSkillUpgradeCost, getSkillScaledEffectValue } from '@/data/skills';

// ========== 辅助 ==========
const SKILL_TYPE_NAMES: Record<string, string> = {
  ATTACK: '攻击',
  DEFENSE: '防御',
  SUPPORT: '辅助',
  MOVEMENT: '身法',
  SPECIAL: '特殊',
};

const SKILL_TYPE_COLORS: Record<string, string> = {
  ATTACK: '#C0503D',
  DEFENSE: '#3A6B8C',
  SUPPORT: '#5B8C5A',
  MOVEMENT: '#A6893A',
  SPECIAL: '#7B5BA8',
};

// 境界顺序（Realm 枚举值按游戏进程排列）
const REALM_ORDER: Realm[] = [
  Realm.QI_REFINING,
  Realm.FOUNDATION,
  Realm.CORE_FORMATION,
  Realm.NASCENT_SOUL,
];

export const SkillTree: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const learnSkill = usePlayerStore((s) => s.learnSkill);
  const upgradeSkill = usePlayerStore((s) => s.upgradeSkill);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  if (!player) return null;

  const handleBack = () =>
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleLearn = (skillId: string) => {
    const skill = getSkill(skillId);
    if (!skill) return;
    if (player.gold < 50 && player.cultivation < 30) {
      showMessage('灵石或修为不足！需要 50灵石 或 30修为');
      return;
    }
    if (learnSkill(skillId)) {
      showMessage(`学会【${skill.name}】！`);
    } else {
      showMessage('学习失败，请检查条件');
    }
  };

  const handleUpgrade = (skillId: string) => {
    const learned = player.skills.find((s) => s.skillId === skillId);
    if (!learned) return;
    const cost = getSkillUpgradeCost(learned.level);
    if (player.gold < cost.gold || player.cultivation < cost.cultivation) {
      showMessage(`资源不足！需要 ${cost.gold}灵石 + ${cost.cultivation}修为`);
      return;
    }
    const result = upgradeSkill(skillId);
    if (result.success) {
      showMessage(`【${getSkill(skillId)?.name}】升至 ${learned.level + 1} 级！`);
    } else {
      showMessage('升级失败');
    }
  };

  // 判断技能解锁状态
  const getSkillState = (skillId: string): 'locked' | 'available' | 'learned' => {
    const skill = getSkill(skillId);
    if (!skill) return 'locked';

    const playerRealmIdx = REALM_ORDER.indexOf(player.realm as Realm);
    const skillRealmIdx = REALM_ORDER.indexOf(skill.requiredRealm);
    if (playerRealmIdx < skillRealmIdx) return 'locked';

    const learned = player.skills.find((s) => s.skillId === skillId);
    return learned ? 'learned' : 'available';
  };

  // 获取已学技能的等级
  const getSkillLevel = (skillId: string): number => {
    const learned = player.skills.find((s) => s.skillId === skillId);
    return learned?.level || 0;
  };

  return (
    <div className="page-container">
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div className="panel-title" style={{ marginBottom: 0 }}>📜 技能树</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
            已学 {player.skills.length}/{SKILL_DB.length} · 灵石 {player.gold} · 修为 {player.cultivation}
          </div>
        </div>
        <button className="btn btn-sm" onClick={handleBack}>← 返回</button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className="fade-in" style={{
          textAlign: 'center', padding: '8px 16px', marginBottom: 12,
          background: 'var(--brand-primary)', color: '#fff',
          borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500,
        }}>
          {message}
        </div>
      )}

      {/* 技能详情弹窗 */}
      {selectedSkill && (() => {
        const skill = getSkill(selectedSkill);
        if (!skill) return null;
        const state = getSkillState(selectedSkill);
        const level = getSkillLevel(selectedSkill);
        return (
          <div className="modal-overlay" onClick={() => setSelectedSkill(null)}>
            <div className="panel fade-in" style={{ maxWidth: 380, width: '100%', margin: 16 }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 2 }}>{skill.name}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{
                      fontSize: 11, padding: '1px 8px', borderRadius: 'var(--radius-full)',
                      background: SKILL_TYPE_COLORS[skill.type], color: '#fff',
                    }}>
                      {SKILL_TYPE_NAMES[skill.type]}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {CORE_REALM_NAMES[skill.requiredRealm] || skill.requiredRealm}
                    </span>
                    {level > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--brand-primary)', fontWeight: 600 }}>
                        Lv.{level}
                      </span>
                    )}
                  </div>
                </div>
                <button className="btn btn-sm" onClick={() => setSelectedSkill(null)}>✕</button>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                {skill.description}
              </p>

              {/* 属性 */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12,
                fontSize: 12,
              }}>
                <div style={{ color: 'var(--text-tertiary)' }}>
                  💠 MP 消耗: <b style={{ color: 'var(--text-primary)' }}>{skill.mpCost}</b>
                </div>
                <div style={{ color: 'var(--text-tertiary)' }}>
                  ⏱ 冷却: <b style={{ color: 'var(--text-primary)' }}>{skill.cooldown} 回合</b>
                </div>
                {skill.power > 0 && (
                  <div style={{ color: 'var(--text-tertiary)' }}>
                    ⚔️ 威力: <b style={{ color: SKILL_TYPE_COLORS.ATTACK }}>
                      {skill.power * (1 + (level - 1) * 0.15).toFixed(1)}x
                    </b>
                  </div>
                )}
                {skill.effects.map((eff, i) => (
                  <div key={i} style={{ color: 'var(--text-tertiary)' }}>
                    {effIcon(eff.type)} {effLabel(eff.type)}:{' '}
                    <b style={{ color: 'var(--text-primary)' }}>
                      {eff.type === 'DAMAGE' ? '攻击×威力' : getSkillScaledEffectValue(eff.value, Math.max(1, level))}
                      {eff.duration > 0 ? ` · ${eff.duration}回合` : ''}
                    </b>
                  </div>
                ))}
              </div>

              {/* 操作按钮 */}
              {state === 'locked' && (
                <div style={{
                  textAlign: 'center', padding: 8,
                  color: 'var(--text-disabled)', fontSize: 13,
                }}>
                  🔒 需要达到{CORE_REALM_NAMES[skill.requiredRealm] || skill.requiredRealm}解锁
                </div>
              )}
              {state === 'available' && (
                <button className="btn btn-primary btn-lg"
                  onClick={() => { handleLearn(selectedSkill); setSelectedSkill(null); }}
                  style={{ width: '100%' }}>
                  📖 学习（50灵石）
                </button>
              )}
              {state === 'learned' && level < 10 && (() => {
                const cost = getSkillUpgradeCost(level);
                return (
                  <button className="btn btn-lg" style={{
                    width: '100%', background: 'var(--brand-secondary)', color: '#fff', border: 'none',
                  }}
                    onClick={() => { handleUpgrade(selectedSkill); setSelectedSkill(null); }}>
                    ⬆ 升级至 Lv.{level + 1}（{cost.gold}灵石 + {cost.cultivation}修为）
                  </button>
                );
              })()}
              {state === 'learned' && level >= 10 && (
                <div style={{ textAlign: 'center', color: 'var(--color-gold)', fontSize: 13 }}>
                  ⭐ 已满级 (Lv.10)
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 技能列表（按境界分组） */}
      {REALM_ORDER.map((realmValue) => {
        const skills = SKILL_DB.filter((s) => s.requiredRealm === realmValue);
        if (skills.length === 0) return null;

        const realmName = CORE_REALM_NAMES[realmValue] || realmValue;
        const playerRealmIdx = REALM_ORDER.indexOf(player.realm as Realm);
        const sectionRealmIdx = REALM_ORDER.indexOf(realmValue);
        const isLocked = playerRealmIdx < sectionRealmIdx;

        return (
          <div key={realmName} style={{ marginBottom: 16 }}>
            {/* 境界标题 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
              opacity: isLocked ? 0.4 : 1,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isLocked ? 'var(--border-default)' : 'var(--brand-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 600,
              }}>
                {sectionRealmIdx + 1}
              </div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{realmName}</div>
              {isLocked && (
                <span style={{ fontSize: 11, color: 'var(--text-disabled)' }}>未解锁</span>
              )}
            </div>

            {/* 技能卡片 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {skills.map((skill) => {
                const state = getSkillState(skill.id);
                const level = getSkillLevel(skill.id);
                const isLockedSkill = state === 'locked';

                return (
                  <div key={skill.id}
                    className="card"
                    onClick={() => setSelectedSkill(skill.id)}
                    style={{
                      padding: '10px 12px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      opacity: isLockedSkill ? 0.45 : 1,
                      cursor: 'pointer',
                    }}>
                    {/* 类型图标 */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                      background: isLockedSkill ? 'var(--border-default)' : SKILL_TYPE_COLORS[skill.type] + '22',
                      border: `1.5px solid ${isLockedSkill ? 'var(--border-default)' : SKILL_TYPE_COLORS[skill.type]}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>
                      {skillTypeIcon(skill.type)}
                    </div>

                    {/* 技能信息 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          {skill.name}
                        </span>
                        {level > 0 && (
                          <span style={{
                            fontSize: 10, padding: '1px 6px',
                            background: 'var(--brand-primary)', color: '#fff',
                            borderRadius: 'var(--radius-full)',
                          }}>
                            Lv.{level}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        💠{skill.mpCost} {skill.cooldown > 0 ? `⏱${skill.cooldown}回合` : '无冷却'}
                        {' · '}
                        {skill.effects.slice(0, 2).map((e, i) => (
                          <span key={i}>{effIcon(e.type)}{effLabel(e.type)}{i < 1 && skill.effects.length > 1 ? ' + ' : ''}</span>
                        ))}
                      </div>
                    </div>

                    {/* 状态标签 */}
                    <div style={{ flexShrink: 0 }}>
                      {isLockedSkill && (
                        <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>🔒</span>
                      )}
                      {state === 'available' && (
                        <span style={{
                          fontSize: 10, padding: '2px 8px',
                          background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)',
                          color: 'var(--text-secondary)',
                        }}>
                          可学习
                        </span>
                      )}
                      {state === 'learned' && level < 10 && (
                        <span style={{
                          fontSize: 10, padding: '2px 8px',
                          background: 'var(--brand-secondary)', color: '#fff',
                          borderRadius: 'var(--radius-full)',
                        }}>
                          可升级
                        </span>
                      )}
                      {state === 'learned' && level >= 10 && (
                        <span style={{ fontSize: 10, color: 'var(--color-gold)' }}>⭐满级</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ========== 辅助图标 ==========
function skillTypeIcon(type: SkillType): string {
  switch (type) {
    case SkillType.ATTACK: return '⚔️';
    case SkillType.DEFENSE: return '🛡️';
    case SkillType.SUPPORT: return '💚';
    case SkillType.MOVEMENT: return '💨';
    case SkillType.SPECIAL: return '✨';
    default: return '❓';
  }
}

function effIcon(type: string): string {
  switch (type) {
    case 'DAMAGE': return '💥';
    case 'HEAL': return '💚';
    case 'BUFF': return '⬆️';
    case 'DEBUFF': return '⬇️';
    case 'SHIELD': return '🛡️';
    case 'DOT': return '🔥';
    case 'STUN': return '⚡';
    default: return '·';
  }
}

function effLabel(type: string): string {
  switch (type) {
    case 'DAMAGE': return '伤害';
    case 'HEAL': return '恢复';
    case 'BUFF': return '增益';
    case 'DEBUFF': return '减益';
    case 'SHIELD': return '护盾';
    case 'DOT': return '持续伤害';
    case 'STUN': return '麻痹';
    default: return type;
  }
}
