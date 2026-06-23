import React, { useState, useMemo } from 'react';
import { usePlayerStore, useCombatStore } from '@/data';
import { Realm, REALM_NAMES } from '@/core';
import {
  MAP_LOCATIONS, getLocationsByRealm, canAccessLocation,
  LOCATION_TYPE_CONFIG, LOCATION_ACTION_NAME,
  MapLocation, LocationAction,
} from '@/data/mapData';
import { getSkill } from '@/data/skills';

// ========== SVG 地形元素 ==========
const MOUNTAIN_PATHS = [
  'M40,60 Q48,25 55,40 Q62,18 68,42 Q76,22 82,48 L82,65 L40,65Z',
  'M75,15 Q82,0 88,14 Q94,2 100,18 L100,35 L75,35Z',
  'M55,10 Q62,-2 68,12 Q74,4 80,16 L80,28 L55,28Z',
];

const FOREST_CIRCLES = [
  { cx: 22, cy: 60, r: 12 },
  { cx: 18, cy: 68, r: 10 },
  { cx: 28, cy: 64, r: 14 },
  { cx: 35, cy: 72, r: 10 },
  { cx: 90, cy: 65, r: 14 },
  { cx: 94, cy: 72, r: 12 },
];

// 河流贝塞尔曲线
const RIVER_PATH = 'M15,30 Q30,25 45,38 Q55,48 60,60 Q65,75 55,85 Q40,95 20,90';

// 道路虚线
const ROAD_PATHS = [
  'M75,58 Q80,55 85,56',
  'M92,62 Q96,60 98,58',
];

