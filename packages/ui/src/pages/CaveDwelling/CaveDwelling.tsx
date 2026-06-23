import React, { useState } from 'react';
import { usePlayerStore, useCaveStore } from '@fanren/data';
import { REALM_NAMES, REALM_LIFESPAN } from '@fanren/core';
import { autoSave } from '@fanren/data';

export const CaveDwelling: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const addCultivation = usePlayerStore((s) => s.addCultivation);
  const advanceTime = usePlayerStore((s) => s.advanceTime);
  const cave = useCaveStore((s) => s.cave);

  const [cultivating, setCultivating] = useState(false);

  if (!player) return null;

  const handleCultivate = () => {
    if (cultivating) return;
    setCultivating(true);
    const amount = 10 + cave.cultivationBonus;
    setTimeout(() => {
      addCultivation(amount);
      advanceTime(2);
      setCultivating(false);
    }, 2000);
  };

  const handleNavigate = (page: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
  };

  const handleSave = () => {
    autoSave();
    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: 'success', message: '存档成功' },
    }));
  };

  const cPercent = Math.floor((player.cultivation / player.cultivationToNext) * 100);

  return (
    <div className="page-container">
      {/* Player status bar */}
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

        {/* Cultivation progress */}
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

        {/* Pill toxin */}
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

      {/* Cave info */}
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

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn btn-primary btn-lg ${cultivating ? '' : ''}`}
          onClick={handleCultivate}
          disabled={cultivating}
          style={{ gridColumn: '1 / -1', height: 56 }}
        >
          {cultivating ? '🧘 修炼中...' : '🧘 闭关修炼 (2时辰)'}
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
        <button className="btn btn-lg" onClick={handleSave}>
          💾 存档
        </button>
      </div>

      {/* Cave buildings */}
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
