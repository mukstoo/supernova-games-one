// data/items.ts
// Export specific types to avoid conflicts
export type { Quality, WeaponType, Weapon } from './weapons';
export type { Armor } from './armor';
export type { ConsumableType, Consumable } from './consumables';

// Export specific item arrays and functions
export {
  startingWeapons,
  commonWeapons,
  rareWeapons,
  allWeapons,
  getWeaponsByType,
  getStartingWeapon
} from './weapons';

export {
  allArmor,
  getArmorByStrength,
  getStartingArmorForCharacter,
  getArmorByStrengthRange,
  getArmorByStrengthAndDR
} from './armor';

export {
  healingItems,
  foodItems,
  toolItems,
  materialItems,
  scrollItems,
  allConsumables,
  getConsumablesByType,
  getStartingItems
} from './consumables';

// Import for unified Item type
import type { Weapon } from './weapons';
import type { Armor } from './armor';
import type { Consumable } from './consumables';

// Import all items for easy access
import { allWeapons } from './weapons';
import { allArmor } from './armor';
import { allConsumables } from './consumables';

// Unified Item type - can be any type of item
export type Item = Weapon | Armor | Consumable;

// All items combined
export const allItems: Item[] = [
  ...allWeapons,
  ...allArmor,
  ...allConsumables
];

// Helper function to get item by ID
export function getItemById(id: string): Item | undefined {
  return allItems.find(item => item.id === id);
}

// Helper function to check item type
export function isWeapon(item: Item): item is Weapon {
  return 'damage' in item && 'type' in item && !('stackable' in item);
}

export function isArmor(item: Item): item is Armor {
  return 'damageReduction' in item && !('stackable' in item) && !('type' in item);
}

export function isConsumable(item: Item): item is Consumable {
  return 'stackable' in item;
}

// Helper function to get items by quality
export function getItemsByQuality(quality: string): Item[] {
  return allItems.filter(item => item.quality === quality);
}

// Helper function to get items by value range
export function getItemsByValueRange(minValue: number, maxValue: number): Item[] {
  return allItems.filter(item => item.value >= minValue && item.value <= maxValue);
} 