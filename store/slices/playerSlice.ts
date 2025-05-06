import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Traits { str: number; spd: number; stm: number; smr: number }

interface PlayerState {
  name: string;
  traits: Traits;
}

const initialState: PlayerState = {
  name: '',
  traits: { str: 5, spd: 5, stm: 5, smr: 5 },
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setTraits: (state, action: PayloadAction<Traits>) => {
      state.traits = action.payload;
    },
    resetPlayer: () => initialState,
  },
});

export const { setName, setTraits, resetPlayer } = playerSlice.actions;
export default playerSlice.reducer;
