import { api } from './api';
import { PokemonListItem, PokemonViewData } from '../types/pokemon';

export const pokemonService = {
  // ─── Métodos existentes ───────────────────────────────────────────────────
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
  },

  // ─── Métodos nuevos (centralizan fetch() que antes estaban en pantallas) ──

  // Carga los 10.000+ nombres para el buscador de HomeScreen
  getAllPokemonNames: async (): Promise<PokemonListItem[]> => {
    const response = await api.get('pokemon?limit=10000&offset=0');
    return response.data.results;
  },

  // Filtra Pokémon por tipo para los chips de HomeScreen
  getPokemonByType: async (type: string): Promise<PokemonListItem[]> => {
    const response = await api.get(`type/${type}`);
    return response.data.pokemon.map((p: any) => ({
      name: p.pokemon.name,
      url: p.pokemon.url,
    }));
  },

  // Obtiene descripción y categoría para PokemonDetailScreen
  getPokemonSpecies: async (id: number) => {
    const response = await api.get(`pokemon-species/${id}`);
    return response.data;
  },

  // Obtiene el nombre oficial de una habilidad para PokemonDetailScreen
  getAbilityDetail: async (url: string) => {
    const clean = url.replace('https://pokeapi.co/api/v2/', '');
    const response = await api.get(clean);
    return response.data;
  },

  // Convierte la respuesta cruda de la API al modelo interno PokemonViewData
  // Así los componentes acceden a .image en vez de .sprites.other['official-artwork'].front_default
  mapToPokemonViewData: (raw: any): PokemonViewData => ({
    id: raw.id,
    name: raw.name,
    image:
      raw.sprites?.other?.['official-artwork']?.front_default ||
      raw.sprites?.front_default || '',
    types: raw.types.map((t: any) => t.type.name),
    stats: raw.stats.map((s: any) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    abilities: raw.abilities.map((a: any) => ({
      name: a.ability.name,
      url: a.ability.url,
    })),
    height: raw.height,
    weight: raw.weight,
  }),
};