import type { Coor } from './mapGen';
import type { Traits } from '../store/slices/playerSlice';

/** Defines the possible rewards for completing a quest or a quest step. */
export interface QuestReward {
  xp?: number;
  gold?: number;
  items?: string[]; // Array of item IDs
  reputationChange?: number;
}

// --- New Quest Structure Definition ---

// Placeholder definition for QuestTrigger to resolve linter error
export type QuestTrigger = 
  | 'manual' 
  | 'auto' 
  | 'event' 
  | 'locationEnter';

export type QuestNodeType =
  | 'check'
  | 'battle'
  | 'narrative'
  | 'questComplete'
  | 'questFail'
  | 'linkToQuest';

export interface QuestCheckOption {
  type: 'check';
  description: string; // e.g., "Stealthily pass the guards"
  skill: keyof Traits; // e.g., 'stealth', 'athletics', 'persuade'
  dc: number;
  successOutcome: string; // ID of the next QuestNode
  failureOutcome: string; // ID of the next QuestNode
  failureConsequence?: {
    damage?: number;
    description?: string; // e.g., "You fall and take damage."
  };
}

export interface QuestBattleOption {
  type: 'battle';
  description: string; // e.g., "Attack the guards"
  enemyPartyId: string; // Identifier for the enemy group (to be defined elsewhere)
  playerAdvantage?: 'ambush' | 'none' | 'ambushed'; // Modifier for the battle
  outcome: string; // ID of the next QuestNode (after battle completion)
}

export interface QuestNarrativeOption {
  type: 'narrative';
  description: string; // e.g., "Listen to the old man's story"
  outcome: string; // ID of the next QuestNode
}

export type QuestDecisionOption =
  | QuestCheckOption
  | QuestBattleOption
  | QuestNarrativeOption;

export interface QuestNode {
  id: string; // Unique ID for this node within the quest
  title?: string; // Optional title for this step/node
  description: string; // Text describing the current situation/scene
  img?: string; // Optional image URI for this node
  options: QuestDecisionOption[]; // Array of choices the player can make
  nodeType?: QuestNodeType; // For special nodes like completion/failure, linkToQuest
  linkedQuestId?: string; // For 'linkToQuest' type, ID of the next quest to start
  rewards?: QuestReward; // Optional rewards for reaching or completing this node
}

/** Defines the structure of a single quest using the new node-based system. */
export interface Quest {
  id: string;
  title: string;
  description: string;
  img?: string;
  rarity?: number;
  reward: QuestReward;
  targetTileType?: 'plains' | 'forest' | 'mountains' | 'desert';
  duration?: number;
  maxDistance?: number;
  nodes: Record<string, QuestNode>;
  entryNodeId: string;
}

// Note: The old QuestActionType and previous Quest interface structure are now superseded by the types above.
// Old properties like perceptionDC, stealthDC, availableActions, questType etc.
// should be modeled within the 'nodes' graph, typically starting from the 'entryNodeId'. 