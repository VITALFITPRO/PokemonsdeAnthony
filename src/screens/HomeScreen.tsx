import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, TextInput, Text,
  ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { pokemonService } from '../services/pokemonService';
import { PokemonListItem } from '../types/pokemon';
import PokemonCard from '../components/PokemonCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from 'react-native-vector-icons/Ionicons';

// Todos los tipos de Pokémon con nombre en español y su color representativo
const POKEMON_TYPES = [
  { key: 'normal',   label: 'Normal',    color: '#A8A878' },
  { key: 'fire',     label: 'Fuego',     color: '#F08030' },
  { key: 'water',    label: 'Agua',      color: '#6890F0' },
  { key: 'electric', label: 'Eléctrico', color: '#F8D030' },
  { key: 'grass',    label: 'Planta',    color: '#78C850' },
  { key: 'ice',      label: 'Hielo',     color: '#98D8D8' },
  { key: 'fighting', label: 'Lucha',     color: '#C03028' },
  { key: 'poison',   label: 'Veneno',    color: '#A040A0' },
  { key: 'ground',   label: 'Tierra',    color: '#E0C068' },
  { key: 'flying',   label: 'Volador',   color: '#A890F0' },
  { key: 'psychic',  label: 'Psíquico',  color: '#F85888' },
  { key: 'bug',      label: 'Bicho',     color: '#A8B820' },
  { key: 'rock',     label: 'Roca',      color: '#B8A038' },
  { key: 'ghost',    label: 'Fantasma',  color: '#705898' },
  { key: 'dragon',   label: 'Dragón',    color: '#7038F8' },
  { key: 'dark',     label: 'Siniestro', color: '#705848' },
  { key: 'steel',    label: 'Acero',     color: '#B8B8D0' },
  { key: 'fairy',    label: 'Hada',      color: '#EE99AC' },
];

const HomeScreen = () => {
  // Lista de Pokémon cargados con scroll infinito (para mostrar)
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  // Lista COMPLETA de todos los Pokémon (solo nombres+URLs) para el buscador
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  // Tipo seleccionado para filtrar
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [typeFilterList, setTypeFilterList] = useState<PokemonListItem[]>([]);
  const [loadingType, setLoadingType] = useState(false);

  // Carga TODOS los nombres de Pokémon una sola vez al iniciar
  // (solo nombres y URLs, sin datos de detalle → llamada ligera)
  useEffect(() => {
    const loadAllNames = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0');
        const data = await res.json();
        setAllPokemon(data.results);
      } catch (e) {
        console.error('Error cargando lista completa:', e);
      }
    };
    loadAllNames();
  }, []);

  // Carga más Pokémon de la lista general (scroll infinito)
  const loadMorePokemon = async () => {
    // No cargar si ya hay una carga en curso, si hay búsqueda activa, o si hay filtro de tipo
    if (loading || searchQuery.length > 0 || selectedType !== null) return;
    setLoading(true);
    try {
      const data = await pokemonService.getPokemonList(limit, offset);
      setPokemonList((prev) => [...prev, ...data.results]);
      setOffset((prev) => prev + limit);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Carga los primeros Pokémon al abrir la pantalla
  useEffect(() => {
    loadMorePokemon();
  }, []);

  // Selecciona o deselecciona un tipo para filtrar la lista
  const handleTypeSelect = async (typeKey: string) => {
    if (selectedType === typeKey) {
      // Tap en el tipo ya activo → quitar filtro
      setSelectedType(null);
      setTypeFilterList([]);
      return;
    }

    setSelectedType(typeKey);
    setLoadingType(true);
    setSearchQuery(''); // Limpia la búsqueda al activar filtro por tipo

    try {
      // La API devuelve TODOS los Pokémon de ese tipo
      const res = await fetch(`https://pokeapi.co/api/v2/type/${typeKey}`);
      const data = await res.json();
      const list: PokemonListItem[] = data.pokemon.map((p: any) => ({
        name: p.pokemon.name,
        url: p.pokemon.url,
      }));
      setTypeFilterList(list);
    } catch (e) {
      console.error(e);
      setTypeFilterList([]);
    } finally {
      setLoadingType(false);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <LoadingSpinner />;
  };

  // Lista filtrada por nombre — usa la lista COMPLETA para encontrar cualquier Pokémon
  const filteredList = allPokemon.filter(p =>
    p.name.includes(searchQuery.toLowerCase().trim())
  );

  // Decide qué lista mostrar: tipo > búsqueda > lista completa
  const displayList: PokemonListItem[] =
    selectedType !== null
      ? typeFilterList
      : searchQuery.length > 0
      ? filteredList
      : pokemonList;

  return (
    <View style={styles.container}>

      {/* ── Barra de búsqueda ───────────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Pokémon..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            // Al escribir, quita el filtro de tipo activo
            if (selectedType) {
              setSelectedType(null);
              setTypeFilterList([]);
            }
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filtro de categorías (scroll horizontal) ─────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeScrollView}
        contentContainerStyle={styles.typeScrollContent}
      >
        {POKEMON_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.typeChip,
              selectedType === t.key
                ? { backgroundColor: t.color, borderColor: t.color }
                : { backgroundColor: '#2a2a2a', borderColor: '#444' },
            ]}
            onPress={() => handleTypeSelect(t.key)}
          >
            <Text
              style={[
                styles.typeChipText,
                selectedType === t.key && styles.typeChipTextSelected,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Indicador mientras se carga el filtro por tipo ───────────────────── */}
      {loadingType ? (
        <View style={styles.loadingTypeContainer}>
          <ActivityIndicator color="#5c5cff" size="large" />
          <Text style={styles.loadingTypeText}>
            Cargando Pokémon tipo{' '}
            {POKEMON_TYPES.find(t => t.key === selectedType)?.label ?? ''}...
          </Text>
        </View>
      ) : (
        <FlashList<PokemonListItem>
          data={displayList}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => <PokemonCard name={item.name} url={item.url} />}
          onEndReached={loadMorePokemon}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 10 },
  typeScrollView: { maxHeight: 46, marginBottom: 8 },
  typeScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeChipText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  typeChipTextSelected: { color: '#fff' },
  loadingTypeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTypeText: { color: '#aaa', marginTop: 12, fontSize: 14 },
  listContent: { paddingBottom: 20 },
});

export default HomeScreen;
