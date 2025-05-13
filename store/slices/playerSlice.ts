// store/slices/playerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { weapons, armors } from '../../utils/items';
import type { Weapon, Armor } from '../../utils/items';
import { QuestReward, Quest } from '../../utils/questTypes';
import type { Coor } from '../../utils/mapGen';

export interface Traits {
  str: number;
  spd: number;
  stm: number;
  smr: number;
  reputation: number;
  gatherInformation: number;
  travel: number;
  heal: number;
  craft: number;
  perception: number;
  stealth: number;
  athletics: number;
}

export interface Equipped {
  weapon: Weapon | null;
  armor: Armor | null;
}

export type QuestStatus = 'active' | 'completed' | 'failed';

export interface QuestStatusInfo {
  id: string; // Quest ID
  status: QuestStatus;
  acceptedAtTick?: number;
  location?: Coor;
  // completedAtTick?: number; // Add if needed for specific game logic
  // failedAtTick?: number; // Add if needed for specific game logic
  // We can infer completion/failure time from other game events or simply rely on status
}

export interface PlayerQuestsState {
  [questId: string]: QuestStatusInfo;
}

export interface PlayerState {
  name: string;
  traits: Traits;
  attributePoints: number;
  inventory: Array<Weapon | Armor>;
  equipped: Equipped;
  initiative: number;
  attack: number;
  defense: number;
  damage: number;
  damageReduction: number;
  hp: number;
  currentHp: number;
  quests: PlayerQuestsState;
  gold: number;
  xp: number;
}

