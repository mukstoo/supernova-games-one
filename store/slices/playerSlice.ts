// store/slices/playerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { weapons, armors, Item } from '../../utils/items';
import type { Weapon, Armor } from '../../utils/items';
import { QuestReward, Quest } from '../../utils/questTypes';
import type { Coor } from '../../utils/mapGen';
import { RootState } from '../index';

export interface Traits {
  str: number; // Strength
  spd: number; // Agility / Speed
  stm: number; // Endurance / Stamina
  smr: number; // Intelligence / Smarts
  reputation: number;
  persuade: number; // New: replaces gatherInformation
  travel: number;
  medicine: number; // New: replaces heal
  craft: number;
  perception: number;
  stealth: number;
  athletics: number;
  survival: number; // New skill
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
  inventory: Array<Item>;
  equipped: Equipped;
  startingWeapon: 'sword' | 'axe' | 'spear' | null; // Added starting weapon
  initiative: number;
  attack: number;
  defense: number;
  damage: number;
  damageReduction: number;
  hp: number; // Max HP
  currentHp: number;
  stamina: number; // Max Stamina
  currentStamina: number; // Current Stamina
  quests: PlayerQuestsState;
  gold: number;
  xp: number;
  // Training related state
  trainingFocus: keyof Traits | null;
  trainingProgress: { [traitKey in keyof Traits]?: number };
}

