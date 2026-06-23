import React from 'react';

const LOCATIONS = [
  { id: 'huangfeng', name: '黄枫谷', desc: '太岳山脉七大宗门之一，以木系功法见长', x: 55, y: 35, color: '#5B8C5A', unlocked: true },
  { id: 'village', name: '青石村', desc: '落凤坡下的小村庄，凡人和低阶修士混居', x: 25, y: 55, color: '#8B7355', unlocked: true },
  { id: 'wolf_valley', name: '狼谷', desc: '银鬃狼群的领地，炼气修士历练之所', x: 70, y: 45, color: '#C0503D', unlocked: true },
  { id: 'mine', name: '太岳山矿洞', desc: '出产灵石和矿石的地下矿脉', x: 45, y: 25, color: '#C9A34A', unlocked: true },
  { id: 'lake', name: '水月湖', desc: '筑基秘境——水月秘境入口所在', x: 50, y: 70, color: '#4A7BA7', unlocked: false },
  { id: 'ruins', name: '断魂崖', desc: '古修士洞府遗迹，隐藏着筑基机缘', x: 80, y: 20, color: '#7B6BAA', unlocked: false },
  { id: 'city', name: '天南城', desc: '天南最大的修士交易城池', x: 60, y: 60, color: '#D4A830', unlocked: false },
];

export const WorldMap: React.FC = () => {
  const handleLocationClick = (loc: typeof LOCATIONS[0]) => {
    if (!loc.unlocked) return;
    window.dispatchEvent(new CustomEvent('navigate', {
      detail: { page: 'combat', params: { location: loc.id } },
    }));
  };

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  return (
    <div className="page-container" style={{ padding: 0, maxWidth: 'none' }}>
      {/* Map area */}
      <div style={{
        flex: 1, position: 'relative',
        backgroundImage: 'url(assets/backgrounds/bg_world_map.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        minHeight: '70vh', overflow: 'hidden',
      }}>
        {/* Back button */}
        <button
          onClick={handleBack}
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 10,
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', padding: '6px 14px',
            cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14,
          }}
        >
          ← 返回
        </button>

        {/* Locations */}
        {LOCATIONS.map((loc) => (
          <div
            key={loc.id}
            onClick={() => handleLocationClick(loc)}
            style={{
              position: 'absolute',
              left: `${loc.x}%`, top: `${loc.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: loc.unlocked ? 'pointer' : 'default',
              opacity: loc.unlocked ? 1 : 0.4,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              if (loc.unlocked) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
            }}
          >
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: loc.color, border: '2px solid #1A1A1A',
              margin: '0 auto',
            }} />
            <div style={{
              marginTop: 4, fontSize: 11, color: '#1A1A1A',
              textAlign: 'center', fontWeight: 600,
              textShadow: '0 1px 2px rgba(245,243,237,0.8)',
              whiteSpace: 'nowrap',
            }}>
              {loc.name}
            </div>
          </div>
        ))}
      </div>

      {/* Selected location info */}
      <div style={{
        padding: 16, background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-default)',
      }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          天南大地图
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          点击已解锁的地点前往历练。探索新区域以解锁更多地点。
        </p>
      </div>
    </div>
  );
};
