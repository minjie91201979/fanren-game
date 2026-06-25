import React, { useState, useRef } from 'react';
import { usePlayerStore, useCaveStore } from '@/data';
import { Realm, REALM_NAMES } from '@/core';
import { saveCurrentGame, exportSave, importSave } from '@/data';
import {
  getCaveUpgradeCost, CAVE_LEVEL_NAMES,
  BUILD_COST, getBuildingUpgradeCost, getOwnedBuildingTypes,
} from '@/data/stores/caveStore';

interface CultivateResult {
  cultivation: number;
  timeAdvanced: number;
  breakdown: { base: number; caveBonus: number; roomBonus: number; realmBonus: number; techBonus: number };
}

export const CaveDwelling: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const addCultivation = usePlayerStore((s) => s.addCultivation);
  const advanceTime = usePlayerStore((s) => s.advanceTime);
  const cave = useCaveStore((s) => s.cave);
  const [cultivating, setCultivating] = useState(false);
  const [result, setResult] = useState<CultivateResult | null>(null);
  const [showCaveUpgrade, setShowCaveUpgrade] = useState(false);
  const [showBuildingModal, setShowBuildingModal] = useState(false);

  if (!player) return null;

  // 修炼逻辑
  const handleCultivate = () => {
    if (cultivating) return;
    setCultivating(true);

    // 用 getState 避免闭包陷阱
    const { addCultivation: addCul, advanceTime: advTime, getCultivationBonus } = usePlayerStore.getState();
    const { cave: currentCave } = useCaveStore.getState();

    // 计算修炼收益：基础10 + 洞府加成 + 静修室加成 + 境界加成
    const meditationRoom = currentCave.buildings.find(b => b.type === 'MEDITATION_ROOM');
    const roomBonus = meditationRoom
      ? meditationRoom.effects.find(e => e.type === 'cultivation_bonus')?.value || 0
      : 0;
    // 字符串枚举 Object.values 直接返回值域（非数字枚举的反向映射）
    const realmIdx = (Object.values(Realm) as string[]).indexOf(player.realm);
    const realmBonus = Math.max(0, realmIdx * 3);

    // 功法修炼速度加成（百分比叠加）
    const techRate = getCultivationBonus();
    const baseGain = 10 + currentCave.cultivationBonus + roomBonus + realmBonus;
    const techBonus = Math.floor(baseGain * techRate);
    const totalGain = baseGain + techBonus;

    // 延迟1.5秒模拟修炼过程
    setTimeout(() => {
      addCul(totalGain);
      advTime(2); // 2时辰
      setResult({
        cultivation: totalGain,
        timeAdvanced: 2,
        breakdown: { base: 10, caveBonus: currentCave.cultivationBonus, roomBonus, realmBonus, techBonus },
      });
      setCultivating(false);
      // 修炼后自动保存
      setTimeout(() => saveCurrentGame(), 100);
    }, 1500);
  };

  const handleNavigate = (page: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
  };

  const handleSaveAndExit = () => {
    const success = saveCurrentGame();
    if (success) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'success', message: '存档成功，返回主菜单' },
      }));
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'menu' } }));
    }, 500);
  };

  const handleQuickSave = () => {
    const success = saveCurrentGame();
    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: success ? 'success' : 'error', message: success ? '存档成功' : '存档失败' },
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!player) return;
    const ok = exportSave();
    window.dispatchEvent(new CustomEvent('notification', {
      detail: {
        type: ok ? 'success' : 'error',
        message: ok ? '存档已导出！可在任意设备导入' : '导出失败，请重试',
      },
    }));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importSave(text);
      if (result.ok) {
        window.dispatchEvent(new CustomEvent('notification', {
          detail: {
            type: 'success',
            message: `导入成功！欢迎回来，${result.name}`,
          },
        }));
        // 强制刷新页面以更新所有状态
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
        }, 500);
      } else {
        window.dispatchEvent(new CustomEvent('notification', {
          detail: { type: 'error', message: result.error || '导入失败' },
        }));
      }
    };
    reader.readAsText(file);

    // 重置 input 以允许重复选择同一文件
    e.target.value = '';
  };

  // ====== 洞府升级 ======
  const handleCaveUpgrade = () => {
    const cost = getCaveUpgradeCost(cave.level);
    if (player.gold < cost) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'error', message: `灵石不足！需要 ${cost} 灵石` },
      }));
      setShowCaveUpgrade(false);
      return;
    }
    const success = useCaveStore.getState().upgradeCave();
    if (success) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'success', message: `洞府升级为【${CAVE_LEVEL_NAMES[cave.level + 1]}】！` },
      }));
    }
    setShowCaveUpgrade(false);
  };

  // ====== 建筑操作 ======
  const handleBuild = (type: string) => {
    const cost = BUILD_COST[type] || 300;
    if (player.gold < cost) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'error', message: `灵石不足！需要 ${cost} 灵石` },
      }));
      return;
    }
    const success = useCaveStore.getState().buildStructure(type as any);
    if (success) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'success', message: `建造了【${BUILDING_NAMES[type]}】！` },
      }));
    }
  };

  const handleUpgradeBuilding = (buildingId: string) => {
    const b = cave.buildings.find((b) => b.id === buildingId);
    if (!b) return;
    const cost = getBuildingUpgradeCost(b.level);
    if (player.gold < cost) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'error', message: `灵石不足！需要 ${cost} 灵石` },
      }));
      return;
    }
    const success = useCaveStore.getState().upgradeBuilding(buildingId);
    if (success) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'success', message: `【${BUILDING_NAMES[b.type]}】升至 Lv.${b.level + 1}！` },
      }));
    }
  };

  const cPercent = Math.floor((player.cultivation / player.cultivationToNext) * 100);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      backgroundImage: 'url(/backgrounds/bg_cave_dwelling.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      minHeight: '100vh', position: 'relative',
    }}>
      {/* 覆层 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(245,243,237,0.05) 0%, rgba(245,243,237,0.5) 30%, rgba(245,243,237,0.92) 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* 内容 */}
      <div className="fade-in" style={{
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: 800, width: '100%', margin: '0 auto',
        padding: 16, overflowY: 'auto',
      }}>
        {/* 顶部导航栏 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16, flexWrap: 'wrap', gap: 6,
        }}>
          <button className="btn btn-sm" onClick={handleSaveAndExit}
            style={{ fontSize: 12 }}>
            ← 返回主菜单
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm" onClick={handleExport}
              style={{ fontSize: 12 }} title="导出存档为文件">
              📤 导出
            </button>
            <button className="btn btn-sm" onClick={handleImportClick}
              style={{ fontSize: 12 }} title="从文件导入存档">
              📥 导入
            </button>
            <button className="btn btn-sm" onClick={handleQuickSave}
              style={{ fontSize: 12 }}>
              💾 快速存档
            </button>
          </div>
        </div>

        {/* 隐藏的文件选择器 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />

        {/* 玩家状态栏 */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 600 }}>
                {player.name}
              </h2>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                {REALM_NAMES[player.realm]} · {player.realmLayer}层 · 寿元{player.age}/{player.lifespan}年
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, color: 'var(--color-gold)', fontWeight: 600 }}>
                💰 {player.gold}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>灵石</div>
            </div>
          </div>

          {/* HP/MP */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>生命</span>
                <span>{player.attributes.hp}/{player.attributes.maxHp}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill progress-hp"
                  style={{ width: `${(player.attributes.hp / player.attributes.maxHp) * 100}%` }} />
              </div>
            </div>
            {player.attributes.maxMp > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>灵力</span>
                  <span>{player.attributes.mp}/{player.attributes.maxMp}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill progress-mp"
                    style={{ width: `${(player.attributes.mp / player.attributes.maxMp) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* 修为进度 */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span>修为</span>
              <span>{cPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill progress-cultivation"
                style={{ width: `${cPercent}%` }} />
            </div>
          </div>

          {/* 丹毒 */}
          {player.pillToxin > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--brand-danger)' }}>丹毒</span>
                <span style={{ color: 'var(--brand-danger)' }}>{player.pillToxin}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill progress-toxin"
                  style={{ width: `${player.pillToxin}%` }} />
                </div>
            </div>
          )}
        </div>

        {/* 洞府信息 + 升级 */}
        <div className="card" style={{ marginBottom: 16, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 600 }}>
                洞府 Lv.{cave.level} · {CAVE_LEVEL_NAMES[cave.level] || '石室'}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 12, marginLeft: 8 }}>
                灵脉 {cave.spiritVeinQuality}
              </span>
            </div>
            <span style={{ color: 'var(--color-green)', fontSize: 13 }}>
              修炼加成 +{cave.cultivationBonus}
            </span>
          </div>
          {/* 洞府升级按钮 */}
          {cave.level < 5 && (
            <div style={{ marginTop: 10 }}>
              <button
                className="btn btn-sm"
                onClick={() => setShowCaveUpgrade(true)}
                style={{ width: '100%' }}
              >
                ⬆ 升级洞府（→ {CAVE_LEVEL_NAMES[cave.level + 1] || `Lv.${cave.level + 1}`}）
                <span style={{ marginLeft: 8, color: 'var(--color-gold)' }}>
                  💰{getCaveUpgradeCost(cave.level)}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleCultivate}
            disabled={cultivating}
            style={{ gridColumn: '1 / -1', height: 56 }}
          >
            {cultivating ? (
              <span>
                <span className="cultivating-spinner" style={{ marginRight: 8 }}>🧘</span>
                修炼中...
              </span>
            ) : (
              '🧘 闭关修炼 (2时辰)'
            )}
          </button>

          <button className="btn btn-lg" onClick={() => handleNavigate('combat')}>
            ⚔️ 外出历练
          </button>
          <button className="btn btn-lg" onClick={() => handleNavigate('world-map')}>
            🗺️ 天南地图
          </button>
          <button className="btn btn-lg" onClick={() => handleNavigate('inventory')}>
            🎒 乾坤袋
          </button>
          <button className="btn btn-lg" onClick={() => handleNavigate('skill-tree')}>
            📜 技能树
          </button>
          <button className="btn btn-lg" onClick={() => handleNavigate('guide')}>
            📖 攻略
          </button>
          <button className="btn btn-lg" onClick={() => handleNavigate('sect')}>
            🏛️ 宗门
          </button>
          <button className="btn btn-lg" onClick={() => handleNavigate('secret-realm')}>
            🏯 秘境
          </button>
          <button className="btn btn-lg" onClick={() => handleNavigate('breakthrough')}>
            ✨ 突破
          </button>
          <button className="btn btn-lg" onClick={() => handleNavigate('trading')}>
            💰 坊市
          </button>
        </div>

        {/* 洞府建筑 */}
        <div className="panel">
          <div className="panel-title">洞府建筑</div>
          {cave.buildings.map((b) => {
            const page = BUILDING_PAGE_MAP[b.type];
            return (
            <div key={b.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid var(--border-default)',
            }}>
              <div>
                <span style={{ fontWeight: 500 }}>{BUILDING_NAMES[b.type]}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Lv.{b.level}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* 进入功能页 */}
                {page && (
                  <button
                    className="btn btn-sm"
                    onClick={() => handleNavigate(page)}
                    style={{ fontSize: 11, padding: '2px 8px' }}
                  >
                    🚪 进入
                  </button>
                )}
                <span style={{ fontSize: 12, color: 'var(--color-green)' }}>
                  {BUILDING_EFFECT_LABELS[b.effects[0]?.type] || ''} +{b.effects[0]?.value}
                </span>
                <button
                  className="btn btn-sm"
                  onClick={() => handleUpgradeBuilding(b.id)}
                  style={{ fontSize: 11, padding: '2px 8px' }}
                >
                  ⬆ 💰{getBuildingUpgradeCost(b.level)}
                </button>
              </div>
            </div>
          )})}
          <button
            className="btn btn-sm"
            style={{ marginTop: 12, width: '100%' }}
            onClick={() => setShowBuildingModal(true)}
          >
            建造新建筑 (+)
          </button>
        </div>
      </div>

      {/* ====== 洞府升级确认弹窗 ====== */}
      {showCaveUpgrade && (
        <div className="modal-overlay" onClick={() => setShowCaveUpgrade(false)}>
          <div className="panel fade-in" style={{
            maxWidth: 360, width: '100%', margin: 16,
            textAlign: 'center', padding: 24,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏠</div>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
              升级洞府
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
              {CAVE_LEVEL_NAMES[cave.level]} → {CAVE_LEVEL_NAMES[cave.level + 1]}
            </div>
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
              padding: 12, marginBottom: 16, textAlign: 'left',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>消耗灵石</span>
                <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                  💰 {getCaveUpgradeCost(cave.level)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)' }}>
                <span>修炼加成</span>
                <span style={{ color: 'var(--color-green)' }}>+10 (→ {cave.cultivationBonus + 10})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)' }}>
                <span>灵脉质量</span>
                <span style={{ color: 'var(--color-green)' }}>+15 (→ {Math.min(100, cave.spiritVeinQuality + 15)})</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => setShowCaveUpgrade(false)} style={{ flex: 1 }}>
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCaveUpgrade}
                style={{ flex: 1 }}
                disabled={player.gold < getCaveUpgradeCost(cave.level)}
              >
                {player.gold >= getCaveUpgradeCost(cave.level) ? '确认升级' : '灵石不足'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== 建造建筑弹窗 ====== */}
      {showBuildingModal && (
        <div className="modal-overlay" onClick={() => setShowBuildingModal(false)}>
          <div className="panel fade-in" style={{
            maxWidth: 400, width: '100%', margin: 16,
            padding: 20, maxHeight: '70vh', overflowY: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, textAlign: 'center' }}>
              🏗️ 建造新建筑
            </div>
            {ALL_BUILDING_TYPES.map(({ type, name, desc }) => {
              const owned = cave.buildings.some((b) => b.type === type);
              const cost = BUILD_COST[type] || 300;
              return (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid var(--border-default)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{desc}</div>
                  </div>
                  {owned ? (
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>已拥有</span>
                  ) : (
                    <button
                      className="btn btn-sm"
                      onClick={() => handleBuild(type)}
                      disabled={player.gold < cost}
                      style={{ fontSize: 12 }}
                    >
                      💰{cost} 建造
                    </button>
                  )}
                </div>
              );
            })}
            <button className="btn" onClick={() => setShowBuildingModal(false)}
              style={{ width: '100%', marginTop: 12 }}>
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 修炼结果弹窗 */}
      {result && (
        <div className="modal-overlay" onClick={() => setResult(null)}>
          <div className="panel fade-in" style={{
            maxWidth: 360, width: '100%', margin: 16,
            textAlign: 'center', padding: 24,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🧘</div>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
              修炼完毕
            </div>
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
              padding: 12, marginBottom: 16, textAlign: 'left',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>修为增长</span>
                <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>+{result.cultivation}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>基础修炼</span><span>+{result.breakdown.base}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>洞府加成</span><span>+{result.breakdown.caveBonus}</span>
                </div>
                {result.breakdown.roomBonus > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>静修室加成</span><span style={{ color: 'var(--color-green)' }}>+{result.breakdown.roomBonus}</span>
                  </div>
                )}
                {result.breakdown.techBonus > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>功法加成</span><span style={{ color: 'var(--color-green)' }}>+{result.breakdown.techBonus}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>境界加成</span><span>+{result.breakdown.realmBonus}</span>
                </div>
              </div>
              <div style={{
                marginTop: 8, paddingTop: 8,
                borderTop: '1px solid var(--border-default)',
                display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)',
              }}>
                <span>时间流逝</span>
                <span>{result.timeAdvanced} 时辰</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setResult(null)} style={{ width: '100%' }}>
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BUILDING_NAMES: Record<string, string> = {
  'MEDITATION_ROOM': '静修室',
  'ALCHEMY_ROOM': '炼丹室',
  'FORGING_ROOM': '炼器室',
  'TREASURY': '藏宝阁',
  'GARDEN': '灵药园',
  'ARRAY_CENTER': '阵法中心',
};

const BUILDING_EFFECT_LABELS: Record<string, string> = {
  'cultivation_bonus': '修炼加成',
  'alchemy_success': '炼丹成功率',
  'forging_success': '炼器成功率',
  'storage_bonus': '储物空间',
  'herb_growth': '药草生长',
  'defense_bonus': '防御加成',
};

const ALL_BUILDING_TYPES = [
  { type: 'MEDITATION_ROOM', name: '静修室', desc: '提升修炼速度' },
  { type: 'ALCHEMY_ROOM', name: '炼丹室', desc: '提高炼丹成功率' },
  { type: 'FORGING_ROOM', name: '炼器室', desc: '提高炼器成功率' },
  { type: 'TREASURY', name: '藏宝阁', desc: '增加储物空间' },
  { type: 'GARDEN', name: '灵药园', desc: '加速药草生长' },
  { type: 'ARRAY_CENTER', name: '阵法中心', desc: '增强洞府防御' },
];

/** 建筑类型 → 页面路由映射 */
const BUILDING_PAGE_MAP: Record<string, string> = {
  'ALCHEMY_ROOM': 'alchemy-room',
  'FORGING_ROOM': 'forging-room',
  'GARDEN': 'garden',
};
