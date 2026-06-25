/**
 * 炼丹室页面
 * 选择配方 → 消耗材料和灵石 → 概率产出丹药
 */
import React, { useState } from 'react';
import { usePlayerStore } from '@/data';
import {
  getAvailableRecipes, canCraftRecipe, getAlchemyRate, getAlchemyBonus,
} from '@/data/alchemy';
import { getItem } from '@/data/items';
import type { AlchemyRecipe } from '@/data/alchemy';

export const AlchemyRoom: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const addItem = usePlayerStore((s) => s.addItem);
  const removeItem = usePlayerStore((s) => s.removeItem);
  const modifyGold = usePlayerStore((s) => s.modifyGold);
  const modifyPillToxin = usePlayerStore((s) => s.modifyPillToxin);

  const [selected, setSelected] = useState<AlchemyRecipe | null>(null);
  const [crafting, setCrafting] = useState<string | null>(null);

  if (!player) return null;

  const recipes = getAvailableRecipes(player.realm);
  const bonus = getAlchemyBonus();

  const handleCraft = (recipe: AlchemyRecipe) => {
    setCrafting(recipe.id);
    // 模拟延时，营造"炼丹"感
    setTimeout(() => {
      const { ok, missing } = canCraftRecipe(recipe, player.inventory, player.gold);
      if (!ok) {
        window.dispatchEvent(new CustomEvent('notification', {
          detail: { type: 'error', message: `缺少材料：${missing.join('、')}` },
        }));
        setCrafting(null);
        return;
      }

      const rate = getAlchemyRate(recipe);
      const success = Math.random() < rate;

      // 消耗材料
      for (const m of recipe.materials) {
        removeItem(m.itemId, m.count);
      }
      modifyGold(-recipe.goldCost);

      if (success) {
        const resultItem = getItem(recipe.resultItemId);
        if (resultItem) {
          addItem(resultItem, recipe.count);
        }
        modifyPillToxin(recipe.toxin);
        window.dispatchEvent(new CustomEvent('notification', {
          detail: {
            type: 'success',
            message: `炼丹成功！获得【${resultItem?.name || recipe.name}】×${recipe.count}`,
          },
        }));
      } else {
        // 失败返还 30% 材料
        window.dispatchEvent(new CustomEvent('notification', {
          detail: { type: 'error', message: '炼丹失败！材料已消耗，丹炉炸了…' },
        }));
      }
      setCrafting(null);
    }, 1500);
  };

  const handleBack = () =>
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="btn btn-sm" onClick={handleBack}>← 返回洞府</button>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>🧪 炼丹室</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            成功率加成：<span style={{ color: 'var(--color-green)' }}>+{bonus}%</span>
          </div>
        </div>
      </div>

      {/* 丹毒提示 */}
      <div className="panel" style={{ padding: 10, marginBottom: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
        ⚠ 当前丹毒：<span style={{ color: player.pillToxin > 50 ? 'var(--brand-danger)' : 'var(--color-gold)', fontWeight: 600 }}>
          {player.pillToxin}
        </span>
        {player.pillToxin >= 80 && ' — 丹毒过高，修炼效率大幅下降！'}
        {player.pillToxin >= 50 && player.pillToxin < 80 && ' — 丹毒偏高，注意节制'}
      </div>

      {/* 配方列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recipes.map((recipe) => {
          const { ok } = canCraftRecipe(recipe, player.inventory, player.gold);
          const rate = Math.round(getAlchemyRate(recipe) * 100);
          const isCrafting = crafting === recipe.id;

          return (
            <div
              key={recipe.id}
              className="panel"
              style={{
                padding: 12, cursor: ok ? 'pointer' : 'default',
                opacity: ok ? 1 : 0.5,
                border: selected?.id === recipe.id ? '2px solid var(--brand-primary)' : undefined,
              }}
              onClick={() => ok && setSelected(selected?.id === recipe.id ? null : recipe)}
            >
              {/* 配方头部 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{recipe.name}</span>
                  <span style={{
                    marginLeft: 8, fontSize: 11, color: 'var(--text-tertiary)',
                    background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4,
                  }}>
                    ×{recipe.count}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: rate >= 70 ? 'var(--color-green)' : 'var(--color-gold)' }}>
                  成功率 {rate}%
                </span>
              </div>

              {/* 材料行 */}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                {recipe.materials.map((m, i) => {
                  const mat = getItem(m.itemId);
                  const owned = player.inventory.find((inv) => inv.itemId === m.itemId)?.quantity || 0;
                  return (
                    <span key={m.itemId}>
                      {i > 0 && ' + '}
                      {mat?.name || m.itemId} ×{m.count}
                      <span style={{
                        marginLeft: 2, fontSize: 11,
                        color: owned >= m.count ? 'var(--color-green)' : 'var(--brand-danger)',
                      }}>
                        ({owned})
                      </span>
                    </span>
                  );
                })}
                <span style={{ marginLeft: 8, color: 'var(--color-gold)' }}>💰{recipe.goldCost}</span>
              </div>

              {/* 展开详情 */}
              {selected?.id === recipe.id && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 12, marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>丹毒增量：</span>
                    <span style={{ color: 'var(--brand-danger)' }}>+{recipe.toxin}</span>
                    <span style={{ marginLeft: 12, color: 'var(--text-tertiary)' }}>境界要求：</span>
                    {recipe.minRealm}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                    disabled={!ok || isCrafting}
                    onClick={() => handleCraft(recipe)}
                  >
                    {isCrafting ? '🔥 炼丹中…' : '🔥 开炉炼丹'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {recipes.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
          暂无可用配方，请先提升境界
        </div>
      )}
    </div>
  );
};
