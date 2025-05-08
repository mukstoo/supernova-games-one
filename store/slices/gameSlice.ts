// store/slices/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateMap, Tile, LocationType } from '../../utils/mapGen';

export interface Coor {
  row: number;
  col: number;
}

const ROWS = 32;
const COLS = 48;

function randomPos(): Coor {
  return {
    row: Math.floor(Math.random() * ROWS),
    col: Math.floor(Math.random() * COLS),
  };
}

interface GameState {
  rows: number;
  cols: number;
  tiles: Tile[];
  pcPos: Coor;
  selected: Coor | null;
}

const initialState: GameState = {
  rows: ROWS,
  cols: COLS,
  tiles: generateMap(ROWS, COLS),
  pcPos: randomPos(),
  selected: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    resetGameState: (state) => {
      state.rows = ROWS;
      state.cols = COLS;
      state.tiles = generateMap(ROWS, COLS);
      state.pcPos = randomPos();
      state.selected = null;
    },
    regenerateMap: (state) => {
      state.tiles = generateMap(state.rows, state.cols);
      state.pcPos = randomPos();
      state.selected = null;
    },
    setSelected: (state, action: PayloadAction<Coor | null>) => {
      state.selected = action.payload;
    },
    setPcPos: (state, action: PayloadAction<Coor>) => {
      state.pcPos = action.payload;
    },
  },
});

export const { resetGameState, regenerateMap, setSelected, setPcPos } =
  gameSlice.actions;
export default gameSlice.reducer;
