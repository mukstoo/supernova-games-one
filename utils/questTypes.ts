import type { Coor } from './mapGen'; // Import Coor

/** Defines the possible rewards for completing a quest. */
export interface QuestReward {
  xp?: number;
  gold?: number;
  items?: string[]; // Array of item IDs
  reputationChange?: number;
}

/** Defines the types of actions available at a quest location */
export type QuestActionType = 'watch' | 'advantageStealth' | 'advantageAthletics' | 'kickDoor';

/** Defines the structure of a single quest. */
export interface Quest {
  id: string; // Unique identifier (e.g., 'kill_boars_1')
  title: string; // Player-facing name
  description: string; // Flavor text/details
  rarity?: number; // Optional: 1=Common, 5=Legendary
  reward: QuestReward; // What the player gets upon completion
  location?: Coor; // Optional: Target location for the quest on the map
  targetTileType?: 'plains' | 'forest' | 'mountains' | 'desert'; // Optional: Required terrain for map placement

  // --- New Properties for Quest Entry --- 
  perceptionDC?: number;  // DC for enemies to perceive the player entering
  stealthDC?: number;     // DC for the player to perceive hidden enemies/traps
  trapDamage?: number;    // Optional damage if stealthDC check fails (if applicable)
  availableActions?: QuestActionType[]; // Actions available if initial stealth check passes
  actionStealthDC?: number;  // DC for 'advantageStealth' action
  actionAthleticsDC?: number; // DC for 'advantageAthletics' action

  // --- Custom Quest Identifier ---
  questType?: string; // Optional identifier for specific quest logic (e.g., 'kill_orcs')

  // escapeStealthDC?: number;  // DC for escaping stealthily after success (Future?)
  // escapeAthleticsDC?: number; // DC for escaping athletically after success (Future?)
  // successLeadsToAmbush?: boolean; // Does successful action grant player ambush? (Future?)
  // failureLeadsToAttack?: boolean; // Does failed action lead to attack? (Future?)

  // Future: minSettlementLevel?: number;
  // Future: prerequisiteQuestId?: string;
  // Future: steps?: QuestStep[]; // For multi-step quests

  rewards?: { xp?: number; gold?: number; items?: string[] }; // Optional: Quest rewards
  duration?: number; // Optional: Ticks until expiry after discovery AND deadline after acceptance
} 