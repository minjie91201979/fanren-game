/**
 * 灵药园页面
 * 购买种子 → 种植到槽位 → 等待成熟 → 收获材料
 */
import React, { useState, useCallback, useEffect } from 'react';
import { usePlayerStore } from '@/data';
import {
  CROPS, getSlotCount, getAvailableCrops,
  getMaturity, isMature, formatRemaining, getGrowSeconds, getHerbGrowthBonus,
} from '@/data/garden';
import { getItem } from '@/data/items';
import type { CropData, PlantedCrop } from '@/data/garden';

/** localStorage key */
const GARDEN_KEY = 'fanren_garden_plants';

function loadPlants(): PlantedCrop[] {
  try { return JSON.parse(localStorage.getItem(GARDEN_KEY) || '[]'); } catch { return []; }
}
function savePlants(plants: PlantedCrop[]) {
  localStorage.setItem(GARDEN_KEY, JSON.stringify(plants));
}

export const Garden: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const addItem = usePlayerStore((s) => s.addItem);
  const removeItem = usePlayerStore((s) => s.removeItem);
  const modifyGold = usePlayerStore((s) => s.modifyGold);

  const [plants, setPlants] = useState<PlantedCrop[]>(loadPlants);
  const [planting, setPlanting] = useState(false);
  const [tick, setTick] = useState(0);

  if (!player) return null;

  const slots = getSlotCount();
  const inventory = player.inventory || [];
  const crops = getAvailableCrops(player.realm, inventory);
  const bonus = getHerbGrowthBonus();

  // 每秒刷新计时器
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handlePlant = useCallback((crop: CropData, slotIndex: number) => {
    // 使用 getState() 获取最新玩家数据，避免闭包陷阱
    const playerState = usePlayerStore.getState();
    if (!playerState.player) return;

    if (playerState.player.gold < crop.goldCost) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'error', message: `灵石不足！需要 ${crop.goldCost} 灵石` },
      }));
      return;
    }
    playerState.modifyGold(-crop.goldCost);

    // 消耗一颗种子
    playerState.removeItem(crop.seedItemId, 1);

    // 使用函数式更新，始终基于最新 plants 数组
    setPlants((prev) => {
      const plant: PlantedCrop = {
        slotIndex,
        cropId: crop.id,
        plantedAt: Date.now(),
      };
      const updated = [...prev, plant];
      savePlants(updated);
      return updated;
    });
    setPlanting(false);

    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: 'success', message: `种下了【${crop.name}】` },
    }));
  }, []);

  const handleHarvest = useCallback((plant: PlantedCrop) => {
    const crop = CROPS.find((c) => c.id === plant.cropId);
    if (!crop) return;

    const count = crop.harvestMin + Math.floor(Math.random() * (crop.harvestMax - crop.harvestMin + 1));
    const resultItem = getItem(crop.harvestItemId);
    if (resultItem) {
      addItem(resultItem, count);
    }

    const updated = plants.filter((p) => p.slotIndex !== plant.slotIndex);
    setPlants(updated);
    savePlants(updated);

    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: 'success', message: `收获【${crop.name}】×${count}！` },
    }));
  }, [plants, addItem]);

  const handleBack = () =>
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));

  // 已种植的槽位映射
  const occupiedSlots = new Map<number, PlantedCrop>();
  plants.forEach((p) => occupiedSlots.set(p.slotIndex, p));

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="btn btn-sm" onClick={handleBack}>← 返回洞府</button>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>🌿 灵药园</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            生长加速：<span style={{ color: 'var(--color-green)' }}>+{bonus}%</span>
          </div>
        </div>
      </div>

      {/* 无灵药园提示 */}
      {slots === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>尚未建造灵药园</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            请在洞府中建造"灵药园"建筑后使用
          </div>
          <button className="btn" style={{ marginTop: 16 }} onClick={handleBack}>
            返回洞府建造
          </button>
        </div>
      )}

      {/* 种植槽位 */}
      {slots > 0 && (
        <>
          <div className="panel" style={{ padding: 10, marginBottom: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
            💡 购买种子后选择空槽位种植，成熟后点击收获
          </div>

          {/* 槽位网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {Array.from({ length: slots }, (_, i) => {
              const plant = occupiedSlots.get(i);
              const crop = plant ? CROPS.find((c) => c.id === plant.cropId) : null;
              const mature = plant && crop ? isMature(plant, crop) : false;
              const progress = plant && crop ? getMaturity(plant, crop) : 0;

              return (
                <div
                  key={i}
                  className="panel"
                  style={{
                    padding: 12, textAlign: 'center', position: 'relative',
                    overflow: 'hidden', minHeight: 100,
                    cursor: mature ? 'pointer' : 'default',
                    border: mature ? '2px solid var(--color-green)' : undefined,
                  }}
                  onClick={() => {
                    if (mature && plant) handleHarvest(plant);
                  }}
                >
                  {plant && crop ? (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>
                        {mature ? '🌾' : progress > 0.5 ? '🌿' : '🌱'}
                      </div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{crop.name}</div>
                      <div style={{ fontSize: 11, color: mature ? 'var(--color-green)' : 'var(--text-tertiary)' }}>
                        {mature ? '✅ 点击收获' : formatRemaining(plant, crop)}
                      </div>
                      {/* 进度条 */}
                      {!mature && (
                        <div style={{
                          marginTop: 6, height: 4, borderRadius: 2,
                          background: 'var(--bg-elevated)', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', width: `${Math.round(progress * 100)}%`,
                            background: 'var(--color-green)', borderRadius: 2,
                            transition: 'width 1s linear',
                          }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      className="btn btn-sm"
                      style={{ width: '100%', height: '100%', minHeight: 76 }}
                      onClick={() => setPlanting(true)}
                    >
                      +
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 作物选择弹窗 */}
      {planting && (
        <div className="modal-overlay" onClick={() => setPlanting(false)}>
          <div className="panel fade-in" style={{
            maxWidth: 360, width: '100%', margin: 16, padding: 20,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, textAlign: 'center' }}>
              🌱 选择作物
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, textAlign: 'center' }}>
              选择要种植的作物（消耗灵石购买种子）
            </div>
            {crops.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎒</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>背包中没有种子</div>
                <div>击败妖兽或购买可获得<strong>灵草种子</strong></div>
              </div>
            ) : crops.map((crop) => {
              const growTime = getGrowSeconds(crop);
              const growMin = Math.floor(growTime / 60);
              const growSec = growTime % 60;
              // 检查是否拥有种子
              const invSlot = inventory.find((s: any) => s.item?.id === crop.seedItemId);
              const seedCount = invSlot?.quantity || 0;
              return (
                <div key={crop.id} style={{
                  padding: '10px 0', borderBottom: '1px solid var(--border-default)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{crop.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        收获 {crop.harvestMin}-{crop.harvestMax} 个 · {growMin}分{growSec}秒成熟 · 拥有 {seedCount} 颗种子
                    </div>
                    </div>
                    <button
                      className="btn btn-sm"
                      disabled={player.gold < crop.goldCost || seedCount === 0}
                      onClick={() => {
                        // 找一个空槽位
                        const emptySlot = Array.from({ length: slots }, (_, i) => i)
                          .find((s) => !plants.some((p) => p.slotIndex === s));
                        if (emptySlot !== undefined) {
                          handlePlant(crop, emptySlot);
                        }
                      }}
                    >
                      {seedCount > 0 ? `💰${crop.goldCost} 种植` : '无种子'}
                    </button>
                  </div>
                </div>
              );
            })}
            <button className="btn" onClick={() => setPlanting(false)}
              style={{ width: '100%', marginTop: 12 }}>
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
