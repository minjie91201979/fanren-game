import React, { useState } from 'react';
import { usePlayerStore, useCaveStore } from '@/data';
import { Realm, REALM_NAMES, REALM_LIFESPAN } from '@/core';
import { saveCurrentGame } from '@/data';

interface CultivateResult {
  cultivation: number;
  timeAdvanced: number;
}

export const CaveDwelling: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const addCultivation = usePlayerStore((s) => s.addCultivation);
  const advanceTime = usePlayerStore((s) => s.advanceTime);
  const cave = useCaveStore((s) => s.cave);
  const [cultivating, setCultivating] = useState(false);
  const [result, setResult] = useState<CultivateResult | null>(null);

  if (!player) return null;

  // 修炼逻辑
  const handleCultivate = () => {
    if (cultivating) return;
    setCultivating(true);

    // 用 getState 避免闭包陷阱
    const { addCultivation: addCul, advanceTime: advTime } = usePlayerStore.getState();
    const { cave: currentCave } = useCaveStore.getState();

    // 计算修炼收益：基础10 + 洞府加成 + 境界加成
    // 字符串枚举 Object.values 直接返回值域（非数字枚举的反向映射）
    const realmIdx = (Object.values(Realm) as string[]).indexOf(player.realm);
    const realmBonus = Math.max(0, realmIdx * 3);
    const totalGain = 10 + currentCave.cultivationBonus + realmBonus;

    // 延迟1.5秒模拟修炼过程
    setTimeout(() => {
      addCul(totalGain);
      advTime(2); // 2时辰
      setResult({ cultivation: totalGain, timeAdvanced: 2 });
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
          marginBottom: 16,
        }}>
          <button className="btn btn-sm" onClick={handleSaveAndExit}
            style={{ fontSize: 12 }}>
            ← 返回主菜单
          </button>
          <button className="btn btn-sm" onClick={handleQuickSave}
            style={{ fontSize: 12 }}>
            💾 快速存档
          </button>
        </div>

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

        {/* 洞府信息 */}
        <div className="card" style={{ marginBottom: 16, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 600 }}>洞府 Lv.{cave.level}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 12, marginLeft: 8 }}>
                灵脉 {cave.spiritVeinQuality}
              </span>
            </div>
            <span style={{ color: 'var(--color-green)', fontSize: 13 }}>
              修炼加成 +{cave.cultivationBonus}
            </span>
          </div>
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
          {cave.buildings.map((b) => (
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
              <span style={{ fontSize: 12, color: 'var(--color-green)' }}>
                {b.effects[0]?.type?.replace('_', ' ')} +{b.effects[0]?.value}
              </span>
            </div>
          ))}
          <button className="btn btn-sm" style={{ marginTop: 12, width: '100%' }}>
            建造/升级 (+)
          </button>
        </div>
      </div>

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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>修为增长</span>
                <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>+{result.cultivation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)' }}>
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
