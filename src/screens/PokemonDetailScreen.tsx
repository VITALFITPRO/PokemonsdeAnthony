import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import PokemonTypeBadge from '../components/PokemonTypeBadge';
import StatBar from '../components/StatBar';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleFavorite } from '../store/slices/favoritesSlice';
import { MainStackParamList } from '../types/navigation';
import { capitalizeFirstLetter, formatPokemonId } from '../utils/helpers';
import { addFavoriteDB, removeFavoriteDB } from '../database/db';

type DetailScreenRouteProp = RouteProp<MainStackParamList, 'PokemonDetail'>;

const PokemonDetailScreen = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { pokemonId, pokemonName } = route.params;

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const favorites = useAppSelector(state => state.favorites.pokemonIds);
  const isFavorite = favorites.includes(pokemonId);

  useEffect(() => {
    const loadDetail = async () => {
      const data = await pokemonService.getPokemonById(pokemonId);
      setPokemon(data);
    };
    loadDetail();
  }, [pokemonId]);

  const handleToggleFavorite = () => {
    // Modo Híbrido: Guardar en SQLite nativo
    if (isFavorite) {
      removeFavoriteDB(pokemonId);
    } else {
      addFavoriteDB(pokemonId);
    }
    // y al mismo tiempo en Redux / AsyncStorage
    dispatch(toggleFavorite(pokemonId));
  };

  if (!pokemon) return <View style={styles.center}><LoadingSpinner /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favButton}>
          <Icon name={isFavorite ? "star" : "star-outline"} size={28} color={isFavorite ? "#F8D030" : "#fff"} />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default }} 
          style={styles.image} 
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>{capitalizeFirstLetter(pokemon.name)} {formatPokemonId(pokemon.id)}</Text>
        
        <View style={styles.typesRow}>
          {pokemon.types.map(t => <PokemonTypeBadge key={t.type.name} type={t.type.name} />)}
        </View>

        <Text style={styles.sectionTitle}>Stats Base</Text>
        {pokemon.stats.map(s => (
          <StatBar key={s.stat.name} label={s.stat.name} value={s.base_stat} color="#5c5cff" />
        ))}

        <Text style={styles.sectionTitle}>Habilidades</Text>
        <View style={styles.abilitiesRow}>
          {pokemon.abilities.map(a => (
            <View key={a.ability.name} style={styles.abilityBadge}>
              <Text style={styles.abilityText}>{capitalizeFirstLetter(a.ability.name)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#121212', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  backButton: { padding: 5 },
  favButton: { padding: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  imageContainer: { alignItems: 'center', marginTop: -20 },
  image: { width: 250, height: 250 },
  card: { backgroundColor: '#1e1e1e', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, marginTop: -30, minHeight: 400 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 15 },
  typesRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 5 },
  abilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  abilityBadge: { backgroundColor: '#333', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  abilityText: { color: '#fff' }
});

export default PokemonDetailScreen;