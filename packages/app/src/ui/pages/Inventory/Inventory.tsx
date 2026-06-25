import React, { useState } from 'react';
import { usePlayerStore } from '@/data';
import { Rarity, RARITY_NAMES, ItemType, SpiritRoot } from '@/core';

/** 发送浮动 Toast */
const toast = (message: string, type: 'success' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('notification', { detail: { message, type } }));
};

/** 属性名中文映射 */
const ATTRIBUTE_NAMES: Record<string, string> = {
  hp: '生命值', maxHp: '最大生命',
  mp: '灵力值', maxMp: '最大灵力',
  attack: '攻击力', defense: '防御力',
  speed: '速度', spirit: '神识',
  critRate: '暴击率', critDamage: '暴击倍率',
};

/** 物品id → 精灵图CSS类 */
const ITEM_SPRITE: Record<string, string> = {
  pill_hp_small:   'sprite-item-cult sprite-item-hp-pill',
  pill_mp_small:   'sprite-item-cult sprite-item-mp-pill',
  pill_cult_small:  'sprite-item-cult sprite-item-jadeslip',
  pill_hp_mid:     'sprite-item-cult sprite-item-hp-pill',
  pill_break:       'sprite-item-cult sprite-item-cauldron',
  sword_iron:       'sprite-item-equip sprite-item-sword',
  sword_steel:      'sprite-item-equip sprite-item-sword',
  robe_cloth:       'sprite-item-equip sprite-item-robe',
  robe_silk:        'sprite-item-equip sprite-item-robe',
  talisman_fire:    'sprite-item-cult sprite-item-talisman',
  talisman_shield:  'sprite-item-cult sprite-item-talisman',
  herb_spirit:      'sprite-item-cult sprite-item-herb',
  beast_core:        'sprite-item-cult sprite-item-beastcore',
  spirit_stone_low: 'sprite-item-cult sprite-item-spiritstone',
  skill_changchun:  'sprite-item-cult sprite-item-jadeslip',
  skill_mingguang:  'sprite-item-cult sprite-item-jadeslip',
};

const SLOT_NAMES: Record<string, string> = {
  WEAPON: '武器', HEAD: '头部', BODY: '身体',
  HANDS: '手套', FEET: '鞋子', ACCESSORY1: '饰品1', ACCESSORY2: '饰品2',
};

const TAB_NAMES: Record<string, string> = {
  all: '全部', equipment: '装备', consumable: '消耗品', material: '材料', skill: '功法',
};

const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]:      '#A0A0A0',
  [Rarity.UNCOMMON]:   '#5B8C5A',
  [Rarity.RARE]:        '#4A7BA7',
  [Rarity.EPIC]:        '#7B6BAA',
  [Rarity.LEGENDARY]:  '#D4A830',
  [Rarity.MYTHIC]:      '#C0503D',
};

const SPIRIT_ROOT_NAMES: Record<number, string> = {
  1: '金', 2: '木', 3: '水', 4: '火', 5: '土',
};

/** 效果类型中文名 */
const EFFECT_TYPE_NAMES: Record<string, string> = {
  HEAL_HP:           '恢复生命',
  HEAL_MP:           '恢复灵力',
  ADD_CULTIVATION:    '增加修为',
  BREAKTHROUGH_BONUS: '突破加成',
  SPIRIT_ATTACK:      '灵力攻击',
  DEFEND:             '防御加成',
};

