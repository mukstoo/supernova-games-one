import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Item, Weapon, Armor, weapons as allWeapons, armors as allArmors } from '../../utils/items';
import { RootState } from '../index';

// Define interfaces that extend Weapon and Armor with merchant-specific fields
export interface WeaponWithExpiry extends Weapon {
  instanceId: string; // Unique ID for this specific instance in merchant inventory
  expiresAtTick: number;
}

export interface ArmorWithExpiry extends Armor {
  instanceId: string; // Unique ID for this specific instance in merchant inventory
  expiresAtTick: number;
}

// MerchantItem is now a union of these specific types
export type MerchantItem = WeaponWithExpiry | ArmorWithExpiry;

interface MerchantState {
  inventory: MerchantItem[];
  lastRefreshedTick: number;
  // Potentially add a locationId if merchants are location-specific
  // locationId: string | null;
}

const initialState: MerchantState = {
  inventory: [],
  lastRefreshedTick: 0,
  // locationId: null,
};

const ITEM_EXPIRATION_DURATION_TICKS = 5000; // Example: items expire after 5000 ticks
const MAX_MERCHANT_ITEMS = 10;
const REFRESH_INTERVAL_TICKS = 1000;

function generateNewMerchantItems(currentTick: number, count: number = 5): MerchantItem[] {
  const allPossibleBaseItems: Item[] = [...allWeapons, ...allArmors];
  const generatedItems: MerchantItem[] = [];

  if (allPossibleBaseItems.length === 0) return [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allPossibleBaseItems.length);
    const templateItem = allPossibleBaseItems[randomIndex];
    
    const merchantSpecificItem: MerchantItem = {
      ...templateItem,
      instanceId: `${templateItem.id}-merchant-${currentTick}-${i}-${Math.random().toString(36).substring(7)}`,
      expiresAtTick: currentTick + ITEM_EXPIRATION_DURATION_TICKS,
    };
    generatedItems.push(merchantSpecificItem);
  }
  return generatedItems;
}

const merchantSlice = createSlice({
  name: 'merchant',
  initialState,
  reducers: {
    setMerchantInventory: (state, action: PayloadAction<MerchantItem[]>) => {
      state.inventory = action.payload;
    },
    // Action to refresh inventory, potentially called periodically or on visiting a merchant
    refreshMerchantInventory: (state, action: PayloadAction<{ currentTick: number; forceRefresh?: boolean }>) => {
      const { currentTick, forceRefresh = false } = action.payload;

      // Only refresh if enough time has passed or if forced
      // This check could be more sophisticated, e.g., tied to player visiting a new settlement
      if (!forceRefresh && (currentTick - state.lastRefreshedTick < REFRESH_INTERVAL_TICKS && state.inventory.length > 0)) {
        // Prune expired items even if not fully refreshing stock, to keep it clean
        state.inventory = state.inventory.filter(item => item.expiresAtTick > currentTick);
        return;
      }

      // Prune expired items
      state.inventory = state.inventory.filter(item => item.expiresAtTick > currentTick);
      
      // Determine how many new items to add
      const itemsToAddCount = Math.max(0, MAX_MERCHANT_ITEMS - state.inventory.length);
      
      if (itemsToAddCount > 0) {
        const newItems = generateNewMerchantItems(currentTick, itemsToAddCount);
        state.inventory = [...state.inventory, ...newItems]
          // Sort by name or value, or keep random for variety
          .sort((a, b) => a.name.localeCompare(b.name)); 
      }
      
      state.lastRefreshedTick = currentTick;
    },
    // Action to handle selling an item to the merchant (player sells)
    // This might involve adding it to merchant stock or just giving gold
    playerSoldItem: (state, action: PayloadAction<{ item: Item; currentTick: number }>) => {
      const { item: soldItem, currentTick } = action.payload;
      
      const merchantVersion: MerchantItem = {
        ...soldItem,
        instanceId: `${soldItem.id}-sold-${currentTick}-${Math.random().toString(36).substring(7)}`,
        expiresAtTick: currentTick + ITEM_EXPIRATION_DURATION_TICKS / 2,
      };

      if (state.inventory.length < MAX_MERCHANT_ITEMS + 5 /* Allow some overstock from player sales */ && 
          !state.inventory.some(i => i.id === soldItem.id && i.expiresAtTick > currentTick) /* Avoid exact duplicate active items */) {
         state.inventory.push(merchantVersion);
         state.inventory.sort((a, b) => a.name.localeCompare(b.name));
      }
    },
    // Action to handle buying an item from the merchant (player buys)
    playerBoughtItem: (state, action: PayloadAction<{ itemInstanceId: string }>) => {
      state.inventory = state.inventory.filter(item => item.instanceId !== action.payload.itemInstanceId);
      // This also requires dispatching to playerSlice to add item and remove gold.
    },
    resetMerchant: () => initialState,
  },
});

export const {
  setMerchantInventory,
  refreshMerchantInventory,
  playerSoldItem,
  playerBoughtItem,
  resetMerchant,
} = merchantSlice.actions;

export const selectMerchantInventory = (state: RootState) => state.merchant.inventory;
export const selectMerchantLastRefreshed = (state: RootState) => state.merchant.lastRefreshedTick;

export default merchantSlice.reducer; 