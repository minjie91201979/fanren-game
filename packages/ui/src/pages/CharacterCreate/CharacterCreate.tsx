import React, { useState } from 'react';
import { usePlayerStore } from '@fanren/data';
import { SpiritRoot, SPIRIT_ROOT_NAMES, SPIRIT_ROOT_COLORS } from '@fanren/core';

const ROOT_OPTIONS: SpiritRoot[] = [
  SpiritRoot.GOLD, SpiritRoot.WOOD, SpiritRoot.WATER,
  SpiritRoot.FIRE, SpiritRoot.EARTH,
];

export const CharacterCreate: React.FC = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [selectedRoots, setSelectedRoots] = useState<SpiritRoot[]>([]);
  const [step, setStep] = useState(0);
  const createPlayer = usePlayerStore((s) => s.createPlayer);

  const toggleRoot = (root: SpiritRoot) => {
    if (selectedRoots.includes(root)) {
      setSelectedRoots(selectedRoots.filter((r) => r !== root));
    } else if (selectedRoots.length < 3) {
      setSelectedRoots([...selectedRoots, root]);
    }
  };

  const handleCreate = () => {
    if (!name.trim() || selectedRoots.length === 0) return;
    const roots = selectedRoots.map((root, i) => ({
      root,
      value: 80 - i * 20, // First root is strongest
    }));
    createPlayer(name.trim(), gender, roots);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-page)',
    }}>
      <div className="panel fade-in" style={{ maxWidth: 480, width: '100%', margin: 16 }}>
        {step === 0 && (
          <>
            <div className="panel-title">创建角色</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              在这片天地间，你将踏上修仙之路。青云之上，或是万丈深渊，皆由你定。
            </p>

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

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => name.trim() && setStep(1)}
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
                      position: 'relative' as const,
                    }}
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
                踏入仙途
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
