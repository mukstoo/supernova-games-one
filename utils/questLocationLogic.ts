import { Coor, Tile, TerrainType } from './mapGen'; // Use TerrainType

/**
 * Calculates the distance between two coordinates.
 */
function calculateDistance(c1: Coor, c2: Coor): number {
  return Math.sqrt(Math.pow(c1.col - c2.col, 2) + Math.pow(c1.row - c2.row, 2));
}

/**
 * Finds a random valid location for a quest based on origin, target terrain, and distance probability.
 * @param originCoords Coordinates where the quest was discovered.
 * @param targetTileType The required terrain type for the quest location.
 * @param allTiles Array containing all map tiles.
 * @param mapWidth Width of the map.
 * @param mapHeight Height of the map.
 * @returns A valid Coor for the quest, or null if no suitable location is found within reasonable attempts.
 */
export function generateQuestLocation(
  originCoords: Coor,
  targetTileType: TerrainType | undefined, // Use TerrainType
  allTiles: Tile[],
  mapWidth: number,
  mapHeight: number
): Coor | null {
  if (!targetTileType) {
    // If no target type, maybe default to 'plains' or handle error/different logic?
    console.warn("Quest missing targetTileType, cannot assign location.");
    return null; 
  }

  const maxAttemptsPerRange = 50; // Prevent infinite loops
  const distanceProbabilities = [
    { range: [5, 10], probability: 0.70 },   // Close
    { range: [11, 20], probability: 0.20 },  // Medium
    { range: [21, 35], probability: 0.07 },  // Far
    { range: [36, 60], probability: 0.03 }, // Very Far (adjust max as needed)
  ];

  // --- Determine Target Distance Range ---
  const randomValue = Math.random();
  let cumulativeProbability = 0;
  let targetRange = distanceProbabilities[0].range; // Default to closest

  for (const distInfo of distanceProbabilities) {
    cumulativeProbability += distInfo.probability;
    if (randomValue <= cumulativeProbability) {
      targetRange = distInfo.range;
      break;
    }
  }

  // --- Find Tiles in Target Range and Type ---
  const minDistance = targetRange[0];
  const maxDistance = targetRange[1];
  
  const validTilesInRange: Tile[] = [];
  for (const tile of allTiles) {
    if (tile.type === targetTileType) {
      const distance = calculateDistance(originCoords, tile);
      if (distance >= minDistance && distance <= maxDistance) {
        validTilesInRange.push(tile);
      }
    }
  }

  if (validTilesInRange.length > 0) {
    // Select a random tile from the valid ones
    const randomIndex = Math.floor(Math.random() * validTilesInRange.length);
    const chosenTile = validTilesInRange[randomIndex];
    return { row: chosenTile.row, col: chosenTile.col };
  }

  // --- Fallback: If no tile found in the chosen range, try ANY valid tile > 4 distance ---
  console.warn(`No tile of type ${targetTileType} found in range ${minDistance}-${maxDistance}. Expanding search.`);
  const fallbackTiles: Tile[] = [];
   for (const tile of allTiles) {
     if (tile.type === targetTileType) {
       const distance = calculateDistance(originCoords, tile);
       if (distance >= 5) { // Ensure it's not right next door
         fallbackTiles.push(tile);
       }
     }
   }

   if (fallbackTiles.length > 0) {
     const fallbackIndex = Math.floor(Math.random() * fallbackTiles.length);
     const chosenFallback = fallbackTiles[fallbackIndex];
      console.warn(`Assigning fallback location at ${chosenFallback.row},${chosenFallback.col}`);
     return { row: chosenFallback.row, col: chosenFallback.col };
   }

  // If still no tile found (e.g., map has no tiles of targetTileType)
  console.error(`Failed to find any valid location for quest requiring ${targetTileType}.`);
  return null;
} 