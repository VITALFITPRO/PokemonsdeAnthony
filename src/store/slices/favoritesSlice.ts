// createSlice y PayloadAction: herramientas de Redux Toolkit para manejar el estado global
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * FavoritesState — La "forma" del estado de favoritos
 *
 * pokemonIds: una lista de números (IDs de Pokémon marcados como favoritos)
 * Ejemplo: [1, 4, 7] significa que Bulbasaur, Charmander y Squirtle son favoritos
 */
interface FavoritesState {
  pokemonIds: number[];
}

// Estado inicial: nadie es favorito cuando la app arranca por primera vez
const initialState: FavoritesState = {
  pokemonIds: [],
};

/**
 * favoritesSlice — Maneja la lista de Pokémon favoritos
 *
 * ¿Con qué se conecta?
 *   - PokemonDetailScreen: llama a toggleFavorite() cuando el usuario toca la estrella
 *   - FavoritesScreen: lee pokemonIds para mostrar la lista de favoritos
 *   - ProfileScreen: cuenta pokemonIds.length para mostrar cuántos favoritos hay
 *   - db.ts (SQLite): trabaja en paralelo para guardar también en la base de datos local
 *   - redux-persist: guarda la lista en AsyncStorage para que sobreviva al cerrar la app
 */
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    /**
     * toggleFavorite — Agrega o quita un Pokémon de la lista de favoritos
     * Recibe: el ID numérico del Pokémon (ej: 25 para Pikachu)
     *
     * Si ya está en la lista → lo quita (deja de ser favorito)
     * Si no está en la lista → lo agrega (se vuelve favorito)
     */
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const index = state.pokemonIds.indexOf(action.payload);
      if (index >= 0) {
        state.pokemonIds.splice(index, 1); // Lo borra de la lista
      } else {
        state.pokemonIds.push(action.payload); // Lo agrega al final de la lista
      }
    },
    /**
     * clearFavorites — Borra TODOS los favoritos de una vez
     * No recibe nada. Deja la lista completamente vacía.
     */
    clearFavorites: (state) => {
      state.pokemonIds = [];
    }
  }
});

// Exportamos las acciones para usarlas desde cualquier pantalla
export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
// Exportamos el reducer para registrarlo en el store central
export default favoritesSlice.reducer;