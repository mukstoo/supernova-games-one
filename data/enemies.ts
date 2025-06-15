// Enemy system with dynamic stat calculation and optional modifiers
// 
// Features:
// - Equipment is optional (weaponId/armorId can be undefined for natural fighters)
// - All secondary stats calculated dynamically: base traits + equipment + modifiers
// - Optional modifiers allow for special bonuses/penalties to individual stats (can be negative)
// - Rarity system like weapons/armor (rarity 1 = basic enemies, rarity 5 = stronger enemies)
// - Changes to traits, equipment, or modifiers automatically recalculate all stats

import { allWeapons } from './weapons';
import { allArmor } from './armor';
import type { Weapon, Armor } from './items';
import type { Equipped } from '../store/slices/playerSlice';

// Simplified enemy traits - only core attributes, no skills/reputation
export interface EnemyTraits {
  str: number;
  agility: number;
  endurance: number;
  intelligence: number;
}

export class Enemy {
  id: string;
  name: string;
  description: string;
  
  // Core attributes
  traits: EnemyTraits;
  
  // Rarity (like weapon/armor quality - higher rarity = stronger enemy)
  rarity: number;
  
  // Equipment (optional - enemies can have no weapons or armor)
  weaponId?: string;
  armorId?: string;
  equipped: Equipped; // Populated from weaponId/armorId
  
  // Optional modifiers for secondary stats (can be positive or negative)
  initiativeModifier: number;
  attackModifier: number;
  defenseModifier: number;
  damageModifier: number;
  damageReductionModifier: number;
  hpModifier: number;
  
  currentHp: number; // starts at full HP, can change in battle

