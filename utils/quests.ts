import { Quest } from './questTypes';

// Master list of all possible quests in the game
export const allQuests: Quest[] = [
  {
    id: 'gather_herbs_1',
    title: 'Herbal Remedy',
    description: 'An old woman needs common herbs from the nearby plains to make a poultice.',
    rarity: 1, // Very common
    reward: { gold: 10, xp: 5, reputationChange: 1 },
    targetTileType: 'plains',
    duration: 100,
    perceptionDC: 3,
    stealthDC: 3,
    availableActions: [],
  },
  {
    id: 'kill_boars_1',
    title: 'Boar Hunt',
    description: 'Wild boars are menacing the local farms. Hunt down 3 of them.',
    rarity: 2, // Common
    reward: { gold: 25, xp: 15 },
    targetTileType: 'forest',
    duration: 150,
    perceptionDC: 6,
    stealthDC: 5,
    availableActions: ['watch', 'advantageStealth', 'kickDoor'],
    actionStealthDC: 8,
  },
  {
    id: 'escort_merchant_1',
    title: 'Merchant Escort',
    description: 'A merchant needs protection traveling through the dangerous woods.',
    rarity: 4, // Uncommon
    reward: { gold: 75, xp: 30, reputationChange: 2 },
    targetTileType: 'forest',
    duration: 300,
    perceptionDC: 9,
    stealthDC: 10,
    availableActions: ['watch', 'advantageStealth', 'kickDoor'],
    actionStealthDC: 11,
  },
  {
    id: 'find_lost_relic_1',
    title: 'The Lost Amulet',
    description: 'Rumors speak of an ancient amulet lost in the desolate mountains.',
    rarity: 7, // Rare
    reward: { gold: 150, xp: 70, items: ['amulet_of_valor'] },
    targetTileType: 'mountains',
    duration: 600,
    perceptionDC: 8,
    stealthDC: 12,
    trapDamage: 15,
    availableActions: ['watch', 'advantageAthletics', 'advantageStealth'],
    actionAthleticsDC: 10,
    actionStealthDC: 10,
  },
   {
    id: 'clear_bandit_camp_1',
    title: 'Bandit Menace',
    description: 'A bandit camp in the hills nearby has been raiding local travelers. Clear them out.',
    rarity: 5, // Uncommon/Rare
    reward: { gold: 100, xp: 50, reputationChange: 3 },
    targetTileType: 'plains',
    duration: 400,
    perceptionDC: 10,
    stealthDC: 8,
    availableActions: ['watch', 'advantageAthletics', 'advantageStealth', 'kickDoor'],
    actionAthleticsDC: 9,
    actionStealthDC: 11,
  },
   {
    id: 'desert_oasis_secret_1',
    title: 'Secret of the Oasis',
    description: 'Legends claim a hidden spring holds ancient power within the vast desert.',
    rarity: 8, // Very Rare
    reward: { xp: 100, items: ['water_of_life'] },
    targetTileType: 'desert',
    duration: 700,
    perceptionDC: 11,
    stealthDC: 14,
    trapDamage: 20,
    availableActions: ['watch', 'advantageStealth'],
    actionStealthDC: 13,
  },
  // --- Kill Orcs Quest --- 
  {
    id: 'kill_orcs_1',
    title: 'Orc Troubles',
    description: 'Orcs have been sighted nearby. Thin their numbers.',
    rarity: 1, // Very common
    reward: { gold: 20, xp: 10 },
    targetTileType: 'plains',
    duration: 120,
    stealthDC: 2,     
    perceptionDC: 2,  
    questType: 'kill_orcs',
  },
  // Add many more quests...
]; 