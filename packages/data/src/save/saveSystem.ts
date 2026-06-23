import { SaveData, PlayerData } from '@fanren/core';
import { usePlayerStore } from '../stores/playerStore';

const SAVE_KEY = 'fanren_save';
const SAVE_VERSION = '0.1.0';

export function saveGame(slot: number = 1): boolean {
  try {
    const player = usePlayerStore.getState().player;
    if (!player) return false;

    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      player,
      npcs: [],
      quests: [],
      settings: {
        musicVolume: 0.7,
        sfxVolume: 0.8,
        textSpeed: 'NORMAL',
        autoSave: true,
        language: 'zh-CN',
      },
    };

    localStorage.setItem(`${SAVE_KEY}_${slot}`, JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
}

export function loadGame(slot: number = 1): SaveData | null {
  try {
    const raw = localStorage.getItem(`${SAVE_KEY}_${slot}`);
    if (!raw) return null;
    const data: SaveData = JSON.parse(raw);
    if (data.version !== SAVE_VERSION) {
      console.warn('Save version mismatch');
    }
    return data;
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
}

export function getSaveSlots(): { slot: number; timestamp: number; realm: string; name: string }[] {
  const slots = [];
  for (let i = 1; i <= 4; i++) {
    const raw = localStorage.getItem(`${SAVE_KEY}_${i}`);
    if (raw) {
      const data: SaveData = JSON.parse(raw);
      slots.push({
        slot: i,
        timestamp: data.timestamp,
        realm: data.player.realm,
        name: data.player.name,
      });
    }
  }
  return slots;
}

export function deleteSave(slot: number): void {
  localStorage.removeItem(`${SAVE_KEY}_${slot}`);
}

export function autoSave(): void {
  saveGame(4); // Slot 4 is auto-save
}
