// store/slices/playerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { weapons, armors } from '../../utils/items';
import type { Weapon, Armor } from '../../utils/items';

export interface Traits {
  str: number;
  spd: number;
  stm: number;
  smr: number;
}

export interface Equipped {
  weapon: Weapon | null;
  armor: Armor | null;
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
}

const initialState: PlayerState = {
  name: '',
  traits: { str: 5, spd: 5, stm: 5, smr: 5 },
  attributePoints: 0,
  inventory: [],
  equipped: { weapon: null, armor: null },
  initiative: 0,
  attack: 0,
  defense: 0,
  damage: 0,
  damageReduction: 0,
  hp: 0,
  currentHp: 0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    initializeCharacter: (
      state,
      action: PayloadAction<{ name: string; traits: Traits }>
    ) => {
      const { name, traits } = action.payload;
      state.name = name;
      state.traits = traits;
      state.attributePoints = 0;

      // Build inventory
      state.inventory = [
        ...weapons.filter((w) => w.strengthRequirement === traits.str),
        ...armors.filter((a) => a.strengthRequirement === traits.str),
      ];

      // Equip normals
      state.equipped.weapon =
        weapons.find(
          (w) =>
            w.strengthRequirement === traits.str && w.quality === 'normal'
        ) || null;
      state.equipped.armor =
        armors.find(
          (a) =>
            a.strengthRequirement === traits.str && a.quality === 'normal'
        ) || null;

      // Compute derived
      state.initiative = traits.smr + traits.spd;
      state.attack = traits.smr + traits.spd;
      state.defense = traits.smr + traits.spd;
      state.damage =
        traits.str + (state.equipped.weapon?.damage ?? 0);
      state.damageReduction =
        state.equipped.armor?.damageReduction ?? 0;
      state.hp = traits.stm * 10;
      state.currentHp = state.hp;
    },

    incrementAttributePoints: (state, action: PayloadAction<number>) => {
      state.attributePoints += action.payload;
    },

    allocatePoint: (state, action: PayloadAction<keyof Traits>) => {
      const key = action.payload;
      if (state.attributePoints <= 0) return;

      // Increase trait
      state.traits[key] += 1;
      state.attributePoints -= 1;

      // Recompute derived
      state.initiative = state.traits.smr + state.traits.spd;
      state.attack = state.traits.smr + state.traits.spd;
      state.defense = state.traits.smr + state.traits.spd;
      state.damage =
        state.traits.str + (state.equipped.weapon?.damage ?? 0);
      state.damageReduction =
        state.equipped.armor?.damageReduction ?? 0;

      // Adjust HP
      const oldMax = state.hp;
      const newMax = state.traits.stm * 10;
      state.hp = newMax;
      state.currentHp = Math.min(state.currentHp + (newMax - oldMax), newMax);
    },

    equipWeapon: (state, action: PayloadAction<Weapon>) => {
      state.equipped.weapon = action.payload;
      state.damage = state.traits.str + action.payload.damage;
    },

    equipArmor: (state, action: PayloadAction<Armor>) => {
      state.equipped.armor = action.payload;
      state.damageReduction = action.payload.damageReduction;
    },

    resetPlayer: () => initialState,
  },
});

export const {
  initializeCharacter,
  incrementAttributePoints,
  allocatePoint,
  equipWeapon,
  equipArmor,
  resetPlayer,
} = playerSlice.actions;
export default playerSlice.reducer;
