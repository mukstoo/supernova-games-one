import { Traits } from '../store/slices/playerSlice'; // Assuming Traits might be used here later

/**
 * Simulates a roll of four Fudge/Fate dice (4dF).
 * Each die has faces: +, +, -, -, blank, blank.
 * Result ranges from -4 to +4.
 */
export function roll4dF(): number {
  const fudgeFaces = [1, 1, -1, -1, 0, 0]; // +1, +1, -1, -1, 0, 0
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    sum += fudgeFaces[Math.floor(Math.random() * fudgeFaces.length)];
  }
  return sum;
}

// Placeholder for trait keys - replace with actual keys from playerSlice.ts
export type PlayerStatKeys = {
  intelligence: keyof Traits | 'int'; // Example, replace 'int'
  persuasion: keyof Traits | 'persuade'; // Example, replace 'persuade'
  reputation: keyof Traits | 'rep'; // Example, replace 'rep'
  perception: keyof Traits | 'per'; // Example, replace 'per' for quest node checks
};

// TODO: Define actual Trait keys here if possible, or ensure they are passed correctly.
export const STAT_KEYS: PlayerStatKeys = {
  intelligence: 'intelligence', // Placeholder - using 'intelligence' for Intelligence
  persuasion: 'persuade', // Placeholder
  reputation: 'reputation', // Placeholder - assuming 'reputation' might be a direct stat or derived
  perception: 'per' // Placeholder for Perception, used in quests.ts linter errors
};

const attributeMapping: Record<string, keyof Traits> = {
  strength: 'str',
  agility: 'agility',
  endurance: 'endurance', 
  intelligence: 'intelligence',
  // ... rest of mappings
}; 