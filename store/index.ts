import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uiReducer from './slices/uiSlice';
import playerReducer from './slices/playerSlice';
import gameReducer from './slices/gameSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  player: playerReducer,
  game: gameReducer,
});

const persistedReducer = persistReducer(
  { key: 'root', version: 1, storage: AsyncStorage },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: gDM =>
    gDM({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
