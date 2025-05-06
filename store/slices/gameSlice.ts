import { createSlice } from '@reduxjs/toolkit';
import { generateMap, Tile } from '../../utils/mapGen';

export interface Coor { row: number; col: number }

const ROWS = 32;
const COLS = 48;

function randomPos(): Coor {
  return { row: Math.floor(Math.random() * ROWS), col: Math.floor(Math.random() * COLS) };
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
    resetGameState: () => initialState,         // used by CharacterCreation
    regenerateMap: state => {
      state.tiles = generateMap(state.rows, state.cols);
      state.pcPos = randomPos();
      state.selected = null;
    },
    setSelected: (state, action) => {
      state.selected = action.payload;          // {row,col} or null
    },
    setPcPos: (state, action) => {
      state.pcPos = action.payload;             // {row,col}
    },
  },
});

export const { resetGameState, regenerateMap, setSelected, setPcPos } =
  gameSlice.actions;
export default gameSlice.reducer;
