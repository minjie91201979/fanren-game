import React, { useState } from 'react';
import { usePlayerStore } from '@/data';
import { SpiritRoot, SPIRIT_ROOT_NAMES, SPIRIT_ROOT_COLORS, REALM_NAMES, Realm } from '@/core';
import { getSaveSlots, saveGame, setCurrentSlot } from '@/data';

const ROOT_OPTIONS: SpiritRoot[] = [
  SpiritRoot.GOLD, SpiritRoot.WOOD, SpiritRoot.WATER,
  SpiritRoot.FIRE, SpiritRoot.EARTH,
];

export const CharacterCreate: React.FC = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [selectedRoots, setSelectedRoots] = useState<SpiritRoot[]>([]);
  const [step, setStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [noSlotError, setNoSlotError] = useState(false);
  const createPlayer = usePlayerStore((s) => s.createPlayer);
  const setPlayer = usePlayerStore((s) => s.setPlayer);

  const toggleRoot = (root: SpiritRoot) => {
    if (selectedRoots.includes(root)) {
      setSelectedRoots(selectedRoots.filter((r) => r !== root));
    } else if (selectedRoots.length < 3) {
      setSelectedRoots([...selectedRoots, root]);
    }
  };

  // 找到第一个空槽位
  const findEmptySlot = (): number => {
    const slots = getSaveSlots();
    const usedSlots = new Set(slots.map(s => s.slot));
    for (let i = 1; i <= 6; i++) {
      if (!usedSlots.has(i)) return i;
    }
    return 0; // 0 表示没有空槽位
  };

  const handleCreate = () => {
    if (!name.trim() || selectedRoots.length === 0) return;

    // 确定槽位
    let slot = selectedSlot;
    if (slot === 0) {
      slot = findEmptySlot();
    }

    if (slot === 0) {
      setNoSlotError(true);
      return;
    }

    // 创建角色
    const roots = selectedRoots.map((root, i) => ({
      root,
      value: 80 - i * 20,
    }));
    createPlayer(name.trim(), gender, roots);

    // 保存到槽位
    const success = saveGame(slot);
    if (success) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
    }
  };

  const handleNextStep = () => {
    if (step === 0) {
      if (!name.trim()) return;
      // 检查槽位
      const emptySlot = findEmptySlot();
      if (emptySlot === 0) {
        setNoSlotError(true);
        return;
      }
      setSelectedSlot(emptySlot);
      setNoSlotError(false);
      setStep(1);
    }
  };

  return (
    <div className="bg-cover bg-main-menu bg-overlay" style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
    }}>
      <div className="panel fade-in" style={{ maxWidth: 520, width: '100%', margin: 16 }}>
        {step === 0 && (
          <>
            <div className="panel-title">创建角色</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              在这片天地间，你将踏上修仙之路。青云之上，或是万丈深渊，皆由你定。
            </p>

            {/* 角色预览 */}
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: 20,
            }}>
              <div className="sprite-bg sprite-player" style={{
                width: 80, height: 106,
                border: '2px solid var(--brand-primary)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
              }} />
            </div>

            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                道号
              </label>
              <input
                className="input"
                placeholder="请输入角色名号..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={8}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleNextStep(); }}
              />
            </div>

            {/* Gender */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                性别
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className={`btn ${gender === 'MALE' ? 'btn-primary' : ''}`}
                  onClick={() => setGender('MALE')}
                >男</button>
                <button
                  className={`btn ${gender === 'FEMALE' ? 'btn-primary' : ''}`}
                  onClick={() => setGender('FEMALE')}
                >女</button>
              </div>
            </div>

            {/* 槽位信息 */}
            <div style={{
              padding: 8, background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13,
            }}>
              <span style={{ color: 'var(--text-tertiary)' }}>存档槽位：</span>
              {findEmptySlot() > 0 ? (
                <span style={{ color: 'var(--color-green)' }}>自动分配到空槽位 #{findEmptySlot()}</span>
              ) : (
                <span style={{ color: 'var(--brand-danger)' }}>所有槽位已满，请先删除一个存档</span>
              )}
            </div>
            {noSlotError && (
              <div style={{ color: 'var(--brand-danger)', fontSize: 13, marginBottom: 12 }}>
                所有存档槽位已满！请返回主菜单删除一个存档后再创建新角色。
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 16 }}
              onClick={handleNextStep}
              disabled={!name.trim()}
            >
              下一步：选择灵根
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="panel-title">灵根觉醒</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              灵根决定你的修仙资质。选择 1-3 种灵根，越靠前灵根值越高。
            </p>

            {/* Spirit roots */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {ROOT_OPTIONS.map((root) => {
                const isSelected = selectedRoots.includes(root);
                const idx = selectedRoots.indexOf(root);
                return (
                  <button
                    key={root}
                    onClick={() => toggleRoot(root)}
                    style={{
                      flex: '1 0 30%',
                      padding: '16px 12px',
                      border: `2px solid ${isSelected ? SPIRIT_ROOT_COLORS[root] : 'var(--border-default)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? `${SPIRIT_ROOT_COLORS[root]}15` : 'var(--bg-surface)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      position: 'relative',
                    } as const}
                  >
                    <div style={{
                      fontSize: 18, fontWeight: 600,
                      color: isSelected ? SPIRIT_ROOT_COLORS[root] : 'var(--text-secondary)',
                    }}>
                      {SPIRIT_ROOT_NAMES[root]}
                    </div>
                    {isSelected && (
                      <span style={{
                        position: 'absolute', top: 4, right: 8,
                        fontSize: 11, color: SPIRIT_ROOT_COLORS[root],
                      }}>
                        #{idx + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Preview */}
            {selectedRoots.length > 0 && (
              <div style={{
                padding: 12, background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)', marginBottom: 20,
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  灵根资质
                </div>
                {selectedRoots.map((root, i) => (
                  <div key={root} style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
                  }}>
                    <span style={{ color: SPIRIT_ROOT_COLORS[root], fontWeight: 600 }}>
                      {SPIRIT_ROOT_NAMES[root]}
                    </span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-bar-fill progress-cultivation"
                        style={{ width: `${80 - i * 20}%` }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {80 - i * 20}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" onClick={() => setStep(0)}>
                ← 返回
              </button>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleCreate}
                disabled={selectedRoots.length === 0}
              >
                踏入仙途（保存到槽位 #{findEmptySlot()}）
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
