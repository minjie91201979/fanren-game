import React, { useState } from 'react';
import { usePlayerStore } from '@/data';
import { getItem, SHOP_CATALOG } from '@/data/items';
import { Rarity, RARITY_NAMES } from '@/core';

/** 发送浮动 Toast */
const toast = (message: string, type: 'success' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('notification', { detail: { message, type } }));
};

const CATEGORY_ICON: Record<string, string> = {
  '丹药': '💊', '武器': '⚔️', '防具': '🛡️', '符箓': '📜', '材料': '🌿', '功法': '📖',
};

const ITEM_ICONS: Record<string, string> = {
  EQUIPMENT: '⚔️', CONSUMABLE: '💊', MATERIAL: '🌿', SKILL_BOOK: '📜', QUEST: '📜',
};

export const Trading: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const addItem = usePlayerStore((s) => s.addItem);
  const modifyGold = usePlayerStore((s) => s.modifyGold);
  const removeItem = usePlayerStore((s) => s.removeItem);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = ['全部', ...new Set(SHOP_CATALOG.map(i => i.category))];

  const handleBuy = (itemId: string) => {
    const item = getItem(itemId);
    if (!player || !item) return;
    if (player.gold < item.price) {
      toast('灵石不足！', 'error');
      return;
    }
    modifyGold(-item.price);
    addItem({ ...item }, 1);
    toast(`购买了 ${item.name}！`, 'success');
  };

  const handleSell = (item: any) => {
    const sellPrice = Math.floor((item.price || 0) * 0.5);
    if (sellPrice <= 0) {
      toast('该物品无法出售', 'error');
      return;
    }
    removeItem(item.id, 1);
    modifyGold(sellPrice);
    toast(`出售了 ${item.name}，获得 ${sellPrice} 灵石`);
  };

  // 按分类过滤玩家物品（去除类别显示全凭 item.type）
  const sellCategories = ['全部', '装备', '消耗品', '材料', '功法'];
  const sellFiltered = selectedCategory === '全部'
    ? (player?.inventory || [])
    : (player?.inventory || []).filter((s) => {
        if (selectedCategory === '装备') return s.item.type === 'EQUIPMENT';
        if (selectedCategory === '消耗品') return s.item.type === 'CONSUMABLE';
        if (selectedCategory === '材料') return s.item.type === 'MATERIAL';
        if (selectedCategory === '功法') return s.item.type === 'SKILL_BOOK';
        return false;
      });

  const activeCategories = tab === 'buy' ? categories : sellCategories;

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

      {/* 购买/出售 标签切换 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          className={`btn btn-sm ${tab === 'buy' ? 'btn-primary' : ''}`}
          onClick={() => { setTab('buy'); setSelectedCategory('全部'); }}
          style={{ flex: 1 }}
        >
          🛒 购买
        </button>
        <button
          className={`btn btn-sm ${tab === 'sell' ? 'btn-primary' : ''}`}
          onClick={() => { setTab('sell'); setSelectedCategory('全部'); }}
          style={{ flex: 1 }}
        >
          💰 出售 ({player?.inventory?.length || 0})
        </button>
      </div>

      {/* 分类筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {activeCategories.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 购买列表 */}
      {tab === 'buy' && (
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
                  <div style={{
                    width: 48, height: 48,
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {CATEGORY_ICON[entry.category] || '📦'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {entry.category} · {item.description.slice(0, 30)}
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
      )}

      {/* 出售列表 */}
      {tab === 'sell' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sellFiltered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-disabled)' }}>
              背包中暂无此类物品
            </div>
          )}
          {sellFiltered.map((slot) => {
            const item = slot.item;
            const sellPrice = Math.floor((item.price || 0) * 0.5);
            return (
              <div key={`${item.id}-${slot.quantity}`} className="card" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              }}>
                <div style={{
                  width: 48, height: 48,
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {ITEM_ICONS[item.type] || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>
                    {item.name}
                    {slot.quantity > 1 && (
                      <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                        x{slot.quantity}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {RARITY_NAMES[item.rarity as Rarity] || ''} · {item.description.slice(0, 24)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                    售价 💰{sellPrice}
                  </span>
                  <button
                    className="btn btn-sm"
                    style={{ color: 'var(--color-red)' }}
                    onClick={() => handleSell(item)}
                  >
                    出售
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
