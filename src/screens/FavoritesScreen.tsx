import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAppSelector } from '../store/hooks';
import PokemonCard from '../components/PokemonCard';

const FavoritesScreen = () => {
  const favoriteIds = useAppSelector(state => state.favorites.pokemonIds);
  const isDark = useAppSelector(state => state.theme.isDark);

  const bg = isDark ? '#121212' : '#f0f0f0';
  const titleColor = isDark ? '#fff' : '#111';
  const subColor = isDark ? '#888' : '#666';
  const emptyTextColor = isDark ? '#fff' : '#111';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.headerTitle, { color: titleColor }]}>Pokemon Guardados</Text>
      <Text style={[styles.subTitle, { color: subColor }]}>({favoriteIds.length}) Pokémon favoritos</Text>

      {favoriteIds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: emptyTextColor }]}>No tienes Pokémon en favoritos.</Text>
          <Text style={[styles.emptySubText, { color: subColor }]}>Toca la estrella en los detalles de un Pokémon para guardarlo.</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteIds}
          keyExtractor={(id) => id.toString()}
          renderItem={({ item }) => <PokemonCard name={item.toString()} id={item} />}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', paddingHorizontal: 20 },
  subTitle: { fontSize: 14, color: '#888', paddingHorizontal: 20, marginBottom: 20 },
  listContainer: { paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  emptySubText: { fontSize: 14, color: '#888', textAlign: 'center' }
});

export default FavoritesScreen;