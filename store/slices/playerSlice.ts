// store/slices/playerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { allWeapons, type WeaponType } from '../../data/weapons';
import { allArmor } from '../../data/armor';
import { getStartingItems } from '../../data/items';
import type { Weapon, Armor, Item } from '../../data/items';
import { QuestReward, Quest } from '../../utils/questTypes';
import type { Coor } from '../../utils/mapGen';
import { RootState } from '../index';

export interface Traits {
  str: number; // Strength
  agility: number; // Agility (was spd)
  endurance: number; // Endurance (was stm)
  intelligence: number; // Intelligence (was smr)
  reputation: number;
  persuade: number;
  medicine: number;
  craft: number;
  perception: number;
  stealth: number;
  athletics: number;
  survival: number;
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
  startingWeapon: WeaponType | null;
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
    agility: 1,
    endurance: 1,
    intelligence: 1,
    reputation: 0,
    persuade: 0,
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
  stamina: 0,
  currentStamina: 0,
  quests: {},
  gold: 50,
  xp: 0,
  trainingFocus: null,
  trainingProgress: {},
};

// Helper function to calculate all secondary stats
function calculateSecondaryStats(state: PlayerState): void {
  const weaponAttack = state.equipped.weapon?.attack ?? 0;
  const weaponDefense = state.equipped.weapon?.defense ?? 0;
  const weaponDamage = state.equipped.weapon?.damage ?? 0;
  const armorDR = state.equipped.armor?.damageReduction ?? 0;

  // Calculate secondary stats
  state.initiative = state.traits.agility + state.traits.intelligence;
  state.attack = state.traits.agility + state.traits.intelligence + weaponAttack;
  state.defense = state.traits.agility + state.traits.intelligence + weaponDefense;
  state.damage = state.traits.str + weaponDamage;
  state.damageReduction = armorDR;
  
  // Calculate HP and Stamina based on endurance
  const newMaxHp = state.traits.endurance * 10;
  const newMaxStamina = state.traits.endurance * 10;
  
  // If this is initial calculation (HP is 0), set current values to max
  if (state.hp === 0) {
    state.hp = newMaxHp;
    state.currentHp = newMaxHp;
    state.stamina = newMaxStamina;
    state.currentStamina = newMaxStamina;
  } else {
    // Otherwise, adjust current values proportionally
    const hpRatio = state.currentHp / state.hp;
    const staminaRatio = state.currentStamina / state.stamina;
    
    state.hp = newMaxHp;
    state.stamina = newMaxStamina;
    state.currentHp = Math.min(Math.round(newMaxHp * hpRatio), newMaxHp);
    state.currentStamina = Math.min(Math.round(newMaxStamina * staminaRatio), newMaxStamina);
  }
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    initializeCharacter: (
      state,
      action: PayloadAction<
        Partial<Omit<PlayerState, 'traits' | 'name'>> & {
          name: string;
          traits: Partial<Traits>;
          startingWeapon?: WeaponType;
        }
      >
    ) => {
      const { name, traits, startingWeapon } = action.payload;
      
      // Reset to initial state first to ensure clean slate, but create new object references
      state.name = '';
      state.traits = {
        str: 1,
        agility: 1,
        endurance: 1,
        intelligence: 1,
        reputation: 0,
        persuade: 0,
        medicine: 0,
        craft: 0,
        perception: 0,
        stealth: 0,
        athletics: 0,
        survival: 0,
      };
      state.attributePoints = 5;
      state.inventory = [];
      state.equipped = { weapon: null, armor: null }; // Create new object
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
      state.trainingFocus = null;
      state.trainingProgress = {};
      
      state.name = name || '';

      // Base attributes from payload or default to 1
      const baseStr = traits?.str ?? 1;
      const baseAgility = traits?.agility ?? 1;
      const baseEndurance = traits?.endurance ?? 1;
      const baseIntelligence = traits?.intelligence ?? 1;

      state.traits = {
        str: baseStr,
        agility: baseAgility,
        endurance: baseEndurance,
        intelligence: baseIntelligence,
        reputation: traits?.reputation ?? 0,
        athletics: traits?.athletics ?? 0,
        persuade: traits?.persuade ?? 0,
        survival: traits?.survival ?? 0,
        stealth: traits?.stealth ?? 0,
        medicine: traits?.medicine ?? 0,
        craft: traits?.craft ?? 0,
        perception: traits?.perception ?? 0,
      };
      
      state.attributePoints = 0;
      state.startingWeapon = startingWeapon || null;

      // Get appropriate poor quality weapon and armor based on strength
      let equippedWeapon = null;
      if (startingWeapon) {
        equippedWeapon = allWeapons.find(weapon => 
          weapon.type === startingWeapon && 
          weapon.strengthRequirement === state.traits.str && 
          weapon.quality === 'poor'
        ) || allWeapons.find(weapon => 
          weapon.type === startingWeapon && 
          weapon.strengthRequirement === state.traits.str
        );
      }

      const equippedArmor = allArmor.find(armor => 
        armor.strengthRequirement === state.traits.str && 
        armor.quality === 'poor'
      ) || allArmor.find(armor => 
        armor.strengthRequirement === state.traits.str
      );

      // Set equipment
      state.equipped.weapon = equippedWeapon || null;
      state.equipped.armor = equippedArmor || null;

      // Build inventory with only starting items (no duplicates of equipped items)
      const startingConsumables = getStartingItems();
      state.inventory = [...startingConsumables];

      // Add the equipped weapon and armor to inventory so they can be unequipped/re-equipped
      if (equippedWeapon) {
        state.inventory.push(equippedWeapon);
      }
      if (equippedArmor) {
        state.inventory.push(equippedArmor);
      }

      // Compute derived stats with new attribute names
      calculateSecondaryStats(state);
      
      // Initialize training progress for all traits
      Object.keys(state.traits).forEach(traitKey => {
        state.trainingProgress[traitKey as keyof Traits] = 0;
      });
    },

    incrementTrait: (
      state,
      action: PayloadAction<{
        key: keyof Traits;
        cost: number;
      }>
    ) => {
      const { key, cost } = action.payload;
      if (state.attributePoints >= cost) {
        state.traits[key] += 1;
        state.attributePoints -= cost;

        // Update derived stats if core attributes changed
        if (['intelligence', 'agility', 'str', 'endurance'].includes(key)) {
          calculateSecondaryStats(state);
        }
      }
    },

    resetPlayer: (state) => {
      Object.assign(state, {
        ...initialState,
        traits: {
          str: 1,
          agility: 1,
          endurance: 1,
          intelligence: 1,
          reputation: 0,
          persuade: 0,
          medicine: 0,
          craft: 0,
          perception: 0,
          stealth: 0,
          athletics: 0,
          survival: 0,
        },
        inventory: [],
        equipped: { weapon: null, armor: null },
        stamina: 0,
        currentStamina: 0,
        quests: {},
        trainingFocus: null,
        trainingProgress: {},
      });
    },

    trainSkill: (
      state,
      action: PayloadAction<{
        key: keyof Traits;
        progress: number;
      }>
    ) => {
      const { key, progress } = action.payload;

      // Initialize progress if it doesn't exist
      if (!state.trainingProgress[key]) {
        state.trainingProgress[key] = 0;
      }

      // Add progress
      state.trainingProgress[key]! += progress;

      // Check if enough progress to level up (100 points = 1 level)
      const progressNeeded = 100;
      if (state.trainingProgress[key]! >= progressNeeded) {
        state.trainingProgress[key]! -= progressNeeded;
        state.traits[key] += 1;

        // Update derived stats if core attributes changed
        if (['intelligence', 'agility', 'str', 'endurance'].includes(key)) {
          calculateSecondaryStats(state);
        }
      }
    },

    restoreHealth: (
      state,
      action: PayloadAction<{
        healthToRestore: number;
        ticksRested: number;
      }>
    ) => {
      const { healthToRestore, ticksRested } = action.payload;
      const staminaRecoveryPerTick = 5;

      // Restore health
      state.currentHp = Math.min(state.hp, state.currentHp + healthToRestore);

      // Restore stamina based on ticks rested
      state.currentStamina = Math.min(
        state.stamina,
        state.currentStamina + ticksRested * staminaRecoveryPerTick
      );
    },

    completeTraining: (
      state,
      action: PayloadAction<{
        trait: keyof Traits;
        pointsGained: number;
      }>
    ) => {
      const { trait: focusTrait, pointsGained } = action.payload;

      // Add the points to the trait
      state.traits[focusTrait] += pointsGained;

      // Reset training focus
      state.trainingFocus = null;

      // Update derived stats if core attributes changed
      if (['intelligence', 'agility', 'str', 'endurance'].includes(focusTrait)) {
        calculateSecondaryStats(state);
      }
    },

    incrementAttributePoints: (state, action: PayloadAction<number>) => {
      state.attributePoints += action.payload;
    },

    equipWeapon: (state, action: PayloadAction<Weapon>) => {
      state.equipped.weapon = action.payload;
      calculateSecondaryStats(state);
    },

    equipArmor: (state, action: PayloadAction<Armor>) => {
      state.equipped.armor = action.payload;
      calculateSecondaryStats(state);
    },

    updateTraits: (state, action: PayloadAction<Partial<Traits>>) => {
      // Use a loop or individual checks for clarity/safety
      const updates = action.payload;
      let derivedChanged = false;
      (Object.keys(updates) as Array<keyof Traits>).forEach((key) => {
          if (updates[key] !== undefined && state.traits[key] !== undefined) {
              state.traits[key] = updates[key]!;
              if (['intelligence', 'agility', 'str', 'endurance'].includes(key)) {
                  derivedChanged = true;
              }
          }
      });

      // Recompute derived only if relevant base traits changed
      if (derivedChanged) {
          calculateSecondaryStats(state);
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
          if (['intelligence', 'agility', 'str', 'endurance'].includes(focusTrait)) {
            calculateSecondaryStats(state);
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
  incrementTrait,
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
  setTrainingFocus,
  applyTraining,
  incrementAttributePoints,
  equipWeapon,
  equipArmor,
  trainSkill,
  restoreHealth,
  completeTraining,
} = playerSlice.actions;

export const selectPlayerGold = (state: RootState) => state.player.gold;
export const selectPlayerInventory = (state: RootState) => state.player.inventory;
export const selectPlayerEquipped = (state: RootState) => state.player.equipped;
export const selectPlayerTraits = (state: RootState) => state.player.traits;

export default playerSlice.reducer;
