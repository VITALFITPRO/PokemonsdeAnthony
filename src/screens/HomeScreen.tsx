// React es la librería principal que hace funcionar la interfaz de la app
// useEffect ejecuta código cuando la pantalla abre (para cargar datos la primera vez)
// useState guarda valores que pueden cambiar (como la lista de Pokémon)
import React, { useEffect, useState } from 'react';
// View = caja invisible; TextInput = campo de texto; Text = texto
import { View, StyleSheet, TextInput, Text } from 'react-native';
// FlashList es como FlatList pero mucho más rápido (Shopify) — requiere estimatedItemSize
import { FlashList } from '@shopify/flash-list';
// pokemonService es quien llama a la PokéAPI (https://pokeapi.co) para traer los Pokémon
import { pokemonService } from '../services/pokemonService';
// PokemonListItem es el "molde" que describe cómo es un elemento de la lista (solo nombre y URL)
import { PokemonListItem } from '../types/pokemon';
// PokemonCard es la tarjetita que muestra cada Pokémon en la lista
import PokemonCard from '../components/PokemonCard';
// LoadingSpinner es la rueda que gira mientras se cargan datos
import LoadingSpinner from '../components/LoadingSpinner';
// Icon permite usar íconos (como la lupa del buscador)
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * HomeScreen — Pantalla principal de la app (la lista de Pokémon)
 *
 * ¿Qué hace?
 *   - Muestra una lista de Pokémon cargados desde la PokéAPI
 *   - Carga de 20 en 20 (scroll infinito: al llegar al final carga 20 más)
 *   - Tiene un buscador que filtra la lista por nombre en tiempo real
 *
 * ¿Con qué se conecta?
 *   - pokemonService → llama a internet para traer la lista de Pokémon
 *   - PokemonCard → cada elemento de la lista usa este componente
 *   - AppNavigator → desde aquí se puede navegar al detalle de cada Pokémon
 */
const HomeScreen = () => {
  // pokemonList: la lista completa de Pokémon que ya se cargaron
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  // loading: true cuando estamos esperando datos de internet, false cuando ya llegaron
  const [loading, setLoading] = useState(false);
  // offset: cuántos Pokémon ya cargamos (empieza en 0, sube de 20 en 20)
  const [offset, setOffset] = useState(0);
  // searchQuery: lo que el usuario escribe en el buscador
  const [searchQuery, setSearchQuery] = useState('');
  // limit: cuántos Pokémon traemos por cada llamada a la API
  const limit = 20;

  /**
   * loadMorePokemon — Carga más Pokémon desde la API y los agrega a la lista
   *
   * - Si ya estamos cargando o el usuario está buscando, no hace nada (evita duplicados)
   * - Llama a pokemonService.getPokemonList con el límite y el offset actual
   * - Agrega los nuevos Pokémon al final de la lista existente (scroll infinito)
   * - Sube el offset para que la próxima llamada traiga los siguientes
   */
  const loadMorePokemon = async () => {
    if (loading || searchQuery.length > 0) return; // No cargar si ya estamos cargando o buscando
    setLoading(true);
    try {
      const data = await pokemonService.getPokemonList(limit, offset);
      setPokemonList((prev) => [...prev, ...data.results]); // Agrega al final (no reemplaza)
      setOffset((prev) => prev + limit);                    // Sube el contador para la próxima carga
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Siempre apaga el loading al terminar (exitoso o con error)
    }
  };

  // Se ejecuta una vez cuando la pantalla abre: carga los primeros 20 Pokémon
  useEffect(() => {
    loadMorePokemon();
  }, []);

  /**
   * renderFooter — Muestra la rueda de carga al final de la lista
   * Solo aparece cuando loading=true (cuando se están cargando más Pokémon)
   */
  const renderFooter = () => {
    if (!loading) return null;
    return <LoadingSpinner />;
  };

  // filteredList: filtra la lista por el texto del buscador (insensible a mayúsculas)
  const filteredList = pokemonList.filter(p => p.name.includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda con ícono de lupa */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Pokémon..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery} // Actualiza searchQuery en cada tecla que se escribe
        />
      </View>

      {/*
        FlashList: versión de alto rendimiento de FlatList (librería de Shopify)
        - data: si hay texto en el buscador usa la lista filtrada, si no usa la lista completa
        - keyExtractor: usa el nombre del Pokémon como identificador único de cada fila
        - renderItem: dibuja cada Pokémon usando el componente PokemonCard
        - onEndReached: cuando el usuario llega al final, carga más Pokémon
        - onEndReachedThreshold: empieza a cargar cuando falta el 50% del scroll para el final
        - ListFooterComponent: muestra la rueda de carga al final mientras se cargan más
      */}
      <FlashList<PokemonListItem>
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