const initialState: PlayerState = {
  name: '',
  traits: {
    str: 1,
    spd: 1,
    stm: 1,
    smr: 1,
    reputation: 0,
    gatherInformation: 1,
    travel: 1,
    heal: 1,
    craft: 1,
    perception: 1,
    stealth: 1,
    athletics: 1,
  },
  attributePoints: 5,
  inventory: [],
  equipped: { weapon: null, armor: null },
  initiative: 0,
  attack: 0,
  defense: 0,
  damage: 0,
  damageReduction: 0,
  hp: 0,
  currentHp: 0,
  quests: {},
  gold: 50,
  xp: 0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    initializeCharacter: (
      state,
      action: PayloadAction<Partial<PlayerState> & { name: string }>
    ) => {
      const { name, traits } = action.payload;
      state.name = name || '';
      state.traits = {
        str: 5,
        spd: 5,
        stm: 5,
        smr: 5,
        reputation: 2,
        gatherInformation: 2,
        travel: 2,
        heal: 2,
        craft: 2,
        perception: 2,
        stealth: 2,
        athletics: 2,
        ...traits,
      };
      state.attributePoints = 0;

      // Build inventory
      state.inventory = [
        ...weapons.filter((w) => w.strengthRequirement === state.traits.str),
        ...armors.filter((a) => a.strengthRequirement === state.traits.str),
      ];

      // Equip normals
      state.equipped.weapon =
        weapons.find(
          (w) =>
            w.strengthRequirement === state.traits.str && w.quality === 'normal'
        ) || null;
      state.equipped.armor =
        armors.find(
          (a) =>
            a.strengthRequirement === state.traits.str && a.quality === 'normal'
        ) || null;

      // Compute derived
      state.initiative = state.traits.smr + state.traits.spd;
      state.attack = state.traits.smr + state.traits.spd;
      state.defense = state.traits.smr + state.traits.spd;
      state.damage =
        state.traits.str + (state.equipped.weapon?.damage ?? 0);
      state.damageReduction =
        state.equipped.armor?.damageReduction ?? 0;
      state.hp = state.traits.stm * 10;
      state.currentHp = state.hp;
      state.quests = {};
    },

    incrementAttributePoints: (state, action: PayloadAction<number>) => {
      state.attributePoints += action.payload;
    },

    allocatePoint: (state, action: PayloadAction<keyof Traits>) => {
      const key = action.payload;
      if (state.attributePoints <= 0) return;

      state.traits[key] += 1;
      state.attributePoints -= 1;

      // Recompute derived stats (only if relevant traits changed)
      if (['smr', 'spd', 'str', 'stm'].includes(key)) {
        state.initiative = state.traits.smr + state.traits.spd;
        state.attack = state.traits.smr + state.traits.spd;
        state.defense = state.traits.smr + state.traits.spd;
        state.damage =
          state.traits.str + (state.equipped.weapon?.damage ?? 0);
        state.damageReduction =
          state.equipped.armor?.damageReduction ?? 0;
      }
      if (key === 'stm') {
        const oldMax = state.hp;
        const newMax = state.traits.stm * 10;
        state.hp = newMax;
        state.currentHp = Math.min(state.currentHp + (newMax - oldMax), newMax);
      }
      // Note: perception, stealth, athletics don't directly affect these derived stats currently
    },

    equipWeapon: (state, action: PayloadAction<Weapon>) => {
      state.equipped.weapon = action.payload;
      state.damage = state.traits.str + action.payload.damage;
    },

    equipArmor: (state, action: PayloadAction<Armor>) => {
      state.equipped.armor = action.payload;
      state.damageReduction = action.payload.damageReduction;
    },

    resetPlayer: (state) => {
      state.name = '';
      state.traits = {
        str: 5,
        spd: 5,
        stm: 5,
        smr: 5,
        reputation: 2,
        gatherInformation: 2,
        travel: 2,
        heal: 2,
        craft: 2,
        perception: 2,
        stealth: 2,
        athletics: 2,
      };
      state.attributePoints = 0;
      state.inventory = [];
      state.equipped = { weapon: null, armor: null };
      state.initiative = 0;
      state.attack = 0;
      state.defense = 0;
      state.damage = 0;
      state.damageReduction = 0;
      state.hp = 0;
      state.currentHp = 0;
      state.quests = {};
      state.gold = 50;
      state.xp = 0;
    },

    updateTraits: (state, action: PayloadAction<Partial<Traits>>) => {
      // Use a loop or individual checks for clarity/safety
      const updates = action.payload;
      let derivedChanged = false;
      (Object.keys(updates) as Array<keyof Traits>).forEach((key) => {
          if (updates[key] !== undefined && state.traits[key] !== undefined) {
              state.traits[key] = updates[key]!;
              if (['smr', 'spd', 'str', 'stm'].includes(key)) {
                  derivedChanged = true;
              }
          }
      });

      // Recompute derived only if relevant base traits changed
      if (derivedChanged) {
          state.initiative = state.traits.smr + state.traits.spd;
          state.attack = state.traits.smr + state.traits.spd;
          state.defense = state.traits.smr + state.traits.spd;
          state.damage =
              state.traits.str + (state.equipped.weapon?.damage ?? 0);
          state.damageReduction =
              state.equipped.armor?.damageReduction ?? 0;

          const oldMax = state.hp;
          const newMax = state.traits.stm * 10;
          state.hp = newMax;
          state.currentHp = Math.min(state.currentHp + (newMax - oldMax), newMax);
      }
    },

    startQuest: (
      state,
      action: PayloadAction<{
        questId: string;
        currentTick: number;
        location?: Coor;
      }>
    ) => {
      const { questId, currentTick, location } = action.payload;
      if (!state.quests[questId] || state.quests[questId]?.status === 'failed') {
        state.quests[questId] = {
          id: questId,
          status: 'active',
          acceptedAtTick: currentTick,
          location: location,
        };
      }
    },

    completeQuest: (state, action: PayloadAction<{ questId: string; currentTick: number }>) => {
      const { questId } = action.payload;
      if (state.quests[questId] && state.quests[questId]?.status === 'active') {
        state.quests[questId]!.status = 'completed';
      }
    },

    failQuest: (state, action: PayloadAction<{ questId: string; currentTick: number }>) => {
      const { questId } = action.payload;
      if (state.quests[questId] && state.quests[questId]?.status === 'active') {
        state.quests[questId]!.status = 'failed';
      }
    },
  },
});

export const {
  initializeCharacter,
  incrementAttributePoints,
  allocatePoint,
  equipWeapon,
  equipArmor,
  resetPlayer,
  updateTraits,
  startQuest,
  completeQuest,
  failQuest,
} = playerSlice.actions;

export default playerSlice.reducer;
