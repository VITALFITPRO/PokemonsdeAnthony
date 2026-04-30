import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  pokemonIds: number[];
}

const initialState: FavoritesState = {
  pokemonIds: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const index = state.pokemonIds.indexOf(action.payload);
      if (index >= 0) {
        state.pokemonIds.splice(index, 1);
      } else {
        state.pokemonIds.push(action.payload);
      }
    },
    clearFavorites: (state) => {
      state.pokemonIds = [];
    }
  }
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;