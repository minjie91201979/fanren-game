import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  PlayerData, Realm, SpiritRoot, Attributes, GameTime,
  Equipment, InventorySlot, InventoryItem,
} from '@fanren/core';
import { getBaseAttributes } from '@fanren/core';
import { generateId } from '@fanren/core';

interface PlayerState {
  player: PlayerData | null;
  isNewGame: boolean;

  // Actions
  createPlayer: (name: string, gender: 'MALE' | 'FEMALE', spiritRoots: { root: SpiritRoot; value: number }[]) => void;
  updateAttributes: (delta: Partial<Attributes>) => void;
  addCultivation: (amount: number) => void;
  breakthrough: () => { success: boolean; newRealm: Realm };
  addItem: (item: InventoryItem, quantity: number) => void;
  removeItem: (itemId: string, quantity: number) => boolean;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: string) => void;
  modifyGold: (amount: number) => void;
  advanceTime: (hours: number) => void;
  setPlayer: (player: PlayerData) => void;
  modifyPillToxin: (amount: number) => void;
}

function createDefaultPlayer(name: string, gender: 'MALE' | 'FEMALE'): PlayerData {
  return {
    id: generateId(),
    name,
    title: '',
    gender,
    realm: Realm.MORTAL,
    realmLayer: 1,
    spiritRoots: [],
    attributes: getBaseAttributes(Realm.MORTAL, 1, SpiritRoot.NONE),
    cultivation: 0,
    cultivationToNext: 100,
    age: 16,
    lifespan: 100,
    pillToxin: 0,
    karma: 0,
    gold: 0,
    inventory: [],
    equipment: {},
    skills: [],
    techniques: [],
    reputation: {},
    npcAffinity: {},
    questFlags: {},
    unlockedMaps: ['village_start'],
    gameTime: { year: 1, month: 1, day: 1, hour: 6 },
  };
}

export const usePlayerStore = create<PlayerState>()(
  immer((set) => ({
    player: null,
    isNewGame: true,

    createPlayer: (name, gender, spiritRoots) => {
      const player = createDefaultPlayer(name, gender);
      player.spiritRoots = spiritRoots;
      // Apply spirit root bonuses
      if (spiritRoots.length > 0) {
        const mainRoot = spiritRoots[0].root;
        const baseAttrs = getBaseAttributes(Realm.MORTAL, 1, mainRoot);
        player.attributes = baseAttrs;
      }
      set((s) => { s.player = player; s.isNewGame = false; });
    },

    updateAttributes: (delta) => set((s) => {
      if (!s.player) return;
      for (const key of Object.keys(delta) as (keyof Attributes)[]) {
        const val = delta[key];
        if (val !== undefined) {
          (s.player.attributes as Record<string, number>)[key] += val;
        }
      }
      // Clamp HP/MP
      s.player.attributes.hp = Math.max(0, Math.min(s.player.attributes.hp, s.player.attributes.maxHp));
      s.player.attributes.mp = Math.max(0, Math.min(s.player.attributes.mp, s.player.attributes.maxMp));
    }),

    addCultivation: (amount) => set((s) => {
      if (!s.player) return;
      s.player.cultivation += amount;
    }),

    breakthrough: () => {
      let result = { success: false, newRealm: Realm.MORTAL };
      set((s) => {
        if (!s.player) return;
        if (s.player.cultivation < s.player.cultivationToNext) return;
        const baseRate = 0.9 - Object.values(Realm).indexOf(s.player.realm) * 0.2;
        const success = Math.random() < Math.max(0.05, baseRate - s.player.pillToxin * 0.005);
        if (success) {
          s.player.realmLayer++;
          if (s.player.realmLayer > 13 && s.player.realm === Realm.QI_REFINING) {
            s.player.realm = Realm.FOUNDATION;
            s.player.realmLayer = 1;
          }
          s.player.cultivation = 0;
          s.player.cultivationToNext = Math.floor(s.player.cultivationToNext * 1.5);
          s.player.lifespan += 20;
          s.player.attributes = getBaseAttributes(s.player.realm, s.player.realmLayer, s.player.spiritRoots[0]?.root ?? SpiritRoot.NONE);
          result = { success: true, newRealm: s.player.realm };
        } else {
          s.player.cultivation = Math.floor(s.player.cultivation * 0.5);
          s.player.pillToxin = Math.min(100, s.player.pillToxin + 5);
        }
      });
      return result;
    },

    addItem: (item, quantity) => set((s) => {
      if (!s.player) return;
      if (item.stackable) {
        const existing = s.player.inventory.find(
          (i: InventorySlot) => i.item.id === item.id
        );
        if (existing) {
          existing.quantity += quantity;
          return;
        }
      }
      s.player.inventory.push({ item, quantity });
    }),

    removeItem: (itemId, quantity) => {
      let removed = false;
      set((s) => {
        if (!s.player) return;
        const idx = s.player.inventory.findIndex((i: InventorySlot) => i.item.id === itemId);
        if (idx === -1) return;
        const slot = s.player.inventory[idx];
        if (slot.quantity > quantity) {
          slot.quantity -= quantity;
          removed = true;
        } else {
          s.player.inventory.splice(idx, 1);
          removed = true;
        }
      });
      return removed;
    },

    equipItem: (itemId) => set((s) => {
      if (!s.player) return;
      const slot = s.player.inventory.find((i: InventorySlot) => i.item.id === itemId);
      if (!slot) return;
      // Find equipment item
      const equipItem = slot.item as any;
      if (equipItem.slot) {
        // Unequip current
        const currentEquip = s.player.equipment[equipItem.slot as keyof Equipment];
        if (currentEquip) {
          s.player.inventory.push({ item: currentEquip, quantity: 1 });
        }
        s.player.equipment[equipItem.slot as keyof Equipment] = equipItem;
        // Remove from inventory
        const idx = s.player.inventory.indexOf(slot);
        if (slot.quantity > 1) slot.quantity--;
        else s.player.inventory.splice(idx, 1);
      }
    }),

    unequipItem: (slot) => set((s) => {
      if (!s.player) return;
      const equip = s.player.equipment[slot as keyof Equipment];
      if (equip) {
        s.player.inventory.push({ item: equip, quantity: 1 });
        delete s.player.equipment[slot as keyof Equipment];
      }
    }),

    modifyGold: (amount) => set((s) => {
      if (s.player) s.player.gold = Math.max(0, s.player.gold + amount);
    }),

    advanceTime: (hours) => set((s) => {
      if (!s.player) return;
      let h = s.player.gameTime.hour + hours;
      while (h >= 24) { h -= 24; s.player.gameTime.day++; }
      while (s.player.gameTime.day > 30) { s.player.gameTime.day -= 30; s.player.gameTime.month++; }
      while (s.player.gameTime.month > 12) { s.player.gameTime.month -= 12; s.player.gameTime.year++; }
      s.player.gameTime.hour = h;
      s.player.age += Math.floor(hours / (24 * 30));
    }),

    setPlayer: (player) => set((s) => { s.player = player; s.isNewGame = false; }),

    modifyPillToxin: (amount) => set((s) => {
      if (s.player) s.player.pillToxin = Math.max(0, Math.min(100, s.player.pillToxin + amount));
    }),
  }))
);
