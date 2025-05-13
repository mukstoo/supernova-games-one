// store/slices/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateMap, Tile, TerrainType, MapData, Coor } from '../../utils/mapGen';

const ROWS = 32;
const COLS = 48;

function getInitialPosition(settlements: Coor[]): Coor {
  if (!settlements || settlements.length === 0) {
    return {
      row: Math.floor(Math.random() * ROWS),
      col: Math.floor(Math.random() * COLS),
    };
  }
  const randomIndex = Math.floor(Math.random() * settlements.length);
  return settlements[randomIndex];
}

const initialMapData = generateMap(ROWS, COLS);
const initialPcPos = getInitialPosition(initialMapData.settlementCoords);

interface GameState {
  rows: number;
  cols: number;
  tiles: Tile[];
  pcPos: Coor;
  selected: Coor | null;
  ticks: number;
}

const initialState: GameState = {
  rows: ROWS,
  cols: COLS,
  tiles: initialMapData.tiles,
  pcPos: initialPcPos,
  selected: initialPcPos,
  ticks: 0,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    resetGameState: (state) => {
      const newMapData = generateMap(ROWS, COLS);
      const newPcPos = getInitialPosition(newMapData.settlementCoords);
      state.rows = ROWS;
      state.cols = COLS;
      state.tiles = newMapData.tiles;
      state.pcPos = newPcPos;
      state.selected = newPcPos;
      state.ticks = 0;
    },
    regenerateMap: (state) => {
      const newMapData = generateMap(state.rows, state.cols);
      const newPcPos = getInitialPosition(newMapData.settlementCoords);
      state.tiles = newMapData.tiles;
      state.pcPos = newPcPos;
      state.selected = newPcPos;
    },
    setSelected: (state, action: PayloadAction<Coor | null>) => {
      state.selected = action.payload;
    },
    setPcPos: (state, action: PayloadAction<Coor>) => {
      state.pcPos = action.payload;
    },
    advanceTime: (state, action: PayloadAction<number | undefined>) => {
      state.ticks += action.payload ?? 1;
    },
  },
});

export const { resetGameState, regenerateMap, setSelected, setPcPos, advanceTime } =
  gameSlice.actions;
export default gameSlice.reducer;
