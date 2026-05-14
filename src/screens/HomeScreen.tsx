import React from 'react';
import {
  View, StyleSheet, TextInput, Text,
  ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { PokemonListItem } from '../types/pokemon';
import PokemonCard from '../components/PokemonCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { useAppSelector } from '../store/hooks';

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
  const {
    displayList,
    loading,
    loadingType,
    searchQuery,
    selectedType,
    handleSearchChange,
    handleTypeSelect,
    loadMorePokemon,
  } = useHomeViewModel();

  const isDark = useAppSelector(state => state.theme.isDark);
  const bg = isDark ? '#121212' : '#f0f0f0';
  const searchBg = isDark ? '#2a2a2a' : '#fff';
  const searchBorder = isDark ? '#444' : '#ddd';
  const textColor = isDark ? '#fff' : '#111';
  const placeholderColor = isDark ? '#888' : '#999';
  const chipInactiveBg = isDark ? '#2a2a2a' : '#e0e0e0';
  const chipInactiveBorder = isDark ? '#444' : '#ccc';
  const chipInactiveText = isDark ? '#aaa' : '#555';
  const loadingText = isDark ? '#aaa' : '#555';

  const renderFooter = () => {
    if (!loading) return null;
    return <LoadingSpinner />;
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* ── Barra de búsqueda ───────────────────────────────────────────────── */}
      <View style={[styles.searchContainer, { backgroundColor: searchBg, borderColor: searchBorder, borderWidth: 1 }]}>
        <Icon name="search" size={20} color={placeholderColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar Pokémon..."
          placeholderTextColor={placeholderColor}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <Icon name="close-circle" size={18} color={placeholderColor} />
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
                : { backgroundColor: chipInactiveBg, borderColor: chipInactiveBorder },
            ]}
            onPress={() => handleTypeSelect(t.key)}
          >
            <Text
              style={[
                styles.typeChipText,
                { color: selectedType === t.key ? '#fff' : chipInactiveText },
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
          <Text style={[styles.loadingTypeText, { color: loadingText }]}>
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
