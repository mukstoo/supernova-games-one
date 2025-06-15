import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  volume: number; // 0-100 - general volume for all audio
}

const initialState: SettingsState = {
  volume: 75,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(100, action.payload));
    },
    resetSettings: () => initialState,
  },
});

export const {
  setVolume,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer; 