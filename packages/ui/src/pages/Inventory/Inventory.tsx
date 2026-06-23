import React, { useState } from 'react';
import { usePlayerStore } from '@fanren/data';
import { Rarity, RARITY_NAMES } from '@fanren/core';

export const Inventory: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const equipItem = usePlayerStore((s) => s.equipItem);
  const removeItem = usePlayerStore((s) => s.removeItem);
  const [selectedTab, setSelectedTab] = useState<'all' | 'equipment' | 'consumable' | 'material'>('all');

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  if (!player) return null;

  const filteredInventory = selectedTab === 'all'
    ? player.inventory
    : player.inventory.filter((s) => s.item.type.toLowerCase() === selectedTab);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>乾坤袋</div>
        <button className="btn btn-sm" onClick={handleBack}>← 返回</button>
      </div>

      {/* Equipment slots */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>当前装备</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(['WEAPON', 'HEAD', 'BODY', 'HANDS', 'FEET', 'ACCESSORY1', 'ACCESSORY2'] as const).map((slot) => {
            const equip = player.equipment[slot];
            return (
              <div key={slot} style={{
                padding: '6px 10px', background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)', fontSize: 13,
                display: 'flex', justifyContent: 'space-between',
                border: equip ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
              }}>
                <span style={{ color: 'var(--text-tertiary)' }}>{SLOT_NAMES[slot]}</span>
                <span style={{ color: equip ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                  {equip?.name || '空'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['all', 'equipment', 'consumable', 'material'] as const).map((tab) => (
          <button
            key={tab}
            className={`btn btn-sm ${selectedTab === tab ? 'btn-primary' : ''}`}
            onClick={() => setSelectedTab(tab)}
          >
            {TAB_NAMES[tab]} ({tab === 'all' ? player.inventory.length : player.inventory.filter((s) => s.item.type.toLowerCase() === tab).length})
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filteredInventory.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-disabled)' }}>
            空空如也
          </div>
        )}
        {filteredInventory.map((slot) => (
          <div key={slot.item.id} className="card" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 12px',
            borderLeft: `3px solid ${RARITY_COLORS[slot.item.rarity] || 'var(--border-default)'}`,
          }}>
            <div style={{
              width: 40, height: 40, background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {ITEM_ICONS[slot.item.type] || '📦'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                {slot.item.name}
                {slot.quantity > 1 && (
                  <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                    x{slot.quantity}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {RARITY_NAMES[slot.item.rarity]} · {slot.item.description.slice(0, 30)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {slot.item.type === 'EQUIPMENT' && 'slot' in slot.item && (
                <button className="btn btn-sm btn-primary" onClick={() => equipItem(slot.item.id)}>
                  装备
                </button>
              )}
              <button className="btn btn-sm" style={{ color: 'var(--text-disabled)' }}>
                详情
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gold display */}
      <div style={{
        marginTop: 16, textAlign: 'center', padding: 12,
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
      }}>
        <span style={{ color: 'var(--color-gold)', fontSize: 18, fontWeight: 600 }}>
          💰 {player.gold} 灵石
        </span>
      </div>
    </div>
  );
};

const SLOT_NAMES: Record<string, string> = {
  WEAPON: '武器', HEAD: '头部', BODY: '身体',
  HANDS: '手套', FEET: '鞋子', ACCESSORY1: '饰品1', ACCESSORY2: '饰品2',
};

const TAB_NAMES: Record<string, string> = {
  all: '全部', equipment: '装备', consumable: '消耗品', material: '材料',
};

const ITEM_ICONS: Record<string, string> = {
  CONSUMABLE: '💊', EQUIPMENT: '⚔️', MATERIAL: '🌿', SKILL_BOOK: '📖', QUEST: '📜', SPECIAL: '💎',
};

const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: '#A0A0A0',
  [Rarity.UNCOMMON]: '#5B8C5A',
  [Rarity.RARE]: '#4A7BA7',
  [Rarity.EPIC]: '#7B6BAA',
  [Rarity.LEGENDARY]: '#D4A830',
  [Rarity.MYTHIC]: '#C0503D',
};
