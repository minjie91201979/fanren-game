import { SaveData, PlayerData, CaveDwelling, NPC, ActiveQuest, GameSettings } from '@/core';
import { usePlayerStore } from '@/data/stores/playerStore';
import { useCaveStore } from '@/data/stores/caveStore';

const SAVE_KEY = 'fanren_save';
const SAVE_VERSION = '0.1.0';
const CURRENT_SLOT_KEY = 'fanren_current_slot';

// 获取/设置当前槽位
export function getCurrentSlot(): number {
  const slot = localStorage.getItem(CURRENT_SLOT_KEY);
  return slot ? parseInt(slot, 10) : 0;
}

export function setCurrentSlot(slot: number): void {
  localStorage.setItem(CURRENT_SLOT_KEY, slot.toString());
}

export function clearCurrentSlot(): void {
  localStorage.removeItem(CURRENT_SLOT_KEY);
}

// 保存游戏到指定槽位
export function saveGame(slot: number = 1): boolean {
  try {
    const player = usePlayerStore.getState().player;
    const cave = useCaveStore.getState().cave;
    if (!player) return false;

    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      player,
      cave,
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
    setCurrentSlot(slot);
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
}

// 保存当前游戏（使用记录的槽位）
export function saveCurrentGame(): boolean {
  const slot = getCurrentSlot();
  if (slot <= 0) return false;
  return saveGame(slot);
}

// 加载游戏
export function loadGame(slot: number): SaveData | null {
  try {
    const raw = localStorage.getItem(`${SAVE_KEY}_${slot}`);
    if (!raw) return null;
    const data: SaveData = JSON.parse(raw);
    if (data.version !== SAVE_VERSION) {
      console.warn('Save version mismatch, but still loading');
    }
    setCurrentSlot(slot);
    return data;
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
}

// 加载游戏并恢复到 store
export function loadGameToStore(slot: number): boolean {
  const data = loadGame(slot);
  if (!data) return false;

  const { setPlayer } = usePlayerStore.getState();
  const { setCave } = useCaveStore.getState();

  setPlayer(data.player);
  if (data.cave) {
    setCave(data.cave);
  }

  return true;
}

// 获取所有存档槽位信息
export interface SaveSlotInfo {
  slot: number;
  timestamp: number;
  realm: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  gold: number;
  realmLayer: number;
}

export function getSaveSlots(): SaveSlotInfo[] {
  const slots: SaveSlotInfo[] = [];
  for (let i = 1; i <= 6; i++) {
    const raw = localStorage.getItem(`${SAVE_KEY}_${i}`);
    if (raw) {
      try {
        const data: SaveData = JSON.parse(raw);
        slots.push({
          slot: i,
          timestamp: data.timestamp,
          realm: data.player.realm,
          name: data.player.name,
          gender: data.player.gender,
          age: data.player.age,
          gold: data.player.gold,
          realmLayer: data.player.realmLayer,
        });
      } catch {
        // ignore corrupted save
      }
    }
  }
  return slots;
}

// 删除存档
export function deleteSave(slot: number): void {
  localStorage.removeItem(`${SAVE_KEY}_${slot}`);
  if (getCurrentSlot() === slot) {
    clearCurrentSlot();
  }
}

// 自动保存（保存到当前槽位）
export function autoSave(): boolean {
  return saveCurrentGame();
}

// 启动定时自动保存（每5分钟）
let autoSaveInterval: number | null = null;

export function startAutoSave(intervalMs: number = 5 * 60 * 1000): void {
  stopAutoSave();
  autoSaveInterval = window.setInterval(() => {
    if (getCurrentSlot() > 0 && usePlayerStore.getState().player) {
      saveCurrentGame();
      console.log('Auto-saved');
    }
  }, intervalMs);
}

export function stopAutoSave(): void {
  if (autoSaveInterval !== null) {
    window.clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// 格式化时间显示
export function formatSaveTime(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `今天 ${h}:${m}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `昨天 ${h}:${m}`;
  }
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
}

// ==================== 导出/导入 ====================

/** 导出当前存档为 JSON 文件下载 */
export function exportSave(): boolean {
  try {
    const player = usePlayerStore.getState().player;
    const cave = useCaveStore.getState().cave;
    if (!player) return false;

    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      player,
      cave,
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

    const json = JSON.stringify(saveData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 生成文件名：角色名_境界_时间戳
    const realmShort = player.realm.replace(/_/g, '').slice(0, 4);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `${player.name}_${realmShort}_${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (e) {
    console.error('Export failed:', e);
    return false;
  }
}

/** 从 JSON 字符串导入存档并恢复到 store */
export function importSave(jsonStr: string): { ok: boolean; error?: string; name?: string } {
  try {
    const data = JSON.parse(jsonStr);

    // 校验必要字段
    if (!data.player || !data.player.id || !data.player.name) {
      return { ok: false, error: '存档数据不完整：缺少角色信息' };
    }
    if (!data.player.realm || !data.player.attributes) {
      return { ok: false, error: '存档数据不完整：缺少属性或境界信息' };
    }
    if (data.version !== SAVE_VERSION) {
      console.warn('Save version mismatch, but still importing');
    }

    const { setPlayer } = usePlayerStore.getState();
    const { setCave } = useCaveStore.getState();

    setPlayer(data.player);
    if (data.cave) {
      setCave(data.cave);
    }

    // 设置当前槽位（导入后自动保存到槽位1）
    setCurrentSlot(1);
    saveGame(1);

    return {
      ok: true,
      name: `${data.player.name} (${data.player.realm})`,
    };
  } catch (e: any) {
    console.error('Import failed:', e);
    return { ok: false, error: `解析失败: ${e.message || '未知错误'}` };
  }
}

/** 判断导入数据是否为合法存档 */
export function validateImportData(jsonStr: string): { ok: boolean; name?: string; realm?: string; gold?: number } {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.player?.id || !data.player?.name) return { ok: false };
    return {
      ok: true,
      name: data.player.name,
      realm: data.player.realm,
      gold: data.player.gold,
    };
  } catch {
    return { ok: false };
  }
}
