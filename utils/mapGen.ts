// utils/mapGen.ts
export type LocationType = 'wilderness' | 'quest' | 'settlement';

export interface Tile {
  id: string;
  row: number;
  col: number;
  terrain: 'plains' | 'forest' | 'hill';
  locationType: LocationType;
}

export function generateMap(rows = 32, cols = 48): Tile[] {
  const tiles: Tile[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // pick location type: ~80% wilderness, ~15% quest, ~5% settlement
      const rnd = Math.random();
      let locationType: LocationType = 'wilderness';
      if (rnd < 0.05) {
        locationType = 'settlement';
      } else if (rnd < 0.20) {
        locationType = 'quest';
      }

      tiles.push({
        id: `${r}-${c}`,
        row: r,
        col: c,
        terrain:
          Math.random() < 0.15
            ? 'forest'
            : Math.random() < 0.1
            ? 'hill'
            : 'plains',
        locationType,
      });
    }
  }
  return tiles;
}
