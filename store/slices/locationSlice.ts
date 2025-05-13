import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { Quest } from '../../utils/questTypes';
import { RootState } from '../index'; // Assuming index.ts is the root store setup
import type { Coor, Tile } from '../../utils/mapGen'; // Ensure Coor and Tile are imported
import { generateQuestLocation } from '../../utils/questLocationLogic'; // Import the generator

export interface DiscoveredQuestInfo {
  quest: Quest;
  discoveredAtTick: number;
  assignedLocation?: Coor; // ADDED: Assigned location for this discovery
}

export interface LocationState {
  quests: { [questId: string]: DiscoveredQuestInfo };
  lastRollResult: number | null; // Store the best roll result for this location
}

export interface LocationsState {
  // Key: "row-col"
  [locationId: string]: LocationState;
}

const initialState: LocationsState = {};

// --- Helper to parse Coor from locationId --- 
function parseCoords(locationId: string): Coor | null {
    const parts = locationId.split('-');
    if (parts.length === 2) {
        const row = parseInt(parts[0], 10);
        const col = parseInt(parts[1], 10);
        if (!isNaN(row) && !isNaN(col)) {
            return { row, col };
        }
    }
    console.error('Could not parse coordinates from locationId:', locationId);
    return null;
}

// --- Async Thunk for Updating Discovered Quests --- 
export const updateDiscoveredQuestsAsync = createAsyncThunk(
  'locations/updateDiscoveredQuests',
  async (
    payload: {
      locationId: string;
      quests: Quest[]; // Potential new quests
      rollResult: number;
      currentTick: number;
    },
    { getState } // Access to the full Redux state
  ) => {
    const { locationId, quests: potentialNewQuests, rollResult, currentTick } = payload;
    const state = getState() as RootState;
    
    const originCoords = parseCoords(locationId);
    if (!originCoords) {
        throw new Error('Invalid locationId format');
    }

    // Access map data from gameSlice (adjust state path if necessary)
    const allTiles = state.game.tiles;
    const mapWidth = state.game.cols;
    const mapHeight = state.game.rows;

    // Get existing location state to check current quests and last roll
    const existingLocationState = state.locations[locationId]; 
    const existingQuests = existingLocationState?.quests ?? {};
    const lastRoll = existingLocationState?.lastRollResult ?? null;

    // Determine quests to actually add (new ones only, and only if roll is better)
    const questsToAdd: DiscoveredQuestInfo[] = [];
    if (lastRoll === null || rollResult > lastRoll) {
        for (const quest of potentialNewQuests) {
            if (!existingQuests[quest.id]) { // Only process if truly new to this location
                const assignedLocation = generateQuestLocation(
                    originCoords,
                    quest.targetTileType,
                    allTiles,
                    mapWidth,
                    mapHeight
                );

                if (assignedLocation) {
                    questsToAdd.push({
                        quest: quest,
                        discoveredAtTick: currentTick,
                        assignedLocation: assignedLocation,
                    });
                } else {
                    console.warn(`Could not assign location for quest ${quest.id}, skipping discovery.`);
                }
            }
        }
    }

    // Return processed data for the reducer
    return {
        locationId,
        newQuestsInfo: questsToAdd, // Array of quests with assigned locations
        rollResult: (lastRoll === null || rollResult > lastRoll) ? rollResult : lastRoll, // Update roll only if better
    };
  }
);

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    // Prunes quests that have expired (duration passed since discovery)
    pruneExpiredQuests(
      state,
      action: PayloadAction<{ locationId: string; currentTick: number }>
    ) {
      const { locationId, currentTick } = action.payload;
      const location = state[locationId];
      if (!location) return;

      Object.keys(location.quests).forEach((questId) => {
        const questInfo = location.quests[questId];
        if (questInfo.quest.duration && currentTick > questInfo.discoveredAtTick + questInfo.quest.duration) {
          delete location.quests[questId];
        }
      });
    },
     // Could add a reducer to remove a specific quest if needed, e.g., upon acceptance?
     // removeDiscoveredQuest(state, action: PayloadAction<{ locationId: string; questId: string }>) { ... }
     
     // Reducer to clear location state if needed (e.g., on leaving?)
     clearLocationState(state, action: PayloadAction<{ locationId: string }>) {
         delete state[action.payload.locationId];
     }
  },
  // --- Handle the fulfilled state of the async thunk --- 
  extraReducers: (builder) => {
    builder.addCase(updateDiscoveredQuestsAsync.fulfilled, (state, action) => {
      const { locationId, newQuestsInfo, rollResult } = action.payload;
      
      // Ensure location state exists
      if (!state[locationId]) {
        state[locationId] = { quests: {}, lastRollResult: null };
      }
      const location = state[locationId];
      
      // Update last roll result
      location.lastRollResult = rollResult;

      // Add the newly discovered quests with their assigned locations
      newQuestsInfo.forEach((questInfo) => {
        location.quests[questInfo.quest.id] = questInfo;
      });
    });
    // Optionally handle .pending or .rejected states if needed
  },
});

export const { 
    pruneExpiredQuests,
    clearLocationState
} = locationSlice.actions;

// Input selector to get the specific location's state
const selectLocationState = (state: RootState, locationId: string) => state.locations[locationId];

// Memoized selector for discovered quests
export const selectDiscoveredQuestsForLocation = (locationId: string) =>
  createSelector(
    [(state: RootState) => selectLocationState(state, locationId)],
    (location): DiscoveredQuestInfo[] => {
      if (!location || !location.quests) return [];
      return Object.values(location.quests);
    }
  );

// Selector to get the best roll result for a location
export const selectLastRollResultForLocation = (locationId: string) => {
    return (state: RootState): number | null => {
        return state.locations[locationId]?.lastRollResult ?? null;
    };
};

export default locationSlice.reducer; 