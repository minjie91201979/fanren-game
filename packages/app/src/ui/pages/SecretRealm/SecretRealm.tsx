import React from 'react';

const REALMS = [
  { id: 'wolf_valley', name: '妖兽巢穴·狼谷', realm: '炼气期', difficulty: '简单', desc: '银鬃狼的领地，适合初入仙途者历练。', unlocked: true, bg: '/backgrounds/bg_combat_forest.png' },
  { id: 'mine', name: '太岳山矿洞', realm: '炼气期', difficulty: '普通', desc: '废弃灵石矿洞，偶有石傀出没。', unlocked: true, bg: '/backgrounds/bg_dungeon_cave.png' },
  { id: 'ruins', name: '断魂崖洞府', realm: '炼气期', difficulty: '普通', desc: '古修士坐化洞府，隐藏着筑基机缘。主线秘境。', unlocked: true, isMain: true, bg: '/backgrounds/bg_combat_ruins.png' },
  { id: 'blood_cave', name: '血蝠洞', realm: '筑基期', difficulty: '困难', desc: '赤血蝠群巢穴，弥漫着血腥之气。', unlocked: false, bg: '/backgrounds/bg_dungeon_cave.png' },
  { id: 'wind_valley', name: '阴风峡谷', realm: '筑基期', difficulty: '困难', desc: '常年阴风怒号，传闻有妖兽盘踞。', unlocked: false, bg: '/backgrounds/bg_combat_ruins.png' },
  { id: 'water_moon', name: '水月秘境', realm: '筑基期', difficulty: '极难', desc: '水系秘境，共三层。主线秘境。', unlocked: false, isMain: true, bg: '/backgrounds/bg_combat_forest.png' },
  { id: 'demon_cave', name: '天魔石窟', realm: '结丹期', difficulty: '恐怖', desc: '上古天魔遗迹，步步杀机。', unlocked: false, bg: '/backgrounds/bg_dungeon_cave.png' },
  { id: 'forge', name: '天火铸剑炉', realm: '结丹期', difficulty: '恐怖', desc: '天火燃烧万年之地，传说有神器。', unlocked: false, bg: '/backgrounds/bg_combat_ruins.png' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  '简单': '#5B8C5A',
  '普通': '#4A7BA7',
  '困难': '#C9A34A',
  '极难': '#C0503D',
  '恐怖': '#7B6BAA',
};

export const SecretRealm: React.FC = () => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const selectedRealm = REALMS.find(r => r.id === selected);

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  const handleEnter = (id: string) => {
    setSelected(id);
  };

  const handleStart = () => {
    if (!selectedRealm) return;
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'combat', params: { location: selectedRealm.id } } }));
  };

  return (
    <div className="page-container" style={{ padding: 0, maxWidth: 'none' }}>
      {/* 秘境背景预览 */}
      {selectedRealm && (
        <div style={{
          height: 180, backgroundImage: `url(${selectedRealm.bg})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          position: 'relative', overflow: 'hidden',
          borderBottom: '1px solid var(--border-default)',
        }}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 16px',
            background: 'linear-gradient(transparent, rgba(245,243,237,0.95))',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedRealm.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {selectedRealm.realm} · {selectedRealm.desc}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
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
            background: selected === realm.id ? 'var(--bg-hover)' : undefined,
          }} onClick={() => realm.unlocked && handleEnter(realm.id)}>
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
            {/* 探索度 */}
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

        {/* 进入按钮 */}
        {selected && (
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12 }}
            onClick={handleStart} disabled={!selectedRealm?.unlocked}>
            ⚔️ 进入秘境
          </button>
        )}
      </div>
    </div>
  );
};
