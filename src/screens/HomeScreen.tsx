import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text } from 'react-native';
import { pokemonService } from '../services/pokemonService';
import { PokemonListItem } from '../types/pokemon';
import PokemonCard from '../components/PokemonCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeScreen = () => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const loadMorePokemon = async () => {
    if (loading || searchQuery.length > 0) return;
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

  useEffect(() => {
    loadMorePokemon();
  }, []);

  const renderFooter = () => {
    if (!loading) return null;
    return <LoadingSpinner />;
  };

  const filteredList = pokemonList.filter(p => p.name.includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Pokémon..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={searchQuery.length > 0 ? filteredList : pokemonList}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <PokemonCard name={item.name} url={item.url} />}
        onEndReached={loadMorePokemon}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', marginHorizontal: 16, marginBottom: 10, borderRadius: 8, paddingHorizontal: 10 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 10 },
  listContent: { paddingBottom: 20 }
});

export default HomeScreen;