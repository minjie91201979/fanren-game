import React, { useEffect, useState } from 'react';
import { MainMenu } from '../pages/MainMenu/MainMenu';
import { CharacterCreate } from '../pages/CharacterCreate/CharacterCreate';
import { CaveDwelling } from '../pages/CaveDwelling/CaveDwelling';
import { Combat } from '../pages/Combat/Combat';
import { WorldMap } from '../pages/WorldMap/WorldMap';
import { Inventory } from '../pages/Inventory/Inventory';
import { Breakthrough } from '../pages/Breakthrough/Breakthrough';
import { Sect } from '../pages/Sect/Sect';
import { Trading } from '../pages/Trading/Trading';
import { SecretRealm } from '../pages/SecretRealm/SecretRealm';
import { usePlayerStore } from '@fanren/data';

type PageName = 'menu' | 'character-create' | 'cave' | 'combat' | 'world-map' | 'inventory' | 'breakthrough' | 'sect' | 'trading' | 'secret-realm';

export const AppRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageName>('menu');
  const isNewGame = usePlayerStore((s) => s.isNewGame);

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
      default: return <MainMenu />;
    }
  };

  return <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>{renderPage()}</div>;
};