export const WorldMap: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const getEffectiveAttributes = usePlayerStore((s) => s.getEffectiveAttributes);
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);
  const [showCombatSelect, setShowCombatSelect] = useState(false);

  const unlockedLocations = useMemo(() => {
    if (!player) return [];
    return getLocationsByRealm(player.realm as Realm);
  }, [player]);

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  // 处理地点动作
  const handleAction = (action: LocationAction) => {
    if (!selectedLoc || !player) return;

    switch (action) {
      case 'combat': {
        if ((selectedLoc.combatEnemies?.length || 0) > 1) {
          setShowCombatSelect(true);
          return;
        }
        startCombatAt(selectedLoc, selectedLoc.combatEnemies?.[0] || 'wolf');
        break;
      }
      case 'trade':
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'trading' } }));
        break;
      case 'rest':
        window.dispatchEvent(new CustomEvent('notification', {
          detail: { message: '🛌 在野外休整了一夜，HP和MP已恢复', type: 'success' },
        }));
        break;
      case 'explore':
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'secret-realm' } }));
        break;
      case 'quest':
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'sect' } }));
        break;
    }
  };

  const startCombatAt = (loc: MapLocation, enemyType: string) => {
    if (!player) return;

    const enemyData: Record<string, { name: string; attrs: any }> = {
      wolf:  { name: '银鬃狼', attrs: { hp:200,maxHp:200,mp:0,maxMp:0,attack:20,defense:10,speed:12,spirit:3,critRate:0.05,critDamage:1.5 } },
      ghost: { name: '幽灵鬼灵', attrs: { hp:150,maxHp:150,mp:40,maxMp:40,attack:15,defense:5,speed:18,spirit:5,critRate:0.1,critDamage:1.8 } },
      golem: { name: '石傀儡', attrs: { hp:350,maxHp:350,mp:0,maxMp:0,attack:25,defense:20,speed:6,spirit:2,critRate:0.02,critDamage:1.3 } },
      serpent: { name: '水蛇妖', attrs: { hp:180,maxHp:180,mp:30,maxMp:30,attack:18,defense:8,speed:15,spirit:4,critRate:0.08,critDamage:1.6 } },
    };

    const data = enemyData[enemyType] || enemyData.wolf;
    const effAttrs = getEffectiveAttributes();
    const allLearnedSkills = player.skills
      .map((ls) => { const s = getSkill(ls.skillId); return s ? { ...s, level: ls.level } : null; })
      .filter((s): s is NonNullable<typeof s> => !!s);

    const combat = useCombatStore.getState();
    combat.startCombat(
      {
        id: player.id, name: player.name, isPlayer: true,
        attributes: effAttrs, currentAttributes: { ...effAttrs },
        buffs: [], skills: allLearnedSkills,
        sprite: 'player_male', realm: player.realm,
      },
      {
        id: `enemy_${enemyType}_${Date.now()}`, name: data.name, isPlayer: false,
        attributes: { ...data.attrs }, currentAttributes: { ...data.attrs },
        buffs: [], skills: [],
        sprite: `sprite-enemy-${enemyType}`, realm: player.realm,
      },
    );

    window.dispatchEvent(new CustomEvent('navigate', {
      detail: { page: 'combat', params: { location: loc.id, enemyType } },
    }));
  };

  const typeCfg = selectedLoc ? LOCATION_TYPE_CONFIG[selectedLoc.type] : null;
  const isUnlocked = selectedLoc && player ? canAccessLocation(selectedLoc, player.realm as Realm) : false;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#1A1410', fontFamily: 'var(--font-ui), serif',
    }}>
      {/* ====== 顶部栏 ====== */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', background: 'rgba(42,34,24,0.95)',
        borderBottom: '1px solid rgba(180,140,80,0.3)',
      }}>
        <button onClick={handleBack}
          style={{
            background: 'rgba(120,100,60,0.2)', border: '1px solid rgba(180,140,80,0.4)',
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
            color: '#C9A34A', fontSize: 14,
          }}>
          ← 返回洞府
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-title), serif', color: '#D4A830', fontSize: 20, fontWeight: 700, letterSpacing: 4 }}>
            天 南 大 地 图
          </div>
          <div style={{ fontSize: 11, color: '#8B7355', marginTop: 2 }}>
            {player && `${REALM_NAMES[player.realm as Realm] || ''} · 已解锁 ${unlockedLocations.length}/${MAP_LOCATIONS.length} 处`}
          </div>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* ====== SVG 地图 ====== */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 100 82" style={{ width: '100%', height: '100%' }}>

          {/* 背景 */}
          <defs>
            <pattern id="parchment" patternUnits="userSpaceOnUse" width="100" height="82">
              <rect width="100" height="82" fill="#D4C4A8" opacity="0.02" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="0" dy="0.5" stdDeviation="0.3" floodColor="#000" floodOpacity="0.4" />
            </filter>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A7BA7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3A6B8C" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6B5B4A" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3A2A1A" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* 底色 */}
          <rect width="100" height="82" fill="#E8DCC8" opacity="0.08" />
          <rect width="100" height="82" fill="url(#parchment)" />

          {/* 山脉 */}
          {MOUNTAIN_PATHS.map((d, i) => (
            <path key={`mt-${i}`} d={d} fill="url(#mountainGrad)" stroke="#5B4A3A" strokeWidth="0.2" opacity="0.7" />
          ))}
          {/* 山脉纹理线 */}
          <path d="M44,45 L48,35 L52,40 L58,32 L62,38 L68,28 L72,40" fill="none" stroke="#5B4A3A" strokeWidth="0.3" opacity="0.3" />
          <path d="M78,18 L82,14 L86,20 L92,16 L96,22" fill="none" stroke="#5B4A3A" strokeWidth="0.3" opacity="0.3" />
          {/* 山脉名称 */}
          <text x="48" y="32" fill="#6B5B4A" fontSize="2.2" fontWeight="600" opacity="0.5" fontFamily="var(--font-title), serif">太 岳 山 脉</text>

          {/* 森林 */}
          {FOREST_CIRCLES.map((c, i) => (
            <circle key={`fc-${i}`} cx={c.cx} cy={c.cy} r={c.r} fill="#4A6B3A" opacity="0.15" />
          ))}
          <text x="18" y="55" fill="#4A6B3A" fontSize="1.8" fontWeight="500" opacity="0.4" fontFamily="var(--font-title), serif">落凤密林</text>

          {/* 河流 */}
          <path d={RIVER_PATH} fill="none" stroke="url(#riverGrad)" strokeWidth="1.8" opacity="0.5" />
          <path d={RIVER_PATH} fill="none" stroke="#6A9BBB" strokeWidth="0.4" opacity="0.2" strokeDasharray="1,0.5" />
          <text x="52" y="76" fill="#4A7BA7" fontSize="1.6" fontWeight="500" opacity="0.35" fontFamily="var(--font-title), serif">天 南 河</text>

          {/* 道路 */}
          <path d="M32,35 Q40,48 55,50 Q60,52 60,58" fill="none" stroke="#8B7355" strokeWidth="0.4" strokeDasharray="2,1" opacity="0.4" />
          <path d="M52,68 L55,50" fill="none" stroke="#8B7355" strokeWidth="0.35" strokeDasharray="2,1" opacity="0.3" />
          <path d="M60,58 Q68,50 68,40" fill="none" stroke="#8B7355" strokeWidth="0.35" strokeDasharray="2,1" opacity="0.35" />
          <path d="M68,40 L88,55" fill="none" stroke="#8B7355" strokeWidth="0.3" strokeDasharray="3,2" opacity="0.25" />

          {/* 地点节点 */}
          {MAP_LOCATIONS.map((loc) => {
            const accessible = !player || canAccessLocation(loc, player.realm as Realm);
            const isSelected = selectedLoc?.id === loc.id;
            const cfg = LOCATION_TYPE_CONFIG[loc.type];

            return (
              <g
                key={loc.id}
                style={{ cursor: accessible ? 'pointer' : 'default', opacity: accessible ? 1 : 0.35 }}
                onClick={() => accessible && setSelectedLoc(loc)}
              >
                {/* 选中光圈 */}
                {isSelected && (
                  <circle
                    cx={loc.x} cy={loc.y} r={6}
                    fill="none" stroke="#D4A830" strokeWidth="0.6" strokeDasharray="2,1"
                    opacity="0.8"
                  >
                    <animateTransform attributeName="transform" type="rotate" from="0 ${loc.x} ${loc.y}" to="360 ${loc.x} ${loc.y}" dur="12s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* 底座阴影 */}
                <ellipse cx={loc.x} cy={loc.y + 1.5} rx={2.2} ry={0.6} fill="#000" opacity="0.3" />

                {/* 地点标记 */}
                <rect x={loc.x - 2} y={loc.y - 2} width={4} height={4} rx={0.8}
                  fill={accessible ? cfg.color : '#666'} stroke="#1A1A1A" strokeWidth="0.2"
                  filter={isSelected ? 'url(#shadow)' : undefined}
                />

                {/* 未解锁锁标记 */}
                {!accessible && (
                  <>
                    <text x={loc.x} y={loc.y} textAnchor="middle" dominantBaseline="central" fontSize="2" fill="#fff" opacity="0.7">🔒</text>
                  </>
                )}

                {/* 名称标签 */}
                <text x={loc.x} y={loc.y - 3.2} textAnchor="middle"
                  fill={accessible ? '#2A1A0A' : '#666'}
                  fontSize="1.8" fontWeight="600"
                  fontFamily="var(--font-title), serif"
                  style={{ textShadow: accessible ? '0 1px 2px rgba(255,255,255,0.3)' : undefined }}
                >
                  {loc.name}
                </text>

                {/* 图标 */}
                <text x={loc.x} y={loc.y} textAnchor="middle" dominantBaseline="central"
                  fontSize="2.5" filter={isSelected ? 'url(#shadow)' : undefined}>
                  {loc.icon}
                </text>
              </g>
            );
          })}

          {/* 图例 */}
          <g transform="translate(2, 78)">
            <rect x="0" y="0" width="36" height="3.5" rx="0.5" fill="rgba(26,20,10,0.7)" stroke="rgba(180,140,80,0.3)" strokeWidth="0.15" />
            {([['sect','宗门'],['wild','野外'],['city','城市'],['realm','秘境'],['mine','矿脉'],['faction','势力']] as [LocationType, string][]).map(([type, label], i) => {
              const cfg = LOCATION_TYPE_CONFIG[type];
              return (
                <g key={type} transform={`translate(${2 + i * 5.8}, 1.8)`}>
                  <rect x="0" y="-0.4" width="1.6" height="1.2" rx="0.3" fill={cfg.color} opacity="0.8" />
                  <text x="2" y="0.5" fill="#8B7355" fontSize="1.3" fontFamily="var(--font-ui), serif">{label}</text>
                </g>
              );
            })}
          </g>

          {/* 东南注释 */}
          <text x="78" y="62" fill="#8B7355" fontSize="1.4" fontStyle="italic" opacity="0.35" fontFamily="var(--font-title), serif">→ 东海·乱星海</text>
        </svg>

        {/* 战斗子选择浮层 */}
        {showCombatSelect && selectedLoc && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(26,20,10,0.95)', borderRadius: 12,
            border: '2px solid #C9A34A', padding: 20, zIndex: 20,
            minWidth: 240, boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }}>
            <div style={{ color: '#C9A34A', fontSize: 15, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
              选择要挑战的对手
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(selectedLoc.combatEnemies || ['wolf']).map((enemy) => {
                const nameMap: Record<string, string> = { wolf: '🐺 银鬃狼', ghost: '👻 幽灵鬼灵', golem: '🪨 石傀儡', serpent: '🐍 水蛇妖' };
                return (
                  <button
                    key={enemy}
                    onClick={() => { setShowCombatSelect(false); startCombatAt(selectedLoc, enemy); }}
                    style={{
                      background: 'rgba(120,100,60,0.15)', border: '1px solid rgba(180,140,80,0.4)',
                      borderRadius: 8, padding: '10px 16px', cursor: 'pointer',
                      color: '#D4C4A8', fontSize: 14, textAlign: 'left',
                    }}
                  >
                    {nameMap[enemy] || enemy}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowCombatSelect(false)}
              style={{
                marginTop: 12, width: '100%', background: 'rgba(192,80,61,0.15)',
                border: '1px solid rgba(192,80,61,0.4)', borderRadius: 8, padding: '8px',
                cursor: 'pointer', color: '#C0503D', fontSize: 13,
              }}
            >
              取消
            </button>
          </div>
        )}

        {/* 地点详情面板 */}
        {selectedLoc && !showCombatSelect && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(0deg, rgba(26,20,10,0.98) 0%, rgba(26,20,10,0.9) 100%)',
            borderTop: '1px solid rgba(180,140,80,0.4)',
            padding: '14px 18px',
            animation: 'slideUp 0.25s ease-out',
          }}>
            <style>{`
              @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            {/* 标题行 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{selectedLoc.icon}</span>
                <div>
                  <div style={{ color: '#D4A830', fontSize: 17, fontWeight: 700 }}>{selectedLoc.name}</div>
                  {typeCfg && (
                    <span style={{
                      display: 'inline-block', fontSize: 11, padding: '1px 8px', borderRadius: 4,
                      background: typeCfg.bgColor, color: typeCfg.color, border: `1px solid ${typeCfg.color}33`,
                    }}>
                      {typeCfg.label}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedLoc(null)}
                style={{
                  background: 'none', border: 'none', color: '#8B7355', fontSize: 20, cursor: 'pointer', padding: '4px 8px',
                }}>
                ✕
              </button>
            </div>

            {/* 描述 */}
            <p style={{ color: '#9B8B7A', fontSize: 12.5, lineHeight: 1.6, marginBottom: 10 }}>
              {selectedLoc.description}
            </p>

            {/* 解锁状态 */}
            {!isUnlocked && (
              <div style={{
                background: 'rgba(192,80,61,0.1)', border: '1px solid rgba(192,80,61,0.3)',
                borderRadius: 8, padding: '8px 12px', marginBottom: 10,
                color: '#C0503D', fontSize: 12.5, textAlign: 'center',
              }}>
                🔒 需要达到 <strong>{REALM_NAMES[selectedLoc.requiredRealm]}</strong> 解锁
              </div>
            )}

            {/* 动作按钮 */}
            {isUnlocked && selectedLoc.actions.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedLoc.actions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleAction(action)}
                    style={{
                      flex: 1, minWidth: 80,
                      background: action === 'combat' ? 'rgba(192,80,61,0.15)' : 'rgba(180,140,80,0.1)',
                      border: `1px solid ${action === 'combat' ? 'rgba(192,80,61,0.4)' : 'rgba(180,140,80,0.3)'}`,
                      borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                      color: action === 'combat' ? '#C0503D' : '#C9A34A', fontSize: 13, fontWeight: 500,
                    }}
                  >
                    {LOCATION_ACTION_NAME[action]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
