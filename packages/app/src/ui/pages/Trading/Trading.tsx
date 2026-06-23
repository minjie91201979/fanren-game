import React, { useState } from 'react';
import { usePlayerStore } from '@/data';
import { getItem, SHOP_CATALOG } from '@/data/items';
import { ItemType } from '@/core';
import { formatGold } from '@/core';

const CATEGORY_NAMES: Record<string, string> = {
  '丹药': '丹药', '武器': '武器', '防具': '防具', '符箓': '符箓', '材料': '材料', '功法': '功法',
};
const CATEGORY_ICON: Record<string, string> = {
  '丹药': '💊', '武器': '⚔️', '防具': '🛡️', '符箓': '📜', '材料': '🌿', '功法': '📖',
};

export const Trading: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const addItem = usePlayerStore((s) => s.addItem);
  const modifyGold = usePlayerStore((s) => s.modifyGold);
  const [notification, setNotification] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = ['全部', ...new Set(SHOP_CATALOG.map(i => i.category))];

  const handleBuy = (itemId: string) => {
    const item = getItem(itemId);
    if (!player || !item) return;
    if (player.gold < item.price) {
      setNotification('灵石不足！');
      setTimeout(() => setNotification(''), 2000);
      return;
    }
    modifyGold(-item.price);
    addItem({ ...item }, 1);
    setNotification(`购买了 ${item.name}！`);
    setTimeout(() => setNotification(''), 2000);
  };

  const handleSell = (itemId: string) => {
    const item = getItem(itemId);
    if (!player || !item) return;
    // In a real implementation, find the item in player's inventory and remove it
    setNotification(`出售了 ${item.name}，获得 ${Math.floor(item.price * 0.5)} 灵石`);
    setTimeout(() => setNotification(''), 2000);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>坊市 · 天南城</div>
        <button className="btn btn-sm" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }))}>← 返回</button>
      </div>

      {/* 灵石显示 */}
      <div style={{
        textAlign: 'center', padding: 16, marginBottom: 16,
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>持有灵石</span>
        <div style={{ fontSize: 28, color: 'var(--color-gold)', fontWeight: 700 }}>
          💰 {player?.gold || 0}
        </div>
      </div>

      {/* 通知 */}
      {notification && (
        <div className="fade-in" style={{
          textAlign: 'center', padding: '8px 16px', marginBottom: 12,
          background: notification.includes('不足') ? 'var(--brand-danger)' : 'var(--color-green)',
          color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 14,
        }}>
          {notification}
        </div>
      )}

      {/* 分类筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 商品列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SHOP_CATALOG
          .filter(entry => selectedCategory === '全部' || entry.category === selectedCategory)
          .map((entry) => {
            const item = getItem(entry.id);
            if (!item) return null;
            const canBuy = player ? player.gold >= item.price : false;
            return (
              <div key={item.id} className="card" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              }}>
                {/* 物品图标 */}
                <div style={{
                  width: 48, height: 48,
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {CATEGORY_ICON[item.type === 'EQUIPMENT' ? '武器' : item.type === 'CONSUMABLE' ? '丹药' : item.type === 'MATERIAL' ? '材料' : item.type === 'SKILL_BOOK' ? '功法' : item.type === 'QUEST' ? '符箓' : '丹药']}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {CATEGORY_NAMES[entry.category] || entry.category} · {item.description.slice(0, 30)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: 14 }}>
                    💰{item.price}
                  </span>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleBuy(item.id)}
                    disabled={!canBuy}
                  >
                    购买
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* 出售提示 */}
      <div style={{
        marginTop: 16, padding: 12, background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center',
      }}>
        💡 提示：在乾坤袋中长按物品可出售
      </div>
    </div>
  );
};
