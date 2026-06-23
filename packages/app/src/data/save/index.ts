export {
  saveGame,
  loadGame,
  loadGameToStore,
  getSaveSlots,
  deleteSave,
  autoSave,
  saveCurrentGame,
  getCurrentSlot,
  setCurrentSlot,
  clearCurrentSlot,
  startAutoSave,
  stopAutoSave,
  formatSaveTime,
} from './saveSystem';

export type { SaveSlotInfo } from './saveSystem';
