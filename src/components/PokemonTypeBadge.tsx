import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const typeColors: Record<string, string> = {
  grass: '#78C850', poison: '#A040A0', electric: '#F8D030', fire: '#F08030',
  flying: '#A890F0', water: '#6890F0', bug: '#A8B820', normal: '#A8A878',
  ground: '#E0C068', fairy: '#EE99AC', fighting: '#C03028', psychic: '#F85888',
  rock: '#B8A038', ghost: '#F85888', ice: '#98D8D8', dragon: '#7038F8',
  dark: '#705898', steel: '#B8B8D0', default: '#A8A878'
};

const PokemonTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const bgColor = typeColors[type.toLowerCase()] || typeColors.default;
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={styles.text}>{type.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginHorizontal: 2 },
  text: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});

export default PokemonTypeBadge;