// utils/questLogic.ts
import { Quest } from './questTypes';
import { allQuests } from './quests';
// Note: Player Traits (like INT, PER) and specific stat values (Reputation)
// are expected to be used by the *caller* of discoverQuests to calculate the initial diceRollResult.
// import { Traits } from '../store/slices/playerSlice'; // Not directly used in this file after refactor

// --- Helper Functions ---

// Define quest rarities (1: Common, 5: Legendary)
// These values should ideally align with Quest.rarity values if they are numbers
export const QUEST_RARITY_LEVELS = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
} as const;

type RarityLevel = typeof QUEST_RARITY_LEVELS[keyof typeof QUEST_RARITY_LEVELS];

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

// --- Discovery Function ---

interface DiscoveryParameters {
  // playerTraits: Traits; // Raw traits, if needed for any direct checks here (currently not)
  activeQuestIds: string[];
  completedQuestIds: string[];
  failedQuestIds: string[];
  /** The final calculated dice roll result (e.g., 4dF + INT + PER + REP), expected to be 1-10 after capping by caller. */
  calculatedRoll: number; 
}

/** 
 * Determines which quests are discovered based on a calculated roll result (1-10).
 * The roll should incorporate 4dF, player stats (Intelligence, Persuasion), and Reputation.
 * Returns an array of 1 to 5 discovered quests.
 * The caller is responsible for the initial roll calculation and time advancement.
 */
export function discoverQuests({
  activeQuestIds,
  completedQuestIds,
  failedQuestIds,
  calculatedRoll, 
}: DiscoveryParameters): Quest[] {
  
  // 1. Ensure calculatedRoll is within 1-10 (though caller should ideally cap it too)
  const cappedRoll = clamp(calculatedRoll, 1, 10);

  // 2. Determine Number of Quests and Max Rarity based on Capped Roll
  // User's desired mapping:
  // Roll 1-2: 1 quest, low rarity (Common)
  // Roll 3-4: 2 quests, mixed rarity (up to Uncommon)
  // Roll 5-6: 3 quests, mixed rarity, chance of medium (up to Rare)
  // Roll 7-8: 4 quests, good chance of medium, small chance of high (up to Epic)
  // Roll 9-10: 5 quests, good chance of medium/high (up to Legendary)
  let numQuestsToFind: number;
  let maxRarity: RarityLevel;

  if (cappedRoll <= 2) {         // Roll 1-2
    numQuestsToFind = 1;
    maxRarity = QUEST_RARITY_LEVELS.COMMON;
  } else if (cappedRoll <= 4) { // Roll 3-4
    numQuestsToFind = 2;
    maxRarity = QUEST_RARITY_LEVELS.UNCOMMON;
  } else if (cappedRoll <= 6) { // Roll 5-6
    numQuestsToFind = 3;
    maxRarity = QUEST_RARITY_LEVELS.RARE;
  } else if (cappedRoll <= 8) { // Roll 7-8
    numQuestsToFind = 4;
    maxRarity = QUEST_RARITY_LEVELS.EPIC;
  } else {                      // Roll 9-10
    numQuestsToFind = 5;
    maxRarity = QUEST_RARITY_LEVELS.LEGENDARY;
  }

  // 3. Filter Master Pool for Available Quests
  const alreadyTakenOrFinishedIds = new Set([
    ...activeQuestIds,
    ...completedQuestIds,
    ...failedQuestIds,
  ]);

  const availableQuests = allQuests.filter(
    (q: Quest) => 
      !alreadyTakenOrFinishedIds.has(q.id) && 
      (q.rarity || QUEST_RARITY_LEVELS.COMMON) <= maxRarity
  );

  // If not enough quests at the target rarity, try to fill with lower rarity quests
  let selectedQuests: Quest[] = [];
  if (availableQuests.length < numQuestsToFind) {
    // Take all available at current maxRarity
    selectedQuests.push(...availableQuests);
    const remainingNeeded = numQuestsToFind - selectedQuests.length;
    if (remainingNeeded > 0) {
      // Try to find more quests from any rarity below the current maxRarity
      const lowerRarityPool = allQuests.filter(
        (q: Quest) => 
        !alreadyTakenOrFinishedIds.has(q.id) && 
        !selectedQuests.some(sq => sq.id === q.id) && // Don't re-select already picked
        (q.rarity || QUEST_RARITY_LEVELS.COMMON) < maxRarity
      );
      // Sort by highest rarity first among these lower ones
      lowerRarityPool.sort((a,b) => (b.rarity || QUEST_RARITY_LEVELS.COMMON) - (a.rarity || QUEST_RARITY_LEVELS.COMMON));
      selectedQuests.push(...lowerRarityPool.slice(0, remainingNeeded));
    }
  } else {
    // We have enough (or more than enough) quests at the target rarity
    // Sort by rarity (descending) to prioritize rarer ones within the cap, then shuffle for variety
    availableQuests.sort((a, b) => (b.rarity || QUEST_RARITY_LEVELS.COMMON) - (a.rarity || QUEST_RARITY_LEVELS.COMMON));
    selectedQuests = availableQuests.slice(0, numQuestsToFind); 
  }

  // Ensure at least one quest is returned if possible and numQuestsToFind >=1
  if (numQuestsToFind > 0 && selectedQuests.length === 0) {
    const anyPool = allQuests.filter((q: Quest) => !alreadyTakenOrFinishedIds.has(q.id));
    if (anyPool.length > 0) {
      anyPool.sort((a,b) => (a.rarity || QUEST_RARITY_LEVELS.COMMON) - (b.rarity || QUEST_RARITY_LEVELS.COMMON));
      return [anyPool[0]]; // Return the absolute most common available quest
    }
  }

  // Shuffle selected quests for variety if desired, or just return as is (sorted by rarity desc)
  // For now, returning sorted by rarity (higher rarity quests appear first if multiple match criteria)
  return selectedQuests;
} 