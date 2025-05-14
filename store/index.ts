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

const rootReducer = combineReducers({
  ui: uiReducer,
  player: playerReducer,
  game: gameReducer,
  locations: locationReducer,
  merchant: merchantReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['player', 'game'],  // <-- now persisting both player AND game
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
