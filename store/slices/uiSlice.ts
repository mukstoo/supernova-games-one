import { createSlice } from '@reduxjs/toolkit';

interface UIState { quitDialogOpen: boolean }
const initialState: UIState = { quitDialogOpen: false };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleQuitDialog: s => { s.quitDialogOpen = !s.quitDialogOpen; },
    setQuitDialog:   (s, a) => { s.quitDialogOpen = a.payload; },
  },
});

export const { toggleQuitDialog, setQuitDialog } = uiSlice.actions;
export default uiSlice.reducer;
