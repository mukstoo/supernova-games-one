// store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uiReducer from './slices/uiSlice';
import playerReducer from './slices/playerSlice';
import gameReducer from './slices/gameSlice';
import locationReducer from './slices/locationSlice';
import merchantReducer from './slices/merchantSlice';
import settingsReducer from './slices/settingsSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  player: playerReducer,
  game: gameReducer,
  locations: locationReducer,
  merchant: merchantReducer,
  settings: settingsReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['player', 'game', 'settings'],  // <-- now persisting player, game AND settings
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Optimize performance by increasing warning thresholds
      immutableCheck: { warnAfter: 128 },
      serializableCheck: {
        warnAfter: 128,
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
