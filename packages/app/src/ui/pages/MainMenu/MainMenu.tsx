import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '@/data';
import { getSaveSlots, loadGameToStore, deleteSave, formatSaveTime, SaveSlotInfo } from '@/data';
import { REALM_NAMES } from '@/core';

export const MainMenu: React.FC = () => {
  const [showLoad, setShowLoad] = useState(false);
  const [saveSlots, setSaveSlots] = useState<SaveSlotInfo[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const setPlayer = usePlayerStore((s) => s.setPlayer);

  // 刷新存档列表
  const refreshSlots = () => {
    setSaveSlots(getSaveSlots());
  };

  useEffect(() => {
    refreshSlots();
  }, []);

  const handleNewGame = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'character-create' } }));
  };

  const handleLoadGame = (slot: number) => {
    const success = loadGameToStore(slot);
    if (success) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
    }
  };

  const handleDeleteSave = (slot: number) => {
    deleteSave(slot);
    refreshSlots();
    setDeleteConfirm(null);
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh',
      backgroundImage: 'url(/backgrounds/bg_main_menu.png)',
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
        alignItems: 'center', gap: 32, zIndex: 1, maxWidth: 480, width: '100%', padding: 16,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <button className="btn btn-primary btn-lg" onClick={handleNewGame} style={{ width: '100%' }}>
            新的仙途
          </button>
          {saveSlots.length > 0 && (
            <button className="btn btn-lg" onClick={() => { refreshSlots(); setShowLoad(!showLoad); }} style={{ width: '100%' }}>
              继续修炼 ({saveSlots.length}个存档)
            </button>
          )}
          <button className="btn btn-sm" style={{ opacity: 0.5, width: '100%' }}>
            设定
          </button>
        </div>

        {/* Load slots - 账号选择 */}
        {showLoad && (
          <div className="panel fade-in" style={{ width: '100%', maxHeight: 400, overflowY: 'auto' }}>
            <div className="panel-title">选择存档账号</div>
            {saveSlots.map((slot) => (
              <div key={slot.slot} className="card" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', cursor: 'pointer', marginBottom: 8,
                position: 'relative',
              }}>
                {/* 点击卡片加载游戏 */}
                <div style={{ flex: 1 }} onClick={() => handleLoadGame(slot.slot)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="sprite-bg" style={{
                      width: 40, height: 53,
                      backgroundImage: slot.gender === 'MALE'
                        ? 'url(/sprites/spr_player_male.png)'
                        : 'url(/sprites/spr_player_female.png)',
                      backgroundPosition: '0 0',
                      backgroundSize: '80px 106px',
                      borderRadius: 4,
                    }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{slot.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {REALM_NAMES[slot.realm as keyof typeof REALM_NAMES] || slot.realm} · 第{slot.realmLayer}层
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)' }}>
                    <span>年龄 {slot.age}岁 · 💰{slot.gold}</span>
                    <span>{formatSaveTime(slot.timestamp)}</span>
                  </div>
                </div>

                {/* 删除按钮 */}
                <div style={{ marginLeft: 8 }}>
                  {deleteConfirm === slot.slot ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm" style={{ background: 'var(--brand-danger)', color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteSave(slot.slot); }}>
                        确认
                      </button>
                      <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}>
                        取消
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-sm" style={{ opacity: 0.5, fontSize: 12 }}
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(slot.slot); }}>
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 没有存档时的提示 */}
        {showLoad && saveSlots.length === 0 && (
          <div className="panel" style={{ width: '100%', textAlign: 'center', padding: 24 }}>
            <p style={{ color: 'var(--text-tertiary)' }}>暂无存档，请创建新账号</p>
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
