import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleFavorite } from '../store/slices/favoritesSlice';
import { addFavoriteDB, removeFavoriteDB } from '../database/db';
import { pokemonService } from '../services/pokemonService';
import { PokemonViewData } from '../types/pokemon';

const TYPE_COLORS: Record<string, string> = {
  grass: '#78C850', poison: '#A040A0', electric: '#F8D030', fire: '#F08030',
  flying: '#A890F0', water: '#6890F0', bug: '#A8B820', normal: '#A8A878',
  ground: '#E0C068', fairy: '#EE99AC', fighting: '#C03028', psychic: '#F85888',
  rock: '#B8A038', ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8',
  dark: '#705848', steel: '#B8B8D0',
};

export const usePokemonDetailViewModel = (pokemonId: number) => {
  const dispatch = useAppDispatch();

  // ─── Datos del Pokémon ──────────────────────────────────────────────────────
  const [pokemon, setPokemon] = useState<PokemonViewData | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      const raw = await pokemonService.getPokemonById(pokemonId);
      setPokemon(pokemonService.mapToPokemonViewData(raw));
    };
    loadDetail();
  }, [pokemonId]);

  // ─── Favoritos ──────────────────────────────────────────────────────────────
  const favorites = useAppSelector(state => state.favorites.pokemonIds);
  const isFavorite = favorites.includes(pokemonId);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteDB(pokemonId);
    } else {
      addFavoriteDB(pokemonId);
    }
    dispatch(toggleFavorite(pokemonId));
  };

  // ─── Tema ───────────────────────────────────────────────────────────────────
  const isDark = useAppSelector(state => state.theme.isDark);
  const bg        = isDark ? '#121212' : '#e8e8e8';
  const cardBg    = isDark ? '#1e1e1e' : '#fff';
  const textColor = isDark ? '#fff'    : '#111';
  const subColor  = isDark ? '#aaa'    : '#666';
  const sectionBorder = isDark ? '#333' : '#ddd';
  const abilityBg = isDark ? '#333'    : '#e0e0e0';
  const descColor = isDark ? '#ccc'    : '#444';
  const langBg    = isDark ? '#2a2a2a' : '#ddd';
  const langText  = isDark ? '#fff'    : '#111';

  // ─── Colores por tipo ───────────────────────────────────────────────────────
  const primaryType = pokemon?.types?.[0] ?? 'normal';
  const typeHex     = TYPE_COLORS[primaryType.toLowerCase()] ?? '#A8A878';
  const r = parseInt(typeHex.slice(1, 3), 16);
  const g = parseInt(typeHex.slice(3, 5), 16);
  const b = parseInt(typeHex.slice(5, 7), 16);
  const typeBgTop  = `rgba(${r},${g},${b},0.25)`;
  const typeBgCard = `rgba(${r},${g},${b},0.08)`;

  return {
    pokemon,
    isFavorite,
    handleToggleFavorite,
    isDark,
    bg, cardBg, textColor, subColor, sectionBorder, abilityBg, descColor, langBg, langText,
    typeHex, typeBgTop, typeBgCard,
  };
};
