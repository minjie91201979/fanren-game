import React from 'react';
import { usePlayerStore } from '@fanren/data';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const GameLayout: React.FC<LayoutProps> = ({ children, title, showBack, onBack }) => {
  const player = usePlayerStore((s) => s.player);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        minHeight: 44,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showBack && (
            <button onClick={onBack} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, color: 'var(--text-primary)',
            }}>←</button>
          )}
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 600, fontSize: 16 }}>
            {title || '凡人修仙传'}
          </span>
        </div>
        {player && (
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>💰 {player.gold}</span>
            <span>⚡ {player.cultivation}/{player.cultivationToNext}</span>
          </div>
        )}
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
};
