import React from 'react';
import { usePlayerStore } from '@fanren/data';

const NPC_LIST = [
  { id: 'elder_liu', name: '柳云鹤', title: '黄枫谷执事', role: '引路人', realm: '筑基期', affinity: 60, desc: '引你入仙途的修士，沉稳可靠。' },
  { id: 'elder_wang', name: '王长老', title: '炼气堂长老', role: '导师', realm: '筑基期', affinity: 30, desc: '负责教导新入门弟子基础功法。' },
  { id: 'disciple_zhang', name: '张铁柱', title: '外门弟子', role: '同伴', realm: '炼气期', affinity: 45, desc: '同期入门的外门弟子，憨厚老实。' },
  { id: 'disciple_lin', name: '林婉儿', title: '内门弟子', role: '同伴', realm: '筑基期', affinity: 20, desc: '天资卓越的内门师姐，性格清冷。' },
];

export const Sect: React.FC = () => {
  const player = usePlayerStore((s) => s.player);

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>黄枫谷</div>
        <button className="btn btn-sm" onClick={handleBack}>← 返回</button>
      </div>

      {/* Sect info */}
      <div className="card" style={{
        backgroundImage: 'url(assets/backgrounds/bg_huangfeng_valley.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        height: 150, marginBottom: 16, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 16px',
          background: 'linear-gradient(transparent, rgba(240,237,228,0.95))',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>黄枫谷</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            太岳山脉 · 七大宗门之一
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-lg" style={{ padding: 16 }}>
          📚 藏经阁
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>兑换功法</div>
        </button>
        <button className="btn btn-lg" style={{ padding: 16 }}>
          ⚔️ 演武场
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>切磋较量</div>
        </button>
        <button className="btn btn-lg" style={{ padding: 16 }}>
          🏥 丹药堂
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>领取丹药</div>
        </button>
        <button className="btn btn-lg" style={{ padding: 16 }}>
          📋 任务堂
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>宗门任务</div>
        </button>
      </div>

      {/* NPCs */}
      <div className="panel">
        <div className="panel-title">宗门人物</div>
        {NPC_LIST.map((npc) => (
          <div key={npc.id} className="card" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', marginBottom: 8, cursor: 'pointer',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--bg-elevated)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              🧑
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {npc.name}
                <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {npc.title}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {npc.realm} · 好感度 {npc.affinity}
              </div>
            </div>
            <span style={{ fontSize: 20, color: 'var(--text-disabled)' }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
};
