export interface Tile {
    id: string;
    row: number;
    col: number;
    terrain: 'plains' | 'forest' | 'hill';
  }
  
  export function generateMap(rows = 32, cols = 48): Tile[] {
    const tiles: Tile[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          terrain: Math.random() < 0.15 ? 'forest' : Math.random() < 0.1 ? 'hill' : 'plains',
        });
      }
    }
    return tiles;
  }
  