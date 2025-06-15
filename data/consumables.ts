// data/consumables.ts
export type Quality = 'poor' | 'common' | 'rare' | 'epic' | 'legendary';
export type ConsumableType = 'potion' | 'food' | 'tool' | 'material' | 'scroll' | 'key';

export interface Consumable {
  id: string;
  name: string;
  type: ConsumableType;
  quality: Quality;
  value: number;
  description: string;
  stackable: boolean;
  maxStack?: number;
  effect?: {
    type: 'heal' | 'stamina' | 'buff' | 'utility';
    value?: number;
    duration?: number; // in game ticks
  };
}

// Healing items
export const healingItems: Consumable[] = [
  {
    id: 'health-potion-minor',
    name: 'Minor Health Potion',
    type: 'potion',
    quality: 'common',
    value: 25,
    description: 'A small vial of red liquid that restores a small amount of health.',
    stackable: true,
    maxStack: 10,
    effect: { type: 'heal', value: 20 }
  },
  {
    id: 'health-potion-major',
    name: 'Major Health Potion',
    type: 'potion',
    quality: 'rare',
    value: 75,
    description: 'A larger vial of potent red liquid that restores significant health.',
    stackable: true,
    maxStack: 5,
    effect: { type: 'heal', value: 50 }
  },
  {
    id: 'stamina-potion',
    name: 'Stamina Potion',
    type: 'potion',
    quality: 'common',
    value: 20,
    description: 'A green potion that restores stamina and energy.',
    stackable: true,
    maxStack: 10,
    effect: { type: 'stamina', value: 30 }
  }
];

// Food items
export const foodItems: Consumable[] = [
  {
    id: 'bread',
    name: 'Bread',
    type: 'food',
    quality: 'common',
    value: 5,
    description: 'A simple loaf of bread. Provides basic sustenance.',
    stackable: true,
    maxStack: 20,
    effect: { type: 'heal', value: 5 }
  },
  {
    id: 'cheese',
    name: 'Cheese',
    type: 'food',
    quality: 'common',
    value: 8,
    description: 'A wedge of aged cheese. Nutritious and filling.',
    stackable: true,
    maxStack: 15,
    effect: { type: 'heal', value: 8 }
  },
  {
    id: 'dried-meat',
    name: 'Dried Meat',
    type: 'food',
    quality: 'common',
    value: 12,
    description: 'Preserved meat that travels well and provides good nutrition.',
    stackable: true,
    maxStack: 10,
    effect: { type: 'heal', value: 12 }
  }
];

// Tools and utility items
export const toolItems: Consumable[] = [
  {
    id: 'lockpicks',
    name: 'Lockpicks',
    type: 'tool',
    quality: 'common',
    value: 15,
    description: 'A set of slender metal tools for opening locks.',
    stackable: true,
    maxStack: 5,
    effect: { type: 'utility' }
  },
  {
    id: 'rope',
    name: 'Rope',
    type: 'tool',
    quality: 'common',
    value: 10,
    description: 'Fifty feet of sturdy hemp rope. Useful for climbing and binding.',
    stackable: true,
    maxStack: 3,
    effect: { type: 'utility' }
  },
  {
    id: 'torch',
    name: 'Torch',
    type: 'tool',
    quality: 'common',
    value: 2,
    description: 'A wooden torch wrapped in oil-soaked cloth. Provides light in dark places.',
    stackable: true,
    maxStack: 20,
    effect: { type: 'utility', duration: 1000 }
  }
];

// Crafting materials
export const materialItems: Consumable[] = [
  {
    id: 'iron-ore',
    name: 'Iron Ore',
    type: 'material',
    quality: 'common',
    value: 5,
    description: 'Raw iron ore that can be smelted into usable metal.',
    stackable: true,
    maxStack: 50,
    effect: { type: 'utility' }
  },
  {
    id: 'leather-scraps',
    name: 'Leather Scraps',
    type: 'material',
    quality: 'common',
    value: 3,
    description: 'Small pieces of leather suitable for repairs or crafting.',
    stackable: true,
    maxStack: 50,
    effect: { type: 'utility' }
  },
  {
    id: 'magic-crystal',
    name: 'Magic Crystal',
    type: 'material',
    quality: 'rare',
    value: 50,
    description: 'A glowing crystal infused with magical energy.',
    stackable: true,
    maxStack: 10,
    effect: { type: 'utility' }
  }
];

// Scrolls and magic items
export const scrollItems: Consumable[] = [
  {
    id: 'scroll-of-healing',
    name: 'Scroll of Healing',
    type: 'scroll',
    quality: 'rare',
    value: 40,
    description: 'A magical scroll that casts a healing spell when read.',
    stackable: true,
    maxStack: 5,
    effect: { type: 'heal', value: 30 }
  },
  {
    id: 'scroll-of-strength',
    name: 'Scroll of Strength',
    type: 'scroll',
    quality: 'rare',
    value: 60,
    description: 'A magical scroll that temporarily increases strength.',
    stackable: true,
    maxStack: 3,
    effect: { type: 'buff', value: 2, duration: 500 }
  }
];

// All consumables combined
export const allConsumables: Consumable[] = [
  ...healingItems,
  ...foodItems,
  ...toolItems,
  ...materialItems,
  ...scrollItems
];

// Helper functions
export function getConsumablesByType(type: ConsumableType): Consumable[] {
  return allConsumables.filter(item => item.type === type);
}

export function getStartingItems(): Consumable[] {
  return [
    healingItems[0], // Minor health potion
    foodItems[0],    // Bread
    toolItems[2]     // Torch
  ];
} 