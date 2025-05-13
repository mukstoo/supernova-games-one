// utils/mapGen.ts

// Define and export Coor interface
export interface Coor { row: number; col: number; }

// Define new terrain types
export type TerrainType = 'plains' | 'forest' | 'mountains' | 'desert' | 'settlement';

// Terrain types that participate in the simulation (natural terrain)
const SIMULATION_TERRAIN_TYPES: Exclude<TerrainType, 'settlement'>[] = ['plains', 'forest', 'mountains', 'desert'];

// Updated Tile interface
export interface Tile {
  id: string;
  row: number;
  col: number;
  type: TerrainType;
}

// Interface for the return value of generateMap
export interface MapData {
  tiles: Tile[];
  settlementCoords: Coor[];
}

const SIMULATION_STEPS = 5;
const SETTLEMENT_COUNT = 5;
const NEIGHBOR_THRESHOLD = 5; // If >= 5 neighbors are type X, become type X

// Helper to get neighbors
function getNeighbors(grid: TerrainType[][], r: number, c: number, rows: number, cols: number): TerrainType[] {
  const neighbors: TerrainType[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue; // Skip self
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push(grid[nr][nc]);
      }
    }
  }
  return neighbors;
}

export function generateMap(rows = 32, cols = 48): MapData {
  // --- 1. Initialization (only with simulation types) ---
  let grid: TerrainType[][] = Array(rows).fill(null).map(() => Array(cols).fill('plains'));
  const initialWeights = [
    { type: 'plains' as Exclude<TerrainType, 'settlement'>, weight: 0.40 },
    { type: 'forest' as Exclude<TerrainType, 'settlement'>, weight: 0.30 },
    { type: 'mountains' as Exclude<TerrainType, 'settlement'>, weight: 0.20 },
    { type: 'desert' as Exclude<TerrainType, 'settlement'>, weight: 0.10 },
  ];
  let cumulativeWeight = 0;
  const weightedTypes = initialWeights.map(t => {
    cumulativeWeight += t.weight;
    return { ...t, cumulative: cumulativeWeight };
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rnd = Math.random();
      grid[r][c] = weightedTypes.find(t => rnd <= t.cumulative)?.type || 'plains';
    }
  }

  // --- 2. Simulation Loop ---
  for (let step = 0; step < SIMULATION_STEPS; step++) {
    const nextGrid: TerrainType[][] = grid.map(row => [...row]); // Create a copy for the next state
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const neighbors = getNeighbors(grid, r, c, rows, cols);
        const neighborCounts: { [key in Exclude<TerrainType, 'settlement'>]?: number } = {};
        
        for (const neighborType of neighbors) {
          if (neighborType !== 'settlement') { // Only count natural terrain for dominance
            neighborCounts[neighborType as Exclude<TerrainType, 'settlement'>] = (neighborCounts[neighborType as Exclude<TerrainType, 'settlement'>] || 0) + 1;
          }
        }

        let dominantSimulationType: Exclude<TerrainType, 'settlement'> | null = null;
        for (const simType of SIMULATION_TERRAIN_TYPES) {
          if ((neighborCounts[simType] || 0) >= NEIGHBOR_THRESHOLD) {
            dominantSimulationType = simType;
            break;
          }
        }

        let currentCellType = grid[r][c];
        let nextCellType = currentCellType; // Default to current type

        if (dominantSimulationType) {
          if (currentCellType === 'mountains' && dominantSimulationType !== 'mountains') {
            // Mountains resist change unless dominated by other mountains
            nextCellType = 'mountains';
          } else if (currentCellType !== 'settlement') { // Don't let simulation change existing settlements (if any)
            nextCellType = dominantSimulationType;
          }
        }
        nextGrid[r][c] = nextCellType;
      }
    }
    grid = nextGrid; // Update grid for the next step
  }

  // --- 3. Settlement Placement (overlay on the generated natural terrain) ---
  const potentialSettlementCoords: Coor[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 'mountains') {
        potentialSettlementCoords.push({ row: r, col: c });
      }
    }
  }

  // Shuffle potential locations and pick N
  for (let i = potentialSettlementCoords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [potentialSettlementCoords[i], potentialSettlementCoords[j]] = [potentialSettlementCoords[j], potentialSettlementCoords[i]];
  }

  const settlementCoords: Coor[] = [];
  for (let i = 0; i < SETTLEMENT_COUNT && i < potentialSettlementCoords.length; i++) {
    const coord = potentialSettlementCoords[i];
    grid[coord.row][coord.col] = 'settlement'; // Overwrite type
    settlementCoords.push(coord);
  }

  // --- 4. Convert grid to Tile array ---
  const finalTiles: Tile[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      finalTiles.push({
        id: `${r}-${c}`,
        row: r,
        col: c,
        type: grid[r][c],
      });
    }
  }

  return { tiles: finalTiles, settlementCoords };
}
