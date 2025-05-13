// utils/questLogic.ts
import { Quest } from './questTypes';
import { allQuests } from './quests';
import { Traits } from '../store/slices/playerSlice';

// --- Helper Functions ---

// Define quest rarities (assuming 1: Common, 5: Legendary)
const QUEST_RARITY = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
} as const;

type RarityLevel = typeof QUEST_RARITY[keyof typeof QUEST_RARITY];

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

// --- Discovery Function ---

interface DiscoveryInput {
  playerTraits: Traits;
  activeQuestIds: string[];
  completedQuestIds: string[];
  diceRollResult: number; // This is the raw result from the dice roller (e.g., 4dF + mods)
}

/** 
 * Determines which quests are discovered based on the capped dice roll result.\n * Maps the result (1-10) to a specific number and max rarity of quests.\n * Returns an array of 1 to 5 discovered quests.
 */
export function discoverQuests({ 
  playerTraits, // Note: Traits are no longer directly used in the quest selection logic, but kept for potential future use
  activeQuestIds,
  completedQuestIds,
  diceRollResult, 
}: DiscoveryInput): Quest[] {
  
  // 1. Cap the dice roll result to the 1-10 range
  const cappedRoll = clamp(diceRollResult, 1, 10);

  // 2. Determine Number of Quests and Max Rarity based on Capped Roll
  let numQuestsToFind: number;
  let maxRarity: RarityLevel;

  if (cappedRoll <= 1) {
    numQuestsToFind = 1;
    maxRarity = QUEST_RARITY.COMMON;
  } else if (cappedRoll <= 3) { // 2-3
    numQuestsToFind = clamp(Math.floor(Math.random() * 2) + 1, 1, 2); // 1 or 2 quests
    maxRarity = QUEST_RARITY.UNCOMMON;
  } else if (cappedRoll <= 5) { // 4-5
    numQuestsToFind = clamp(Math.floor(Math.random() * 2) + 2, 2, 3); // 2 or 3 quests
    maxRarity = QUEST_RARITY.RARE;
  } else if (cappedRoll <= 7) { // 6-7
    numQuestsToFind = clamp(Math.floor(Math.random() * 2) + 3, 3, 4); // 3 or 4 quests
    maxRarity = QUEST_RARITY.EPIC;
  } else if (cappedRoll <= 9) { // 8-9
    numQuestsToFind = 4;
    maxRarity = QUEST_RARITY.LEGENDARY;
  } else { // 10
    numQuestsToFind = 5;
    maxRarity = QUEST_RARITY.LEGENDARY;
  }

  // 3. Filter Master Pool for Available Quests
  const alreadyTakenIds = new Set([...activeQuestIds, ...completedQuestIds]);
  const availableQuests = allQuests.filter(
    (q: Quest) => !alreadyTakenIds.has(q.id) && (q.rarity || QUEST_RARITY.COMMON) <= maxRarity
  );

  if (availableQuests.length === 0) {
    // If no quests are available *at or below* the max rarity, try finding *any* available quest
    const anyAvailable = allQuests.filter((q: Quest) => !alreadyTakenIds.has(q.id));
    if (anyAvailable.length === 0) return []; // Truly no quests left

    // Sort by lowest rarity first to fulfill the 'at least one' requirement
    anyAvailable.sort((a, b) => (a.rarity || QUEST_RARITY.COMMON) - (b.rarity || QUEST_RARITY.COMMON));
    return anyAvailable.slice(0, 1); // Return the single most common available quest
  }

  // 4. Select Quests
  // Sort available quests by rarity (descending) to prioritize rarer ones
  availableQuests.sort((a, b) => (b.rarity || QUEST_RARITY.COMMON) - (a.rarity || QUEST_RARITY.COMMON));
  
  // Select the top N quests based on the determined number, respecting availability
  const finalQuests = availableQuests.slice(0, Math.min(numQuestsToFind, availableQuests.length));

  // Ensure at least one quest is returned if possible (should be covered by logic above, but as a safeguard)
  if (finalQuests.length === 0 && availableQuests.length > 0) {
     availableQuests.sort((a, b) => (a.rarity || QUEST_RARITY.COMMON) - (b.rarity || QUEST_RARITY.COMMON));
     return availableQuests.slice(0, 1);
  }

  return finalQuests;
} 