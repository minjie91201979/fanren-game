import React, { useState } from 'react';
import { usePlayerStore } from '@fanren/data';

const SHOP_ITEMS = [
  { id: 'pill_hp_small', name: '回春丹', type: '丹药', price: 10, desc: '恢复50点生命值' },
  { id: 'pill_mp_small', name: '聚灵丹', type: '丹药', price: 15, desc: '恢复30点灵力值' },
  { id: 'pill_cult_small', name: '培元丹', type: '丹药', price: 30, desc: '增加20点修为' },
  { id: 'sword_iron', name: '铁剑', type: '武器', price: 50, desc: '凡品铁剑，攻击+5' },
  { id: 'robe_cloth', name: '布袍', type: '防具', price: 40, desc: '凡品布袍，防御+3' },
  { id: 'talisman_fire', name: '火球符', type: '符箓', price: 20, desc: '一次性攻击符箓' },
  { id: 'grass_spirit', name: '灵草', type: '材料', price: 25, desc: '炼丹材料' },
  { id: 'jade_slip', name: '长春功残篇', type: '功法', price: 100, desc: '人级木系功法' },
];

export const Trading: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const modifyGold = usePlayerStore((s) => s.modifyGold);
  const [notification, setNotification] = useState('');

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (!player || player.gold < item.price) {
      setNotification('灵石不足！');
      setTimeout(() => setNotification(''), 2000);
      return;
    }
    modifyGold(-item.price);
    setNotification(`购买了 ${item.name}！`);
    setTimeout(() => setNotification(''), 2000);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>坊市</div>
        <button className="btn btn-sm" onClick={handleBack}>← 返回</button>
      </div>

      {/* Gold display */}
      <div style={{
        textAlign: 'center', padding: 16, marginBottom: 16,
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>持有灵石</span>
        <div style={{ fontSize: 28, color: 'var(--color-gold)', fontWeight: 700 }}>
          💰 {player?.gold || 0}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fade-in" style={{
          textAlign: 'center', padding: '8px 16px', marginBottom: 12,
          background: 'var(--color-green)', color: '#fff',
          borderRadius: 'var(--radius-md)', fontSize: 14,
        }}>
          {notification}
        </div>
      )}

      {/* Shop items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SHOP_ITEMS.map((item) => (
          <div key={item.id} className="card" style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
          }}>
            <div style={{
              width: 40, height: 40, background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              {item.type === '丹药' ? '💊' : item.type === '武器' ? '⚔️' : item.type === '防具' ? '🛡️' : item.type === '符箓' ? '📜' : item.type === '材料' ? '🌿' : '📖'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {item.type} · {item.desc}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: 14 }}>
                💰{item.price}
              </span>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleBuy(item)}
                disabled={!player || player.gold < item.price}
              >
                购买
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