  constructor(data: {
    id: string;
    name: string;
    description: string;
    traits: EnemyTraits;
    rarity: number;
    weaponId?: string;
    armorId?: string;
    // Optional stat modifiers
    initiativeModifier?: number;
    attackModifier?: number;
    defenseModifier?: number;
    damageModifier?: number;
    damageReductionModifier?: number;
    hpModifier?: number;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.traits = data.traits;
    this.rarity = data.rarity;
    this.weaponId = data.weaponId;
    this.armorId = data.armorId;
    this.equipped = {
      weapon: data.weaponId ? getWeaponById(data.weaponId) : null,
      armor: data.armorId ? getArmorById(data.armorId) : null
    };
    
    // Set modifiers (default to 0 if not provided)
    this.initiativeModifier = data.initiativeModifier || 0;
    this.attackModifier = data.attackModifier || 0;
    this.defenseModifier = data.defenseModifier || 0;
    this.damageModifier = data.damageModifier || 0;
    this.damageReductionModifier = data.damageReductionModifier || 0;
    this.hpModifier = data.hpModifier || 0;
    
    this.currentHp = this.hp; // Initialize to max HP
  }
  
  // Calculated secondary stats (dynamically computed with optional modifiers)
  get initiative(): number {
    return this.traits.agility + this.traits.intelligence + this.initiativeModifier;
  }
  
  get attack(): number {
    return this.traits.agility + this.traits.intelligence + (this.equipped.weapon?.attack || 0) + this.attackModifier;
  }
  
  get defense(): number {
    return this.traits.agility + this.traits.intelligence + (this.equipped.weapon?.defense || 0) + this.defenseModifier;
  }
  
  get damage(): number {
    return this.traits.str + (this.equipped.weapon?.damage || 0) + this.damageModifier;
  }
  
  get damageReduction(): number {
    return (this.equipped.armor?.damageReduction || 0) + this.damageReductionModifier;
  }
  
  get hp(): number {
    return (this.traits.endurance * 10) + this.hpModifier;
  }
}

// Helper function to get weapon by ID
function getWeaponById(id: string): Weapon | null {
  return allWeapons.find(w => w.id === id) || null;
}

// Helper function to get armor by ID
function getArmorById(id: string): Armor | null {
  return allArmor.find(a => a.id === id) || null;
}

// Predefined enemies as explicit stat blocks
export const enemies: Enemy[] = [
  // Brute - Strength-focused enemy with worn axe (5 trait points = rarity 1)
  new Enemy({
    id: 'brute',
    name: 'Brute',
    description: 'A large, muscular warrior wielding a worn axe. Slow but powerful.',
    traits: {
      str: 2,
      agility: 1,
      endurance: 1,
      intelligence: 1,
    },
    rarity: 1,               // Basic enemy (5 trait points total)
    weaponId: 'worn-axe',    // Str 2, poor quality axe (damage +3)
    armorId: 'light-padding', // Str 2, poor quality armor (DR +1)
  }),
  // Stats: initiative=2, attack=2, defense=2, damage=5, DR=1, hp=10

  // Scout - Agility-focused enemy with broken spear (5 trait points = rarity 1)
  new Enemy({
    id: 'scout',
    name: 'Scout',
    description: 'A nimble fighter with keen eyes and a broken spear. Quick to strike.',
    traits: {
      str: 1,
      agility: 2,
      endurance: 1,
      intelligence: 1,
    },
    rarity: 1,               // Basic enemy (5 trait points total)
    weaponId: 'broken-spear', // Str 1, poor quality spear (damage +0)
    armorId: 'cloth-rags',    // Str 1, poor quality armor (DR +0)
  }),
  // Stats: initiative=3, attack=3, defense=3, damage=1, DR=0, hp=10

  // Mage - Intelligence-focused enemy with rusty knife (5 trait points = rarity 1)
  new Enemy({
    id: 'mage',
    name: 'Mage',
    description: 'A learned fighter who combines intellect with swordplay. Precise and calculating.',
    traits: {
      str: 1,
      agility: 1,
      endurance: 1,
      intelligence: 2,
    },
    rarity: 1,               // Basic enemy (5 trait points total)
    weaponId: 'rusty-knife', // Str 1, poor quality sword (attack +1, damage +0)
    armorId: 'cloth-rags',   // Str 1, poor quality armor (DR +0)
  }),
  // Stats: initiative=3, attack=4, defense=3, damage=1, DR=0, hp=10

  // Tank - Endurance-focused enemy with rusty knife (5 trait points = rarity 1)
  new Enemy({
    id: 'tank',
    name: 'Tank',
    description: 'A resilient defender built to last. Tough and hard to bring down.',
    traits: {
      str: 1,
      agility: 1,
      endurance: 2,
      intelligence: 1,
    },
    rarity: 1,               // Basic enemy (5 trait points total)
    weaponId: 'rusty-knife', // Str 1, poor quality sword (attack +1, damage +0)
    armorId: 'cloth-rags',   // Str 1, poor quality armor (DR +0)
  }),
  // Stats: initiative=2, attack=3, defense=2, damage=1, DR=0, hp=20

  // Orc Fighter - Strong and tough enemy with worn axe (6 trait points = rarity 5)
  new Enemy({
    id: 'orc_fighter',
    name: 'Orc',
    description: 'A fierce orc warrior. Strong, tough, and aggressive in battle.',
    traits: {
      str: 2,
      agility: 1,
      endurance: 2,
      intelligence: 1,
    },
    rarity: 5,               // Stronger enemy (6 trait points total)
    weaponId: 'worn-axe',    // Str 2, poor quality axe (damage +3)
    armorId: 'light-padding', // Str 2, poor quality armor (DR +1)
  }),
  // Stats: initiative=2, attack=2, defense=2, damage=5, DR=1, hp=20

  // Wild Beast - Fast unarmored creature with natural bonuses (7 trait points = rarity 5)
  new Enemy({
    id: 'wild_beast',
    name: 'Wild Beast',
    description: 'A feral creature with natural speed and toughness. Fights with claws and teeth.',
    traits: {
      str: 2,
      agility: 3,
      endurance: 1,
      intelligence: 1,
    },
    rarity: 5,               // Stronger enemy (7 trait points total)
    // No equipment - fights with natural weapons
    initiativeModifier: 2,   // Naturally alert and quick to react
    damageModifier: 1,       // Natural claws/teeth bonus
    defenseModifier: 1,      // Natural agility bonus
  }),
  // Stats: initiative=6 (3+1+2), attack=4, defense=5 (3+1+1), damage=3 (2+0+1), DR=0, hp=10

  // Elite Guard - Veteran fighter with exceptional training (8 trait points = rarity 5)
  new Enemy({
    id: 'elite_guard',
    name: 'Elite Guard',
    description: 'A highly trained guard with superior equipment and combat expertise.',
    traits: {
      str: 2,
      agility: 2,
      endurance: 2,
      intelligence: 2,
    },
    rarity: 5,               // Stronger enemy (8 trait points total)
    weaponId: 'worn-axe',    // Str 2, poor quality axe (damage +3)
    armorId: 'light-padding', // Str 2, poor quality armor (DR +1)
    initiativeModifier: 1,   // Combat training bonus
    attackModifier: 2,       // Expert weapon handling
    defenseModifier: 1,      // Superior defensive technique
  }),
  // Stats: initiative=5 (2+2+1), attack=8 (2+2+0+2), defense=5 (2+2+0+1), damage=5, DR=1, hp=20

  // Injured Bandit - Weakened enemy with penalties (5 trait points = rarity 1, shows negative modifiers)
  new Enemy({
    id: 'injured_bandit',
    name: 'Injured Bandit',
    description: 'A wounded bandit, slower and less accurate due to injuries.',
    traits: {
      str: 1,
      agility: 2,
      endurance: 1,
      intelligence: 1,
    },
    rarity: 1,               // Basic enemy (5 trait points total)
    weaponId: 'rusty-knife', // Str 1, poor quality sword (attack +1, damage +0)
    armorId: 'cloth-rags',   // Str 1, poor quality armor (DR +0)
    initiativeModifier: -1,  // Injured and slow to react
    attackModifier: -1,      // Injury affects accuracy
    defenseModifier: -1,     // Injury affects defense
  }),
  // Stats: initiative=2 (2+1-1), attack=3 (2+1+1-1), defense=2 (2+1+0-1), damage=1, DR=0, hp=10
];

// Helper functions for battle system compatibility
export function getRandomEnemy(): Enemy {
  const randomIndex = Math.floor(Math.random() * enemies.length);
  const original = enemies[randomIndex];
  
  // Create a new instance with fresh equipment and reset HP
  const copy = new Enemy({
    id: original.id,
    name: original.name,
    description: original.description,
    traits: original.traits,
    rarity: original.rarity,
    weaponId: original.weaponId,
    armorId: original.armorId,
    initiativeModifier: original.initiativeModifier,
    attackModifier: original.attackModifier,
    defenseModifier: original.defenseModifier,
    damageModifier: original.damageModifier,
    damageReductionModifier: original.damageReductionModifier,
    hpModifier: original.hpModifier
  });
  
  return copy;
}

export function getEnemyById(id: string): Enemy | undefined {
  const original = enemies.find(e => e.id === id);
  if (!original) return undefined;
  
  // Create a new instance with fresh equipment and reset HP
  const copy = new Enemy({
    id: original.id,
    name: original.name,
    description: original.description,
    traits: original.traits,
    rarity: original.rarity,
    weaponId: original.weaponId,
    armorId: original.armorId,
    initiativeModifier: original.initiativeModifier,
    attackModifier: original.attackModifier,
    defenseModifier: original.defenseModifier,
    damageModifier: original.damageModifier,
    damageReductionModifier: original.damageReductionModifier,
    hpModifier: original.hpModifier
  });
  
  return copy;
}

export function getAllEnemies(): Enemy[] {
  return enemies.map(original => new Enemy({
    id: original.id,
    name: original.name,
    description: original.description,
    traits: original.traits,
    rarity: original.rarity,
    weaponId: original.weaponId,
    armorId: original.armorId,
    initiativeModifier: original.initiativeModifier,
    attackModifier: original.attackModifier,
    defenseModifier: original.defenseModifier,
    damageModifier: original.damageModifier,
    damageReductionModifier: original.damageReductionModifier,
    hpModifier: original.hpModifier
  }));
}

// Get enemies by rarity level (useful for spawning appropriate difficulty enemies)
export function getEnemiesByRarity(rarity: number): Enemy[] {
  return enemies
    .filter(e => e.rarity === rarity)
    .map(original => new Enemy({
      id: original.id,
      name: original.name,
      description: original.description,
      traits: original.traits,
      rarity: original.rarity,
      weaponId: original.weaponId,
      armorId: original.armorId,
      initiativeModifier: original.initiativeModifier,
      attackModifier: original.attackModifier,
      defenseModifier: original.defenseModifier,
      damageModifier: original.damageModifier,
      damageReductionModifier: original.damageReductionModifier,
      hpModifier: original.hpModifier
    }));
}

// Get random enemy of specific rarity
export function getRandomEnemyByRarity(rarity: number): Enemy | undefined {
  const enemiesOfRarity = getEnemiesByRarity(rarity);
  if (enemiesOfRarity.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * enemiesOfRarity.length);
  return enemiesOfRarity[randomIndex];
} 