const initialState: PlayerState = {
  name: '',
  traits: {
    str: 1,
    spd: 1,
    stm: 1,
    smr: 1,
    reputation: 0,
    persuade: 0,
    travel: 1,
    medicine: 0,
    craft: 0,
    perception: 0,
    stealth: 0,
    athletics: 0,
    survival: 0,
  },
  attributePoints: 5,
  inventory: [],
  equipped: { weapon: null, armor: null },
  startingWeapon: null,
  initiative: 0,
  attack: 0,
  defense: 0,
  damage: 0,
  damageReduction: 0,
  hp: 0,
  currentHp: 0,
  stamina: 0, // Initialize Max Stamina
  currentStamina: 0, // Initialize Current Stamina
  quests: {},
  gold: 50,
  xp: 0,
  // Training related state
  trainingFocus: null,
  trainingProgress: {},
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    initializeCharacter: (
      state,
      action: PayloadAction<
        Partial<Omit<PlayerState, 'traits' | 'name'>> & { // Omit traits to redefine its partial structure
          name: string;
          traits: Partial<Traits>; // Make all traits partial for initialization
          startingWeapon?: 'sword' | 'axe' | 'spear';
        }
      >
    ) => {
      const { name, traits, startingWeapon } = action.payload;
      state.name = name || '';

      // Base attributes from payload or default to 1 (character creation will send these)
      const baseStr = traits?.str ?? 1;
      const baseSpd = traits?.spd ?? 1;
      const baseStm = traits?.stm ?? 1;
      const baseSmr = traits?.smr ?? 1;

      state.traits = {
        str: baseStr,
        spd: baseSpd,
        stm: baseStm,
        smr: baseSmr,
        // Non-skill point traits, default to values if not in payload
        reputation: traits?.reputation ?? 0, // Default to 0 if not passed
        travel: traits?.travel ?? 1,       // Default to 1 if not passed

        // Skills from payload, default to 0 (character creation will send these)
        athletics: traits?.athletics ?? 0,
        persuade: traits?.persuade ?? 0,
        survival: traits?.survival ?? 0,
        stealth: traits?.stealth ?? 0,
        medicine: traits?.medicine ?? 0,
        craft: traits?.craft ?? 0,
        perception: traits?.perception ?? 0,
      };
      state.attributePoints = 0; // Points are spent during creation
      state.startingWeapon = startingWeapon || null;

      // Build inventory - this might need adjustment based on how starting weapon is handled
      // For now, keeping existing logic, but it might conflict/overlap with chosen starting weapon
      state.inventory = [
        ...weapons.filter((w) => w.strengthRequirement <= state.traits.str), // Changed to <=
        ...armors.filter((a) => a.strengthRequirement <= state.traits.str),  // Changed to <=
      ];

      // Equip starting weapon if chosen, otherwise default logic
      let equippedStartingWeapon = false;
      if (state.startingWeapon) {
        const weaponToEquip = weapons.find(
          (w) => 
            w.name.toLowerCase().includes(state.startingWeapon!) && // Simple name check
            w.strengthRequirement <= state.traits.str
        );
        if (weaponToEquip) {
          state.equipped.weapon = weaponToEquip;
          equippedStartingWeapon = true;
        }
      }
      
      if (!equippedStartingWeapon) {
        state.equipped.weapon =
          weapons.find(
            (w) =>
              w.strengthRequirement <= state.traits.str && w.quality === 'normal'
          ) || null;
      }
      
      state.equipped.armor =
        armors.find(
          (a) =>
            a.strengthRequirement <= state.traits.str && a.quality === 'normal'
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
      state.stamina = state.traits.stm * 10; // Max stamina based on stm trait
      state.currentStamina = state.stamina; // Full stamina at init
      state.quests = {};
      // Ensure training progress is initialized for all traits, though it could be lazy
      Object.keys(state.traits).forEach(traitKey => {
        state.trainingProgress[traitKey as keyof Traits] = 0;
      });
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
        const oldMaxHp = state.hp;
        const newMaxHp = state.traits.stm * 10;
        state.hp = newMaxHp;
        state.currentHp = Math.min(state.currentHp + (newMaxHp - oldMaxHp), newMaxHp);

        const oldMaxStamina = state.stamina;
        const newMaxStamina = state.traits.stm * 10; // Also update stamina
        state.stamina = newMaxStamina;
        state.currentStamina = Math.min(state.currentStamina + (newMaxStamina - oldMaxStamina), newMaxStamina);
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
        str: 1, // Reset to base values
        spd: 1,
        stm: 1,
        smr: 1,
        reputation: 0,
        persuade: 0,
        travel: 1,
        medicine: 0,
        craft: 0,
        perception: 0,
        stealth: 0,
        athletics: 0,
        survival: 0,
      };
      state.attributePoints = 5; // Or 0 if reset means full re-creation setup
      state.inventory = [];
      state.equipped = { weapon: null, armor: null };
      state.startingWeapon = null;
      state.initiative = 0;
      state.attack = 0;
      state.defense = 0;
      state.damage = 0;
      state.damageReduction = 0;
      state.hp = 0;
      state.currentHp = 0;
      state.stamina = 0;
      state.currentStamina = 0;
      state.quests = {};
      state.gold = 50;
      state.xp = 0;
      // Reset training state
      state.trainingFocus = null;
      state.trainingProgress = {};
      Object.keys(initialState.traits).forEach(traitKey => {
        state.trainingProgress[traitKey as keyof Traits] = 0;
      });
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

          const oldMaxHp = state.hp;
          const newMaxHp = state.traits.stm * 10;
          state.hp = newMaxHp;
          state.currentHp = Math.min(state.currentHp + (newMaxHp - oldMaxHp), newMaxHp);

          const oldMaxStamina = state.stamina;
          const newMaxStamina = state.traits.stm * 10; // Also update stamina
          state.stamina = newMaxStamina;
          state.currentStamina = Math.min(state.currentStamina + (newMaxStamina - oldMaxStamina), newMaxStamina);
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

    completeQuest: (state, action: PayloadAction<{ questId: string; currentTick: number; rewards?: QuestReward[] }>) => {
      const { questId, rewards } = action.payload;
      if (state.quests[questId] && state.quests[questId]?.status === 'active') {
        state.quests[questId]!.status = 'completed';
        if (rewards) {
          rewards.forEach(reward => {
            if (reward.gold) state.gold += reward.gold;
            if (reward.xp) state.xp += reward.xp;
            if (reward.reputationChange) state.traits.reputation += reward.reputationChange;
            // TODO: Handle item rewards (reward.items - array of item IDs)
            // This would require looking up item definitions and adding them to state.inventory
          });
        }
      }
    },

    failQuest: (state, action: PayloadAction<{ questId: string; currentTick: number }>) => {
      const { questId } = action.payload;
      if (state.quests[questId] && state.quests[questId]?.status === 'active') {
        state.quests[questId]!.status = 'failed';
      }
    },

    playerBuysItem: (state, action: PayloadAction<{ item: Item; goldAmount: number }>) => {
      const { item, goldAmount } = action.payload;
      if (state.gold >= goldAmount) {
        state.gold -= goldAmount;
        state.inventory.push(item);
      } else {
        console.warn("Player doesn't have enough gold to buy item:", item.name);
      }
    },

    playerSellsItem: (state, action: PayloadAction<{ item: Item; goldAmount: number }>) => {
      const { item, goldAmount } = action.payload;
      const itemIndex = state.inventory.findIndex(invItem => invItem.id === item.id);
      if (itemIndex > -1) {
        state.inventory.splice(itemIndex, 1);
        state.gold += goldAmount;
      } else {
        console.warn("Player tried to sell an item they don't have:", item.name);
      }
    },

    rest: (state, action: PayloadAction<{ ticksRested: number }>) => {
      const { ticksRested } = action.payload;
      const hpRecoveryPerTick = 5; // Example: Recover 5 HP per tick
      const staminaRecoveryPerTick = 5; // Example: Recover 5 Stamina per tick

      state.currentHp = Math.min(
        state.hp,
        state.currentHp + ticksRested * hpRecoveryPerTick
      );
      state.currentStamina = Math.min(
        state.stamina,
        state.currentStamina + ticksRested * staminaRecoveryPerTick
      );
    },

    takeDamage: (state, action: PayloadAction<number>) => {
      const damage = action.payload;
      const newHp = Math.max(state.currentHp - damage, 0);
      state.currentHp = newHp;
    },

    healPlayer: (state, action: PayloadAction<number>) => {
      const healing = action.payload;
      const newHp = Math.min(state.currentHp + healing, state.hp);
      state.currentHp = newHp;
    },

    addGold: (state, action: PayloadAction<number>) => {
      state.gold += action.payload;
      console.log(`Player gold updated to: ${state.gold}`);
    },

    addXp: (state, action: PayloadAction<number>) => {
      state.xp += action.payload;
      console.log(`Player XP updated to: ${state.xp}`);
    },

    spendGold: (state, action: PayloadAction<number>) => {
      if (state.gold >= action.payload) {
        state.gold -= action.payload;
      } else {
        console.warn("Player doesn't have enough gold to spend:", action.payload);
      }
    },

    // --- TRAINING ACTIONS ---
    setTrainingFocus: (state, action: PayloadAction<keyof Traits | null>) => {
      state.trainingFocus = action.payload;
      // Initialize progress for the new focus if not already present
      if (action.payload && state.trainingProgress[action.payload] === undefined) {
        state.trainingProgress[action.payload] = 0;
      }
    },

    applyTraining: (state, action: PayloadAction<{ ticksApplied: number }>) => {
      const { ticksApplied } = action.payload;
      if (!state.trainingFocus) return; // Can't train without a focus

      const focusTrait = state.trainingFocus;
      let currentLevel = state.traits[focusTrait];
      let progress = state.trainingProgress[focusTrait] || 0;
      let ticksRemainingForSession = ticksApplied;

      // Loop to handle multiple level-ups in one training session
      while (ticksRemainingForSession > 0) {
        const costForNextLevel = currentLevel + 1;
        const ticksNeeded = costForNextLevel - progress;

        if (ticksRemainingForSession >= ticksNeeded) {
          // Level up!
          currentLevel += 1;
          state.traits[focusTrait] = currentLevel;
          ticksRemainingForSession -= ticksNeeded;
          progress = 0; // Reset progress for the new level

          // Recompute derived stats if necessary (similar to allocatePoint)
          if (['smr', 'spd', 'str', 'stm'].includes(focusTrait)) {
            state.initiative = state.traits.smr + state.traits.spd;
            state.attack = state.traits.smr + state.traits.spd;
            state.defense = state.traits.smr + state.traits.spd;
            state.damage =
              state.traits.str + (state.equipped.weapon?.damage ?? 0);
            state.damageReduction =
              state.equipped.armor?.damageReduction ?? 0;
          }
          if (focusTrait === 'stm') {
            const oldMaxHp = state.hp;
            const newMaxHp = state.traits.stm * 10;
            state.hp = newMaxHp;
            state.currentHp = Math.min(state.currentHp + (newMaxHp - oldMaxHp), newMaxHp);

            const oldMaxStamina = state.stamina;
            const newMaxStamina = state.traits.stm * 10;
            state.stamina = newMaxStamina;
            state.currentStamina = Math.min(state.currentStamina + (newMaxStamina - oldMaxStamina), newMaxStamina);
          }
        } else {
          // Not enough ticks in this session to level up, just add progress
          progress += ticksRemainingForSession;
          ticksRemainingForSession = 0;
        }
      }
      state.trainingProgress[focusTrait] = progress; // Store remaining progress
    },
    // --- END TRAINING ACTIONS ---
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
  playerBuysItem,
  playerSellsItem,
  rest,
  takeDamage,
  healPlayer,
  addGold,
  addXp,
  spendGold,
  // Export training actions
  setTrainingFocus,
  applyTraining,
} = playerSlice.actions;

export const selectPlayerGold = (state: RootState) => state.player.gold;
export const selectPlayerInventory = (state: RootState) => state.player.inventory;
export const selectPlayerEquipped = (state: RootState) => state.player.equipped;
export const selectPlayerTraits = (state: RootState) => state.player.traits;

export default playerSlice.reducer;
