import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PokemonTypeBadge from './PokemonTypeBadge';
import { capitalizeFirstLetter, formatPokemonId } from '../utils/helpers';
import { MainStackParamList } from '../types/navigation';
import { usePokemonCardViewModel } from '../viewmodels/usePokemonCardViewModel';

const TYPE_COLORS: Record<string, string> = {
  grass: '#78C850', poison: '#A040A0', electric: '#F8D030', fire: '#F08030',
  flying: '#A890F0', water: '#6890F0', bug: '#A8B820', normal: '#A8A878',
  ground: '#E0C068', fairy: '#EE99AC', fighting: '#C03028', psychic: '#F85888',
  rock: '#B8A038', ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8',
  dark: '#705848', steel: '#B8B8D0',
};

const getTypeColor = (type: string): string =>
  TYPE_COLORS[type.toLowerCase()] ?? '#A8A878';

// Convierte el color hex principal en un fondo muy suave (20% opacidad)
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

interface Props {
  name: string;
  url?: string;
  id?: number;
}

const PokemonCard: React.FC<Props> = ({ name, url, id }) => {
  const { pokemon, loading } = usePokemonCardViewModel(name, url, id);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  if (loading || !pokemon) {
    return <View style={styles.card}><Text style={styles.loading}>Cargando...</Text></View>;
  }

  const primaryType = pokemon.types[0] ?? 'normal';
  const typeColor = getTypeColor(primaryType);
  const cardBg = hexToRgba(typeColor, 0.15);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderLeftColor: typeColor }]}
      onPress={() => navigation.navigate('PokemonDetail', { pokemonName: pokemon.name, pokemonId: pokemon.id })}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.id}>{formatPokemonId(pokemon.id)}</Text>
        <Text style={styles.name}>{capitalizeFirstLetter(pokemon.name)}</Text>
        <View style={styles.typesContainer}>
          {pokemon.types.map(t => (
            <PokemonTypeBadge key={t} type={t} />
          ))}
        </View>
      </View>
      <Image
        source={{ uri: pokemon.image }}
        style={styles.image}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  infoContainer: { flex: 1 },
  id: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginVertical: 5 },
  typesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  image: { width: 80, height: 80 },
  loading: { color: '#888' },
});

export default PokemonCard;