export const Inventory: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const equipItem    = usePlayerStore((s) => s.equipItem);
  const unequipItem = usePlayerStore((s) => s.unequipItem);
  const useItem     = usePlayerStore((s) => s.useItem);
  const removeItem  = usePlayerStore((s) => s.removeItem);
  const modifyGold  = usePlayerStore((s) => s.modifyGold);

  const [selectedTab, setSelectedTab] = useState<'all' | 'equipment' | 'consumable' | 'material' | 'skill'>('all');
  const [detailItem, setDetailItem] = useState<{ item: any; quantity: number } | null>(null);

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  const handleUseItem = (itemId: string, itemName: string) => {
    const result = useItem(itemId);
    if (result) {
      toast(`【${itemName}】${result}`);
    }
  };

  /** 出售物品：移除物品 + 获得半价灵石 */
  const handleSell = (item: any, quantity: number = 1) => {
    const sellPrice = Math.floor((item.price || 0) * 0.5);
    if (sellPrice <= 0) {
      toast('该物品无法出售', 'error');
      return;
    }
    removeItem(item.id, 1);
    modifyGold(sellPrice);
    setDetailItem(null);
    toast(`出售了 ${item.name}，获得 ${sellPrice} 灵石`);
  };

  if (!player) return null;

  const filtered = selectedTab === 'all'
    ? player.inventory
    : selectedTab === 'skill'
      ? player.inventory.filter((s) => s.item.type === 'SKILL_BOOK')
      : player.inventory.filter((s) => s.item.type.toLowerCase() === selectedTab);

  /** 判断某装备是否已装备 */
  const isEquipped = (item: any): boolean => {
    const slot = (item as any).equipmentSlot;
    if (!slot) return false;
    return player.equipment[slot]?.id === item.id;
  };

  /** 渲染物品详情弹窗 */
  const renderDetailModal = () => {
    if (!detailItem) return null;
    const { item, quantity } = detailItem;
    const spriteClass = ITEM_SPRITE[item.id];
    const isEquip = item.type === 'EQUIPMENT';
    const isConsumable = item.type === 'CONSUMABLE';
    const isSkill = item.type === 'SKILL_BOOK';

    return (
      <div className="modal-overlay" onClick={() => setDetailItem(null)}>
        <div className="panel fade-in" style={{ maxWidth: 400, width: '100%', margin: 16 }}
          onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="panel-title" style={{ margin: 0 }}>物品详情</div>
            <button className="btn btn-sm" onClick={() => setDetailItem(null)}>✕</button>
          </div>

          {/* 图标 */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)', overflow: 'hidden',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: `3px solid ${RARITY_COLORS[item.rarity] || '#A0A0A0'}`,
            }}>
              {spriteClass
                ? <div className={`sprite-bg ${spriteClass}`} style={{ width: 56, height: 56 }} />
                : <span style={{ fontSize: 28 }}>
                    {isEquip ? '⚔️' : isConsumable ? '💊' : isSkill ? '📜' : '📦'}
                  </span>
              }
            </div>
          </div>

          {/* 名称 + 稀有度 */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{item.name}</div>
            <span style={{
              fontSize: 12, padding: '2px 10px', borderRadius: 'var(--radius-full)',
              background: RARITY_COLORS[item.rarity] || '#A0A0A0', color: '#fff',
            }}>
              {RARITY_NAMES[item.rarity]}
            </span>
            {quantity > 1 && (
              <span style={{ marginLeft: 8, color: 'var(--text-tertiary)', fontSize: 13 }}>
                持有 x{quantity}
              </span>
            )}
          </div>

          {/* 描述 */}
          <div style={{
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
            padding: 12, marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
          }}>
            {item.description}
          </div>

          {/* 属性加成（装备） */}
          {isEquip && item.attributes && (
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
              padding: 12, marginBottom: 12, fontSize: 13,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>属性加成</div>
              {Object.entries(item.attributes).map(([k, v]: [string, any]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{k}</span>
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>+{v}</span>
                </div>
              ))}
              {(item as any).equipmentSlot && (
                <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 6 }}>
                  装备位：{SLOT_NAMES[(item as any).equipmentSlot] || (item as any).equipmentSlot}
                </div>
              )}
            </div>
          )}

          {/* 效果列表（消耗品/功法） */}
          {(isConsumable || isSkill) && item.effects && (
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
              padding: 12, marginBottom: 12, fontSize: 13,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>效果</div>
              {item.effects.map((eff: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {EFFECT_TYPE_NAMES[eff.type] || eff.type}
                  </span>
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
                    {eff.value}{eff.type === 'BREAKTHROUGH_BONUS' ? '%' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 功法属性加成 */}
          {isSkill && (item as any).attributeBonus && (
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
              padding: 12, marginBottom: 12, fontSize: 13,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>功法属性</div>
              {Object.entries((item as any).attributeBonus).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {ATTRIBUTE_NAMES[k] || k}
                  </span>
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>+{v}</span>
                </div>
              ))}
              {(item as any).cultivationBonus > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingTop: 4, borderTop: '1px solid var(--border-default)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>修炼速度</span>
                  <span style={{ color: 'var(--color-green)', fontWeight: 500 }}>+{Math.round((item as any).cultivationBonus * 100)}%</span>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {isEquip && (
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }}
                onClick={() => { equipItem(item.id); setDetailItem(null); }}>
                {isEquipped(item) ? '已装备' : '装备'}
              </button>
            )}
            {isConsumable && (
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }}
                onClick={() => { handleUseItem(item.id, item.name); setDetailItem(null); }}>
                使用
              </button>
            )}
            {isSkill && (
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }}
                onClick={() => {
                  // 学习功法：加入 techniques 列表，从背包移除
                  usePlayerStore.setState((s) => {
                    if (!s.player) return;
                    const already = s.player.techniques.some((t: any) => t.id === item.id);
                    if (!already) {
                      s.player.techniques.push(item);
                    }
                  });
                  removeItem(item.id, 1);
                  setDetailItem(null);
                  toast(`成功学习《${item.name}》！`);
                }}>
                学习
              </button>
            )}
            <button className="btn btn-sm" style={{ flex: 1, background: 'var(--color-red)', color: '#fff' }}
              onClick={() => handleSell(item, quantity)}>
              💰 出售 ({Math.floor((item.price || 0) * 0.5)}灵)
            </button>
            <button className="btn btn-sm" style={{ flex: 1 }}
              onClick={() => setDetailItem(null)}>
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>乾坤袋</div>
        <button className="btn btn-sm" onClick={handleBack}>← 返回</button>
      </div>

      {/* 装备栏 */}
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
                {equip ? (
                  <span
                    style={{ color: 'var(--text-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => {
                      const invSlot = player.inventory.find((s) => s.item.id === equip.id);
                      setDetailItem(invSlot ? { item: equip, quantity: invSlot.quantity } : { item: equip, quantity: 1 });
                    }}
                  >
                    {equip.name}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-disabled)' }}>空</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 分类筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['all', 'equipment', 'consumable', 'material', 'skill'] as const).map((tab) => (
          <button
            key={tab}
            className={`btn btn-sm ${selectedTab === tab ? 'btn-primary' : ''}`}
            onClick={() => setSelectedTab(tab)}
          >
            {TAB_NAMES[tab]} ({
              tab === 'all' ? player.inventory.length :
              tab === 'skill' ? player.inventory.filter((s) => s.item.type === 'SKILL_BOOK').length :
              player.inventory.filter((s) => s.item.type.toLowerCase() === tab).length
            })
          </button>
        ))}
      </div>

      {/* 物品列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-disabled)' }}>
            空空如也
          </div>
        )}
        {filtered.map((slot) => {
          const spriteClass = ITEM_SPRITE[slot.item.id];
          const isConsumable = slot.item.type === 'CONSUMABLE';
          const isEquip = slot.item.type === 'EQUIPMENT';
          const isSkill = slot.item.type === 'SKILL_BOOK';
          const equipped = isEquip && isEquipped(slot.item);
          return (
            <div key={`${slot.item.id}-${slot.quantity}`} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 12px',
              borderLeft: `3px solid ${RARITY_COLORS[slot.item.rarity] || 'var(--border-default)'}`,
            }}>
              {/* 物品图标 */}
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)', overflow: 'hidden',
                flexShrink: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {spriteClass ? (
                  <div className={`sprite-bg ${spriteClass}`} style={{ width: 44, height: 44 }} />
                ) : (
                  <span style={{ fontSize: 18 }}>
                    {isEquip ? '⚔️' : isConsumable ? '💊' : isSkill ? '📜' : '📦'}
                  </span>
                )}
              </div>

              {/* 名称 + 描述 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {slot.item.name}
                  {slot.quantity > 1 && (
                    <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                      x{slot.quantity}
                    </span>
                  )}
                  {equipped && (
                    <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--brand-primary)', padding: '1px 5px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)' }}>
                      已装备
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {RARITY_NAMES[slot.item.rarity]} · {slot.item.description.slice(0, 24)}
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {isConsumable && (
                  <button className="btn btn-sm btn-primary"
                    onClick={() => handleUseItem(slot.item.id, slot.item.name)}>
                    使用
                  </button>
                )}
                {isEquip && !equipped && (
                  <button className="btn btn-sm btn-primary"
                    onClick={() => equipItem(slot.item.id)}>
                    装备
                  </button>
                )}
                {isEquip && equipped && (
                  <button className="btn btn-sm"
                    onClick={() => { unequipItem((slot.item as any).equipmentSlot); }}>
                    卸下
                  </button>
                )}
                {isSkill && (
                  <button className="btn btn-sm btn-primary"
                    onClick={() => {
                      const already = player.techniques.some((t: any) => t.id === slot.item.id);
                      if (already) { toast('已学习该功法！', 'error'); return; }
                      usePlayerStore.setState((s) => {
                        if (!s.player) return;
                        s.player.techniques.push(slot.item);
                      });
                      removeItem(slot.item.id, 1);
                      toast(`成功学习《${slot.item.name}》！`);
                    }}>
                    学习
                  </button>
                )}
                <button className="btn btn-sm"
                  onClick={() => setDetailItem(slot)}>
                  详情
                </button>
                <button className="btn btn-sm"
                  style={{ color: 'var(--color-red)' }}
                  onClick={() => handleSell(slot.item, slot.quantity)}>
                  💰
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 灵石显示 */}
      <div style={{
        marginTop: 16, textAlign: 'center', padding: 12,
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
      }}>
        <span style={{ color: 'var(--color-gold)', fontSize: 18, fontWeight: 600 }}>
          💰 {player.gold} 灵石
        </span>
      </div>

      {/* 物品详情弹窗 */}
      {renderDetailModal()}
    </div>
  );
};
