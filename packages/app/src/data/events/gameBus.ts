import mitt from 'mitt';

type GameEvents = {
  'game:start': void;
  'game:pause': void;
  'game:resume': void;
  'combat:start': { enemyId: string };
  'combat:end': { victory: boolean; rewards?: unknown };
  'cultivation:progress': { amount: number; total: number };
  'breakthrough:start': { realm: string };
  'breakthrough:complete': { success: boolean; newRealm: string };
  'item:obtained': { itemId: string; name: string; quantity: number };
  'item:used': { itemId: string };
  'quest:accepted': { questId: string };
  'quest:completed': { questId: string };
  'npc:dialogue': { npcId: string; nodeId: string };
  'time:advanced': { hours: number; currentTime: string };
  'save:request': void;
  'save:complete': void;
  'navigate': { page: string; params?: Record<string, unknown> };
  'notification': { type: 'success' | 'warning' | 'error' | 'info'; message: string };
};

export const gameBus = mitt<GameEvents>();

export type { GameEvents };
