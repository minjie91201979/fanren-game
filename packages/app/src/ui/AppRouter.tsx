import React, { useEffect, useState } from 'react';
import { MainMenu } from './pages/MainMenu/MainMenu';
import { CharacterCreate } from './pages/CharacterCreate/CharacterCreate';
import { CaveDwelling } from './pages/CaveDwelling/CaveDwelling';
import { Combat } from './pages/Combat/Combat';
import { WorldMap } from './pages/WorldMap/WorldMap';
import { Inventory } from './pages/Inventory/Inventory';
import { Breakthrough } from './pages/Breakthrough/Breakthrough';
import { Sect } from './pages/Sect/Sect';
import { Trading } from './pages/Trading/Trading';
import { SecretRealm } from './pages/SecretRealm/SecretRealm';
import { SkillTree } from './pages/SkillTree/SkillTree';
import { Guide } from './pages/Guide/Guide';
import { AlchemyRoom } from './pages/AlchemyRoom/AlchemyRoom';
import { ForgingRoom } from './pages/ForgingRoom/ForgingRoom';
import { Garden } from './pages/Garden/Garden';
import { usePlayerStore } from '@/data';
import { startAutoSave, stopAutoSave, getCurrentSlot } from '@/data';

type PageName = 'menu' | 'character-create' | 'cave' | 'combat' | 'world-map' | 'inventory' | 'breakthrough' | 'sect' | 'trading' | 'secret-realm' | 'skill-tree' | 'guide' | 'alchemy-room' | 'forging-room' | 'garden';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;

export const AppRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageName>('menu');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const isNewGame = usePlayerStore((s) => s.isNewGame);

  // Toast 通知监听
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.message) {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message: detail.message, type: detail.type || 'info' }]);
        // 2秒后自动消失
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 2000);
      }
    };
    window.addEventListener('notification', handler);
    return () => window.removeEventListener('notification', handler);
  }, []);

  // 管理定时自动保存
  useEffect(() => {
    if (currentPage !== 'menu' && currentPage !== 'character-create') {
      if (getCurrentSlot() > 0) {
        startAutoSave(5 * 60 * 1000);
      }
    } else {
      stopAutoSave();
    }
    return () => stopAutoSave();
  }, [currentPage]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.page) {
        setCurrentPage(detail.page as PageName);
      }
    };
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'menu': return <MainMenu />;
      case 'character-create': return <CharacterCreate />;
      case 'cave': return <CaveDwelling />;
      case 'combat': return <Combat />;
      case 'world-map': return <WorldMap />;
      case 'inventory': return <Inventory />;
      case 'breakthrough': return <Breakthrough />;
      case 'sect': return <Sect />;
      case 'trading': return <Trading />;
      case 'secret-realm': return <SecretRealm />;
      case 'skill-tree': return <SkillTree />;
      case 'guide': return <Guide />;
      case 'alchemy-room': return <AlchemyRoom />;
      case 'forging-room': return <ForgingRoom />;
      case 'garden': return <Garden />;
      default: return <MainMenu />;
    }
  };

  const toastColors: Record<string, { bg: string; border: string }> = {
    success: { bg: '#4ade80', border: '#22c55e' },
    error: { bg: '#f87171', border: '#ef4444' },
    info: { bg: '#60a5fa', border: '#3b82f6' },
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {renderPage()}

      {/* Toast 通知浮层 */}
      <div style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = toastColors[t.type];
          return (
            <div key={t.id} style={{
              padding: '10px 24px', borderRadius: 'var(--radius-full)',
              background: c.bg, border: `1px solid ${c.border}`,
              color: '#fff', fontWeight: 600, fontSize: 14,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
              animation: 'slideDown 0.3s ease',
            }}>
              {t.message}
            </div>
          );
        })}
      </div>
    </div>
  );
};
