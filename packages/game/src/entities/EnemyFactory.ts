import Phaser from 'phaser';
import { usePlayerStore } from '@fanren/data';
import { Realm, Attributes, SpiritRoot, CombatUnit } from '@fanren/core';

export class EnemyFactory {
  static createEnemy(type: string, level: number): CombatUnit {
    const templates: Record<string, () => CombatUnit> = {
      'slime': () => ({
        id: `enemy_${Date.now()}`,
        name: '墨灵',
        isPlayer: false,
        attributes: { hp: 80 + level * 20, maxHp: 80 + level * 20, mp: 0, maxMp: 0, attack: 8 + level * 2, defense: 3 + level, speed: 5 + level, spirit: 1, critRate: 0.03, critDamage: 1.5 },
        currentAttributes: { hp: 80 + level * 20, maxHp: 80 + level * 20, mp: 0, maxMp: 0, attack: 8 + level * 2, defense: 3 + level, speed: 5 + level, spirit: 1, critRate: 0.03, critDamage: 1.5 },
        buffs: [],
        skills: [],
        sprite: 'enemy_slime',
        realm: Realm.MORTAL,
      }),
      'wolf': () => ({
        id: `enemy_${Date.now()}`,
        name: '银鬃狼',
        isPlayer: false,
        attributes: { hp: 150 + level * 30, maxHp: 150 + level * 30, mp: 0, maxMp: 0, attack: 15 + level * 3, defense: 8 + level * 2, speed: 12 + level * 2, spirit: 3, critRate: 0.08, critDamage: 1.5 },
        currentAttributes: { hp: 150 + level * 30, maxHp: 150 + level * 30, mp: 0, maxMp: 0, attack: 15 + level * 3, defense: 8 + level * 2, speed: 12 + level * 2, spirit: 3, critRate: 0.08, critDamage: 1.5 },
        buffs: [],
        skills: [],
        sprite: 'enemy_wolf',
        realm: Realm.QI_REFINING,
      }),
      'golem': () => ({
        id: `enemy_${Date.now()}`,
        name: '石傀',
        isPlayer: false,
        attributes: { hp: 300 + level * 50, maxHp: 300 + level * 50, mp: 0, maxMp: 0, attack: 20 + level * 5, defense: 15 + level * 3, speed: 6 + level, spirit: 2, critRate: 0.02, critDamage: 1.5 },
        currentAttributes: { hp: 300 + level * 50, maxHp: 300 + level * 50, mp: 0, maxMp: 0, attack: 20 + level * 5, defense: 15 + level * 3, speed: 6 + level, spirit: 2, critRate: 0.02, critDamage: 1.5 },
        buffs: [],
        skills: [],
        sprite: 'enemy_golem',
        realm: Realm.FOUNDATION,
      }),
      'dragon': () => ({
        id: `enemy_${Date.now()}`,
        name: '水月蛟龙',
        isPlayer: false,
        attributes: { hp: 800 + level * 100, maxHp: 800 + level * 100, mp: 200, maxMp: 200, attack: 60 + level * 10, defense: 40 + level * 8, speed: 25 + level * 3, spirit: 20, critRate: 0.05, critDamage: 1.8 },
        currentAttributes: { hp: 800 + level * 100, maxHp: 800 + level * 100, mp: 200, maxMp: 200, attack: 60 + level * 10, defense: 40 + level * 8, speed: 25 + level * 3, spirit: 20, critRate: 0.05, critDamage: 1.8 },
        buffs: [],
        skills: [],
        sprite: 'boss_dragon',
        realm: Realm.CORE_FORMATION,
      }),
    };

    const factory = templates[type];
    return factory ? factory() : templates['slime']();
  }

  static createPlayerCombatUnit(): CombatUnit {
    const player = usePlayerStore.getState().player;
    if (!player) throw new Error('No player data');

    return {
      id: player.id,
      name: player.name,
      isPlayer: true,
      attributes: player.attributes,
      currentAttributes: { ...player.attributes },
      buffs: [],
      skills: [],
      sprite: 'player_male',
      realm: player.realm,
    };
  }
}
