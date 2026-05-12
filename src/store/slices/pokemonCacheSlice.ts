import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PokemonViewData } from '../../types/pokemon';

/**
 * pokemonCacheSlice — Caché en memoria de datos de Pokémon por ID
 *
 * NO está en el whitelist de redux-persist → solo vive durante la sesión actual.
 * Cuando PokemonCard carga un Pokémon por primera vez lo guarda aquí.
 * La segunda vez (misma sesión) lo lee del caché sin hacer llamada a la API.
 *
 * Beneficio: evita que al scrollear o volver a una pantalla se recarguen
 * los mismos Pokémon mostrando "Cargando..." cada vez.
 */

interface PokemonCacheState {
  data: Record<number, PokemonViewData>;
}

const initialState: PokemonCacheState = {
  data: {},
};

const pokemonCacheSlice = createSlice({
  name: 'pokemonCache',
  initialState,
  reducers: {
    setCachedPokemon: (state, action: PayloadAction<PokemonViewData>) => {
      state.data[action.payload.id] = action.payload;
    },
  },
});

export const { setCachedPokemon } = pokemonCacheSlice.actions;
export default pokemonCacheSlice.reducer;
