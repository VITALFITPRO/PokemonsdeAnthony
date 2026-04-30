import { api } from './api';

export const pokemonService = {
  getPokemonList: async (limit: number = 20, offset: number = 0) => {
    const response = await api.get(`pokemon?limit=${limit}&offset=${offset}`);
    return response.data;
  },
  getPokemonById: async (id: number | string) => {
    const response = await api.get(`pokemon/${id}`);
    return response.data;
  },
  getPokemonByName: async (name: string) => {
    const response = await api.get(`pokemon/${name.toLowerCase()}`);
    return response.data;
  }
};