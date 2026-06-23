import Phaser from 'phaser';
import { CombatScene, WorldMapScene, BreakthroughScene } from './scenes';

export interface GameConfig {
  parent: string;
  width: number;
  height: number;
}

export function createGame(config: GameConfig): Phaser.Game {
  const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: config.parent,
    width: config.width,
    height: config.height,
    backgroundColor: '#F5F3ED',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [CombatScene, WorldMapScene, BreakthroughScene],
    render: {
      pixelArt: false,
      antialias: true,
    },
  };

  return new Phaser.Game(phaserConfig);
}

// Export types for consumers
export type GameInstance = Phaser.Game;
