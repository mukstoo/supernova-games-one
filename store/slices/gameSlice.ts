import { createSlice } from '@reduxjs/toolkit';
import { generateMap, Tile } from '../../utils/mapGen';

const ROWS = 32;
const COLS = 48;

interface GameState {
  rows: number;
  cols: number;
  tiles: Tile[];
  pcPos: { row: number; col: number };
  selected?: { row: number; col: number };
}

function randomPos() {
  return { row: Math.floor(Math.random() * ROWS), col: Math.floor(Math.random() * COLS) };
}

const initialState: GameState = {
  rows: ROWS,
  cols: COLS,
  tiles: generateMap(ROWS, COLS),
  pcPos: randomPos(),
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    resetGameState: () => initialState,
    regenerateMap: state => {
      state.tiles = generateMap(state.rows, state.cols);
      state.pcPos = randomPos();
      state.selected = undefined;
    },
    setSelected: (state, action) => {
      state.selected = action.payload; // {row,col}
    },
  },
});

export const { resetGameState, regenerateMap, setSelected } = gameSlice.actions;
export default gameSlice.reducer;
