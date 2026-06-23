import React, { useState } from 'react';
import { usePlayerStore } from '@fanren/data';
import { getSaveSlots, loadGame } from '@fanren/data';

export const MainMenu: React.FC = () => {
  const [showLoad, setShowLoad] = useState(false);
  const saveSlots = getSaveSlots();
  const setPlayer = usePlayerStore((s) => s.setPlayer);

  const handleNewGame = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'character-create' } }));
  };

  const handleLoadGame = (slot: number) => {
    const save = loadGame(slot);
    if (save) {
      setPlayer(save.player);
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
    }
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh',
      backgroundImage: 'url(assets/backgrounds/bg_main_menu.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(245,243,237,0.1) 0%, rgba(245,243,237,0.6) 100%)',
      }} />

      {/* Content */}
      <div className="fade-in" style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 32, zIndex: 1,
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-title)', fontSize: 48, fontWeight: 700,
            color: '#1A1A1A', letterSpacing: 8, marginBottom: 8,
          }}>
            凡人修仙传
          </h1>
          <p style={{
            fontSize: 16, color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-title)', letterSpacing: 4,
          }}>
            水墨粒子 · 修仙之旅
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200 }}>
          <button className="btn btn-primary btn-lg" onClick={handleNewGame}>
            新的仙途
          </button>
          {saveSlots.length > 0 && (
            <button className="btn btn-lg" onClick={() => setShowLoad(!showLoad)}>
              继续修炼
            </button>
          )}
          <button className="btn btn-sm" style={{ opacity: 0.5 }}>
            设定
          </button>
        </div>

        {/* Load slots */}
        {showLoad && (
          <div className="panel fade-in" style={{ minWidth: 280 }}>
            <div className="panel-title">存档列表</div>
            {saveSlots.map((slot) => (
              <div key={slot.slot} className="card" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', cursor: 'pointer', marginBottom: 8,
              }} onClick={() => handleLoadGame(slot.slot)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{slot.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {new Date(slot.timestamp).toLocaleString('zh-CN')} · {slot.realm}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-disabled)' }}>
                  存档 {slot.slot}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Version */}
      <div style={{
        position: 'absolute', bottom: 16, fontSize: 11,
        color: 'var(--text-disabled)', zIndex: 1,
      }}>
        v0.1.0 · 单机修仙RPG
      </div>
    </div>
  );
};
