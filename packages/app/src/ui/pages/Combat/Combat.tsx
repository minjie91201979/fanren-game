import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCombatStore, usePlayerStore } from '@/data';
import { CombatAction } from '@/core';
import { getSkill, SKILL_DB } from '@/data/skills';

export const Combat: React.FC = () => {
  const combat = useCombatStore();
  const player = usePlayerStore((s) => s.player);
  const getEffectiveAttributes = usePlayerStore((s) => s.getEffectiveAttributes);
  const [started, setStarted] = useState(false);
  const [enemySprite, setEnemySprite] = useState('sprite-enemy-wolf');
  const [autoBattle, setAutoBattle] = useState(() => {
    try { return localStorage.getItem('autoBattle') === 'true'; } catch { return false; }
  });
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 检测是否有已激活的战斗（从地图直接进入时）
  useEffect(() => {
    if (combat.isActive) {
      setStarted(true);
      if (combat.enemy?.sprite) setEnemySprite(combat.enemy.sprite);
    }
  }, []);

  // 自动战斗状态变更时写入 localStorage
  useEffect(() => {
    try { localStorage.setItem('autoBattle', String(autoBattle)); } catch {}
  }, [autoBattle]);

  // 当前可用的攻击技能列表（已学会的 ATTACK 类型技能）
  const attackSkills = player
    ? player.skills
        .map((ls) => getSkill(ls.skillId))
        .filter((s): s is NonNullable<typeof s> => !!s && s.type === 'ATTACK')
    : [];

  // 当前可用的所有已学技能
  const allLearnedSkills = player
    ? player.skills
        .map((ls) => {
          const skill = getSkill(ls.skillId);
          return skill ? { ...skill, level: ls.level } : null;
        })
        .filter((s): s is NonNullable<typeof s> => !!s)
    : [];

  // ====== 自动战斗：轮到玩家时自动攻击 ======
  useEffect(() => {
    if (!autoBattle || !combat.isActive || !combat.enemy || combat.turn !== 'PLAYER') {
      return;
    }

    autoTimerRef.current = setTimeout(() => {
      // 自动战斗：优先使用威力最高的攻击技能，其次普攻
      const bestAttackSkill = attackSkills.length > 0
        ? attackSkills.reduce((best, s) => {
            const level = player?.skills.find((ls) => ls.skillId === s.id)?.level || 1;
            const onCd = combat.cooldowns?.find((c) => c.skillId === s.id);
            if ((onCd && onCd.remainingTurns > 0) || (combat.player?.currentAttributes.mp || 0) < s.mpCost) return best;
            const power = s.power * (1 + (level - 1) * 0.15);
            return power > (best?.power || 0) * (1 + ((best ? player?.skills.find((ls) => ls.skillId === best.id)?.level : 1) || 1) * 0.15 - 0.15) ? s : best;
          }, attackSkills[0] as any)
        : null;

      const mp = combat.player?.currentAttributes.mp || 0;
      if (bestAttackSkill && mp >= bestAttackSkill.mpCost) {
        combat.executeAction({ type: 'SKILL', skillId: bestAttackSkill.id });
      } else {
        combat.executeAction({ type: 'ATTACK' });
      }
    }, 900);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [autoBattle, combat.isActive, combat.turn, combat.turnCount, combat.cooldowns]);

  // ====== 清理 ======
  useEffect(() => {
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current); };
  }, []);

  // ====== 手动操作 ======
  const doAction = useCallback((action: CombatAction) => {
    if (autoBattle) setAutoBattle(false);
    combat.executeAction(action);
  }, [autoBattle, combat]);

  const toggleAutoBattle = useCallback(() => {
    if (!combat.isActive) return;
    setAutoBattle((prev) => !prev);
  }, [combat.isActive]);

  // ====== 开始战斗 ======
  const handleStartCombat = (enemyType?: string) => {
    if (!player) return;

    const enemyData: Record<string, { name: string; attrs: any; sprite: string }> = {
      wolf:   { name: '银鬃狼',   attrs: { hp:200,maxHp:200,mp:0,maxMp:0,attack:20,defense:10,speed:12,spirit:3,critRate:0.05,critDamage:1.5 }, sprite:'sprite-enemy-wolf' },
      ghost:  { name: '幽灵鬼灵',  attrs: { hp:150,maxHp:150,mp:40,maxMp:40,attack:15,defense:5,speed:18,spirit:5,critRate:0.1,critDamage:1.8 },  sprite:'sprite-enemy-ghost' },
      golem:  { name: '石傀儡',   attrs: { hp:350,maxHp:350,mp:0,maxMp:0,attack:25,defense:20,speed:6,spirit:2,critRate:0.02,critDamage:1.3 }, sprite:'sprite-enemy-golem' },
      serpent:{ name: '水蛇妖',   attrs: { hp:180,maxHp:180,mp:30,maxMp:30,attack:18,defense:8,speed:15,spirit:4,critRate:0.08,critDamage:1.6 },  sprite:'sprite-enemy-serpent' },
    };

    const data = enemyData[enemyType || 'wolf'];

    // 使用有效属性（基础+装备+功法加成）
    const effAttrs = getEffectiveAttributes();

    const playerUnit = {
      id: player.id,
      name: player.name,
      isPlayer: true,
      attributes: effAttrs,
      currentAttributes: { ...effAttrs },
      buffs: [],
      skills: allLearnedSkills,
      sprite: 'player_male',
      realm: player.realm,
    };

    const enemyUnit = {
      id: `enemy_${enemyType || 'wolf'}`,
      name: data.name,
      isPlayer: false,
      attributes: { ...data.attrs },
      currentAttributes: { ...data.attrs },
      buffs: [],
      skills: [],
      sprite: data.sprite,
      realm: player.realm,
    };

    setEnemySprite(data.sprite);
    combat.startCombat(playerUnit, enemyUnit);
    setStarted(true);
  };

  const handleBack = () => {
    combat.endCombat();
    setStarted(false);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  // ====== 预估值 ======
  const playerHpPct = combat.player ? (combat.player.currentAttributes.hp / combat.player.attributes.maxHp) * 100 : 100;
  const enemyHpPct  = combat.enemy  ? (combat.enemy.currentAttributes.hp  / combat.enemy.attributes.maxHp)  * 100 : 100;
  const playerMpPct = combat.player ? (combat.player.currentAttributes.mp / Math.max(1, combat.player.attributes.maxMp)) * 100 : 100;

  // 判断冷却
  const getCdRemaining = (skillId: string): number => {
    const cd = combat.cooldowns?.find((c) => c.skillId === skillId);
    return cd?.remainingTurns || 0;
  };

  return (
    <div className="page-container" style={{ padding: 0, maxWidth: 'none' }}>
      {/* ===== 选择对手 ===== */}
      {!started && (
        <div className="bg-cover bg-combat-forest bg-overlay" style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
        }}>
          <div className="panel fade-in" style={{ maxWidth: 480, width: '90%', textAlign: 'center' }}>
            <div className="panel-title">外出历练</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              选择历练地点，与妖兽战斗以磨炼自身。击败妖兽可获得修为与宝物。
            </p>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8, textAlign: 'left' }}>选择对手</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[{key:'wolf',label:'狼谷·简单'},{key:'ghost',label:'幽林·普通'},{key:'golem',label:'矿洞·困难'},{key:'serpent',label:'水畔·普通'}].map(({key,label})=>(
                  <button key={key} className="btn btn-sm" onClick={()=>handleStartCombat(key)}
                    style={{padding:12,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div className="sprite-bg sprite-enemy" style={{width:48,height:48,backgroundPosition:
                      key==='wolf'?'0% 100%':key==='ghost'?'0% 0%':key==='golem'?'100% 0%':'100% 100%'
                    }}/>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-sm" onClick={handleBack} style={{ width: '100%', marginTop: 8 }}>← 返回洞府</button>
          </div>
        </div>
      )}

      {/* ===== 战斗进行中 ===== */}
      {started && combat.isActive && (
        <div className="fade-in" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(180deg, #2A3A2A 0%, #1A2A1A 40%, #0A1A0A 100%)',
          minHeight: '100vh', position: 'relative',
        }}>
          {/* 顶部信息栏 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 20px', background: 'rgba(245,243,237,0.9)',
            borderBottom: '1px solid var(--border-default)',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>回合 {combat.turnCount}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: combat.turn === 'PLAYER' ? 'var(--color-green)' : 'var(--brand-danger)' }}>
              {autoBattle ? '🤖 自动战斗中...' : combat.turn === 'PLAYER' ? '🗡️ 我方行动' : '⚡ 敌方行动中...'}
            </div>
            <button className="btn btn-sm" onClick={handleBack} style={{ opacity: 0.7 }}>撤退</button>
          </div>

          {/* 自动战斗横幅 */}
          {autoBattle && (
            <div style={{ textAlign:'center',padding:'6px 12px',background:'rgba(139,109,82,0.15)',borderBottom:'1px solid rgba(139,109,82,0.3)',fontSize:12,color:'var(--brand-primary)' }}>
              ⚡ 自动战斗模式 · 点击下方开关可随时关闭
            </div>
          )}

          {/* 战斗场景 */}
          <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'space-around',padding:'0 40px',position:'relative' }}>
            {/* 玩家 */}
            <div style={{ textAlign: 'center' }}>
              <div className="sprite-bg sprite-player-combat" style={{ marginBottom:8,filter:combat.turn==='ENEMY'?'none':'drop-shadow(0 0 8px rgba(91,140,90,0.5))',transition:'filter 0.3s' }} />
              <div style={{ fontWeight:600,color:'#F5F3ED',textShadow:'0 1px 3px rgba(0,0,0,0.8)' }}>{combat.player?.name}</div>
              <div className="progress-bar" style={{ width:120,marginTop:4,height:10,background:'rgba(0,0,0,0.4)' }}>
                <div className="progress-bar-fill progress-hp" style={{ width:`${playerHpPct}%`,background:playerHpPct<30?'#C0503D':'#5B8C5A' }} />
              </div>
              <div style={{ fontSize:11,color:'rgba(245,243,237,0.7)',marginTop:2 }}>{combat.player?.currentAttributes.hp}/{combat.player?.attributes.maxHp}</div>
              {/* MP 条 */}
              {combat.player && (combat.player.attributes.maxMp || 0) > 0 && (
                <div style={{ marginTop:4 }}>
                  <div className="progress-bar" style={{ width:120,height:6,background:'rgba(0,0,0,0.4)' }}>
                    <div className="progress-bar-fill" style={{ width:`${playerMpPct}%`,background:'#3A6B8C',height:6 }} />
                  </div>
                  <div style={{ fontSize:10,color:'rgba(245,243,237,0.5)',marginTop:1 }}>MP {combat.player.currentAttributes.mp}/{combat.player.attributes.maxMp}</div>
                </div>
              )}
            </div>

            <div style={{ fontSize:28,color:'#C0503D',fontWeight:700,textShadow:'0 0 10px rgba(192,80,61,0.5)' }}>VS</div>

            {/* 敌人 */}
            <div style={{ textAlign: 'center' }}>
              <div className={`sprite-bg sprite-enemy-combat ${enemySprite}`} style={{ marginBottom:8,filter:combat.turn==='PLAYER'?'none':'drop-shadow(0 0 8px rgba(192,80,61,0.5))',transition:'filter 0.3s' }} />
              <div style={{ fontWeight:600,color:'#F5F3ED',textShadow:'0 1px 3px rgba(0,0,0,0.8)' }}>{combat.enemy?.name}</div>
              <div className="progress-bar" style={{ width:120,marginTop:4,height:10,background:'rgba(0,0,0,0.4)' }}>
                <div className="progress-bar-fill progress-hp" style={{ width:`${enemyHpPct}%`,background:enemyHpPct<30?'#8B6D52':'#C0503D' }} />
              </div>
              <div style={{ fontSize:11,color:'rgba(245,243,237,0.7)',marginTop:2 }}>{combat.enemy?.currentAttributes.hp}/{combat.enemy?.attributes.maxHp}</div>
            </div>
          </div>

          {/* 操作区域 */}
          <div style={{ padding:16,background:'rgba(245,243,237,0.95)',borderTop:'1px solid var(--border-default)' }}>
            {/* 自动战斗开关 */}
            <div style={{ display:'flex',justifyContent:'center',marginBottom:combat.turn==='PLAYER'?10:0 }}>
              <label className="toggle-track" onClick={toggleAutoBattle}>
                <span className={`toggle-switch ${autoBattle?'auto':''}`} />
                <span style={{ fontWeight:500 }}>{autoBattle?'自动战斗 开':'自动战斗 关'}</span>
              </label>
            </div>

            {/* 玩家回合：技能按钮 + 普攻/防御/逃跑 */}
            {combat.turn === 'PLAYER' && !autoBattle && (
              <>
                {/* 已学技能 */}
                {allLearnedSkills.length > 0 && (
                  <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:10,justifyContent:'center' }}>
                    {allLearnedSkills.map((skill) => {
                      const cd = getCdRemaining(skill.id);
                      const onCd = cd > 0;
                      const mpOk = (combat.player?.currentAttributes.mp || 0) >= skill.mpCost;
                      const level = player?.skills.find((ls) => ls.skillId === skill.id)?.level || 1;
                      return (
                        <button
                          key={skill.id}
                          className={`btn btn-sm ${onCd || !mpOk ? '' : 'btn-primary'}`}
                          onClick={() => doAction({ type: 'SKILL', skillId: skill.id })}
                          disabled={onCd || !mpOk}
                          title={skill.description}
                          style={{ opacity: onCd || !mpOk ? 0.5 : 1, fontSize: 12, padding: '6px 10px' }}
                        >
                          {skillTypeEmoji(skill.type)} {skill.name} Lv.{level}
                          <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>
                            💠{skill.mpCost}
                          </span>
                          {onCd && <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--brand-danger)' }}>⏳{cd}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 基础操作 */}
                <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
                  <button className="btn btn-primary" onClick={() => doAction({ type: 'ATTACK' })}>🗡️ 攻击</button>
                  <button className="btn" onClick={() => doAction({ type: 'DEFEND' })}>🛡️ 防御</button>
                  <button className="btn" onClick={() => doAction({ type: 'FLEE' })}>🏃 逃跑</button>
                </div>
              </>
            )}

            {combat.turn === 'PLAYER' && autoBattle && (
              <div style={{ textAlign:'center',color:'var(--text-tertiary)',fontSize:13,padding:4 }}>⏳ 自动攻击中...</div>
            )}
            {combat.turn === 'ENEMY' && (
              <div style={{ textAlign:'center',color:'var(--text-tertiary)',fontSize:13,padding:4 }}>
                {autoBattle?'⏳ 敌方行动中...':'等待敌方行动...'}
              </div>
            )}
          </div>

          {/* 战斗日志 */}
          <div style={{ maxHeight:80,overflow:'auto',padding:'6px 16px',background:'rgba(26,26,26,0.85)',color:'#F5F3ED',fontSize:12,borderTop:'1px solid rgba(208,208,208,0.2)' }}>
            {combat.log.slice(-3).map((line,i)=>(<div key={i} style={{marginBottom:2,opacity:0.9}}>{line}</div>))}
          </div>
        </div>
      )}

      {/* ===== 战斗结果 ===== */}
      {started && combat.result && (
        <div className="bg-cover bg-breakthrough" style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',position:'relative' }}>
          <div className="panel fade-in" style={{ maxWidth:400,width:'90%',textAlign:'center',background:'rgba(245,243,237,0.95)' }}>
            <div style={{ fontSize:48,marginBottom:16 }}>{combat.result.victory?'🎉':'💀'}</div>
            <div className="panel-title" style={{ fontSize:20 }}>{combat.result.victory?'战斗胜利！':'战斗失败...'}</div>
            <p style={{ color:'var(--text-secondary)',marginBottom:20 }}>
              {combat.result.victory?'你击败了敌人，获得了宝贵的战斗经验和战利品。':'被击败了，回到洞府休养吧。'}
            </p>
            {combat.result.victory && combat.result.rewards && (
              <div style={{ marginBottom:20,display:'flex',justifyContent:'center',gap:16 }}>
                <span style={{ color:'var(--color-gold)',fontWeight:600,fontSize:15 }}>💰 +{((combat.result.rewards as any).gold||50)} 灵石</span>
                <span style={{ color:'var(--color-green)',fontWeight:600,fontSize:15 }}>⚡ +{((combat.result.rewards as any).cultivation||30)} 修为</span>
              </div>
            )}
            <button className="btn btn-primary" onClick={handleBack}>返回洞府</button>
          </div>
        </div>
      )}
    </div>
  );
};

function skillTypeEmoji(type: string): string {
  switch (type) {
    case 'ATTACK': return '⚔️';
    case 'DEFENSE': return '🛡️';
    case 'SUPPORT': return '💚';
    case 'MOVEMENT': return '💨';
    case 'SPECIAL': return '✨';
    default: return '';
  }
}
