import React from 'react';

const REALMS = [
  { id: 'wolf_valley', name: '妖兽巢穴·狼谷', realm: '炼气期', difficulty: '简单', desc: '银鬃狼的领地，适合初入仙途者历练。', unlocked: true },
  { id: 'mine', name: '太岳山矿洞', realm: '炼气期', difficulty: '普通', desc: '废弃灵石矿洞，偶有石傀出没。', unlocked: true },
  { id: 'ruins', name: '断魂崖洞府', realm: '炼气期', difficulty: '普通', desc: '古修士坐化洞府，隐藏着筑基机缘。主线秘境。', unlocked: true, isMain: true },
  { id: 'blood_cave', name: '血蝠洞', realm: '筑基期', difficulty: '困难', desc: '赤血蝠群巢穴，弥漫着血腥之气。', unlocked: false },
  { id: 'wind_valley', name: '阴风峡谷', realm: '筑基期', difficulty: '困难', desc: '常年阴风怒号，传闻有妖兽盘踞。', unlocked: false },
  { id: 'water_moon', name: '水月秘境', realm: '筑基期', difficulty: '极难', desc: '水系秘境，共三层。主线秘境。', unlocked: false, isMain: true },
  { id: 'demon_cave', name: '天魔石窟', realm: '结丹期', difficulty: '恐怖', desc: '上古天魔遗迹，步步杀机。', unlocked: false },
  { id: 'forge', name: '天火铸剑炉', realm: '结丹期', difficulty: '恐怖', desc: '天火燃烧万年之地，传说有神器。', unlocked: false },
];

export const SecretRealm: React.FC = () => {
  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>秘境</div>
        <button className="btn btn-sm" onClick={handleBack}>← 返回</button>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
        秘境是获取高阶材料、功法和机缘的主要途径。标记<span style={{ color: 'var(--color-gold)' }}>金色</span>的为主线秘境。
      </p>

      {REALMS.map((realm) => (
        <div key={realm.id} className="card" style={{
          padding: '12px 16px', marginBottom: 10,
          opacity: realm.unlocked ? 1 : 0.5,
          borderLeft: realm.isMain ? '3px solid var(--color-gold)' : '1px solid var(--border-default)',
          cursor: realm.unlocked ? 'pointer' : 'default',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                {realm.isMain && <span style={{ color: 'var(--color-gold)', fontSize: 12 }}>★主线</span>}
                {realm.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {realm.desc}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: 12, padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                background: DIFFICULTY_COLORS[realm.difficulty] || 'var(--bg-elevated)',
                color: '#fff',
              }}>
                {realm.difficulty}
              </span>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {realm.realm}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{
            marginTop: 8, height: 3, background: 'var(--bg-elevated)',
            borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: realm.unlocked ? '30%' : '0%',
              background: 'var(--brand-primary)', borderRadius: 2,
            }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 4 }}>
            {realm.unlocked ? '探索度 30%' : '未解锁'}
          </div>
        </div>
      ))}
    </div>
  );
};

const DIFFICULTY_COLORS: Record<string, string> = {
  '简单': '#5B8C5A',
  '普通': '#4A7BA7',
  '困难': '#C9A34A',
  '极难': '#C0503D',
  '恐怖': '#7B6BAA',
};
