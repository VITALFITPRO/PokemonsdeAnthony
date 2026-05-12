import { useState, useEffect, useMemo } from 'react';
import { pokemonService } from '../services/pokemonService';
import { PokemonListItem } from '../types/pokemon';

const LIMIT = 20;

/**
 * useHomeViewModel — Centraliza toda la lógica de HomeScreen
 * La pantalla sólo renderiza JSX, sin lógica de datos.
 */
export const useHomeViewModel = () => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [typeFilterList, setTypeFilterList] = useState<PokemonListItem[]>([]);
  const [loadingType, setLoadingType] = useState(false);

  // Carga todos los nombres al iniciar (para el buscador de 10k Pokémon)
  useEffect(() => {
    pokemonService
      .getAllPokemonNames()
      .then(setAllPokemon)
      .catch(e => console.error('Error cargando lista completa:', e));
  }, []);

  // Carga la primera página al montar
  useEffect(() => {
    loadMorePokemon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMorePokemon = async () => {
    if (loading || searchQuery.length > 0 || selectedType !== null) return;
    setLoading(true);
    try {
      const data = await pokemonService.getPokemonList(LIMIT, offset);
      setPokemonList(prev => [...prev, ...data.results]);
      setOffset(prev => prev + LIMIT);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = async (typeKey: string) => {
    if (selectedType === typeKey) {
      setSelectedType(null);
      setTypeFilterList([]);
      return;
    }
    setSelectedType(typeKey);
    setLoadingType(true);
    setSearchQuery('');
    try {
      const list = await pokemonService.getPokemonByType(typeKey);
      setTypeFilterList(list);
    } catch (e) {
      console.error(e);
      setTypeFilterList([]);
    } finally {
      setLoadingType(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (selectedType) {
      setSelectedType(null);
      setTypeFilterList([]);
    }
  };

  // Lista filtrada por nombre — memoizada para evitar recálculos en cada render
  const filteredList = useMemo(
    () => allPokemon.filter(p => p.name.includes(searchQuery.toLowerCase().trim())),
    [allPokemon, searchQuery]
  );

  // Decide qué lista mostrar: tipo > búsqueda > lista de scroll infinito
  const displayList: PokemonListItem[] = useMemo(() => {
    if (selectedType !== null) return typeFilterList;
    if (searchQuery.length > 0) return filteredList;
    return pokemonList;
  }, [selectedType, typeFilterList, searchQuery, filteredList, pokemonList]);

  return {
    displayList,
    loading,
    loadingType,
    searchQuery,
    selectedType,
    handleSearchChange,
    handleTypeSelect,
    loadMorePokemon,
  };
};
