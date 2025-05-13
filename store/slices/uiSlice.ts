// store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  quitDialogOpen: boolean;
}

const initialState: UIState = {
  quitDialogOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleQuitDialog: state => {
      state.quitDialogOpen = !state.quitDialogOpen;
    },
    setQuitDialog: (state, action: PayloadAction<boolean>) => {
      state.quitDialogOpen = action.payload;
    },
    resetUI: () => initialState,
  },
});

export const { toggleQuitDialog, setQuitDialog, resetUI } = uiSlice.actions;
export default uiSlice.reducer;
