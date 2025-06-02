import { Coor, Tile, TerrainType } from './mapGen'; // TerrainType might not be needed if we don't filter by it
import { Quest } from '../utils/questTypes'; // Import Quest
// import { calculateManhattanDistance } from '../utils'; // Keep it local for now if utils export is an issue

// Locally defined calculateManhattanDistance to resolve import issues for now
function calculateManhattanDistance(c1: Coor, c2: Coor): number {
  return Math.abs(c1.col - c2.col) + Math.abs(c1.row - c2.row);
}

// Helper function to check if two coordinates are the same
function areCoordsEqual(c1: Coor, c2: Coor): boolean {
  return c1.row === c2.row && c1.col === c2.col;
}

/**
 * Finds a random valid location for a quest.
 * @param originCoords Coordinates where the quest was discovered (player's current location).
 * @param quest The quest object, containing maxDistance and other details.
 * @param allTiles Array containing all map tiles.
 * @param existingQuestLocations Array of coordinates already occupied by other quests.
 * @returns A valid Coor for the quest, or null if no suitable location is found.
 */
export function generateQuestLocation(
  originCoords: Coor,
  quest: Quest,
  allTiles: Tile[],
  existingQuestLocations: Coor[]
): Coor | null {

  if (!quest.targetTileType) {
    console.warn(`Quest ${quest.id} has no targetTileType defined. Cannot determine specific location.`);
    return null; // Or handle as a generic placement if that's desired later
  }
  
  // Define "appropriate" tiles: matches targetTileType, not origin, not already a quest location.
  const appropriateAndAvailableTiles = allTiles.filter(tile => {
    if (tile.type !== quest.targetTileType) return false; // Must match targetTileType

    const tileCoor = { row: tile.row, col: tile.col };
    if (areCoordsEqual(tileCoor, originCoords)) return false; // Cannot be the origin tile
    if (existingQuestLocations.some(loc => areCoordsEqual(tileCoor, loc))) return false; // Cannot be an existing quest location
    return true;
  });

  if (appropriateAndAvailableTiles.length === 0) {
    console.warn(`No available tiles of type '${quest.targetTileType}' found for quest ${quest.id} (excluding origin and occupied).`);
    return null;
  }

  const maxDist = quest.maxDistance;

  if (typeof maxDist === 'number' && maxDist > 0) {
    const suitableTilesWithinDistance = appropriateAndAvailableTiles.filter(tile => {
      const distance = calculateManhattanDistance(originCoords, tile);
      // distance > 0 is implicitly handled by not being originCoords
      return distance <= maxDist;
    });

    if (suitableTilesWithinDistance.length > 0) {
      const randomIndex = Math.floor(Math.random() * suitableTilesWithinDistance.length);
      const chosenTile = suitableTilesWithinDistance[randomIndex];
      console.log(`Quest ${quest.id}: Found ${suitableTilesWithinDistance.length} tiles within distance ${maxDist}. Placing at ${chosenTile.row},${chosenTile.col}.`);
      return { row: chosenTile.row, col: chosenTile.col };
    }
    console.warn(`Quest ${quest.id}: No tile found within maxDistance ${maxDist}. Searching for closest overall.`);
  }

  // Fallback: Find the *closest* appropriate and available tile on the entire map.
  let closestTiles: Tile[] = [];
  let minDistanceFound = Infinity;

  for (const tile of appropriateAndAvailableTiles) {
    const distance = calculateManhattanDistance(originCoords, tile);
    // distance > 0 is implicitly handled by not being originCoords & not in existingQuestLocations (if origin was part of it)
    
    if (distance < minDistanceFound) {
      minDistanceFound = distance;
      closestTiles = [tile];
    } else if (distance === minDistanceFound) {
      closestTiles.push(tile);
    }
  }

  if (closestTiles.length > 0) {
    const randomIndex = Math.floor(Math.random() * closestTiles.length);
    const chosenClosestTile = closestTiles[randomIndex];
    console.log(`Quest ${quest.id}: Fallback - Placing at closest tile ${chosenClosestTile.row},${chosenClosestTile.col} (distance: ${minDistanceFound}).`);
    return { row: chosenClosestTile.row, col: chosenClosestTile.col };
  }

  console.error(`Quest ${quest.id}: Critical - Failed to find ANY valid location for quest.`);
  return null;
} 