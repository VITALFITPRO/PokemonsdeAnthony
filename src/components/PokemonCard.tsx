import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import PokemonTypeBadge from './PokemonTypeBadge';
import { capitalizeFirstLetter, formatPokemonId } from '../utils/helpers';
import { MainStackParamList } from '../types/navigation';

interface Props {
  name: string;
  url?: string;
  id?: number;
}

const PokemonCard: React.FC<Props> = ({ name, url, id }) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const identifier = id || name;
        const data = await pokemonService.getPokemonById(identifier);
        setPokemon(data);
      } catch (error) {
        console.error('Error fetching card detail', error);
      }
    };
    fetchDetail();
  }, [name, id]);

  if (!pokemon) return <View style={styles.card}><Text style={styles.loading}>Cargando...</Text></View>;

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PokemonDetail', { pokemonName: pokemon.name, pokemonId: pokemon.id })}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.id}>{formatPokemonId(pokemon.id)}</Text>
        <Text style={styles.name}>{capitalizeFirstLetter(pokemon.name)}</Text>
        <View style={styles.typesContainer}>
          {pokemon.types.map((t) => (
            <PokemonTypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </View>
      </View>
      <Image 
        source={{ uri: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default }} 
        style={styles.image} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 15, marginVertical: 8, marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, borderWidth: 1.5, borderColor: '#5c5cff' },
  infoContainer: { flex: 1 },
  id: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginVertical: 5 },
  typesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  image: { width: 80, height: 80 },
  loading: { color: '#888' }
});

export default PokemonCard;