import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import favoritesReducer from './slices/favoritesSlice';
import themeReducer from './slices/themeSlice';
import usersReducer from './slices/usersSlice';
import profileReducer from './slices/profileSlice';
import pokemonCacheReducer from './slices/pokemonCacheSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // pokemonCache NO está aquí → solo vive en memoria, se vacía al cerrar la app
  whitelist: ['auth', 'favorites', 'theme', 'users', 'profile'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  favorites: favoritesReducer,
  theme: themeReducer,
  users: usersReducer,
  profile: profileReducer,
  pokemonCache: pokemonCacheReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;