import React, { useEffect, useState } from 'react';
// ScrollView permite hacer scroll cuando el contenido es más largo que la pantalla
// View es como una caja invisible que agrupa elementos
// Image muestra imágenes desde internet o desde el teléfono
// StyleSheet es para darle estilos (colores, tamaños) a los componentes
// TouchableOpacity es un botón que se oscurece al tocarlo
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
// useRoute lee los parámetros que le pasamos al navegar (id del Pokémon)
// useNavigation nos permite ir a otras pantallas o volver atrás
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
// pokemonService es el que se encarga de llamar a la PokéAPI (internet)
import { pokemonService } from '../services/pokemonService';
// Pokemon es la "forma" que debe tener un objeto Pokémon (sus campos)
import { Pokemon } from '../types/pokemon';
// Componentes propios de la app
import PokemonTypeBadge from '../components/PokemonTypeBadge'; // Muestra etiquetas de tipo (FUEGO, AGUA, etc.)
import StatBar from '../components/StatBar';                   // Barra de estadísticas (HP, ATK, etc.)
import LoadingSpinner from '../components/LoadingSpinner';     // Rueda giratoria mientras carga
import Icon from 'react-native-vector-icons/Ionicons';         // Íconos como flechas, estrellas, etc.
// useAppDispatch envía acciones a Redux (para guardar datos globales)
// useAppSelector lee datos del estado global de la app
import { useAppDispatch, useAppSelector } from '../store/hooks';
// toggleFavorite es la acción que agrega o quita un Pokémon de favoritos
import { toggleFavorite } from '../store/slices/favoritesSlice';
import { MainStackParamList } from '../types/navigation';
// Funciones de ayuda: poner mayúsculas y formatear el número (#001)
import { capitalizeFirstLetter, formatPokemonId } from '../utils/helpers';
// Funciones para guardar/borrar favoritos en la base de datos SQLite del teléfono
import { addFavoriteDB, removeFavoriteDB } from '../database/db';

// Ancho real de la pantalla del teléfono (para calcular tamaño de imagen)
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tipo del parámetro de ruta: necesitamos saber qué pokemonId y pokemonName llegaron
type DetailScreenRouteProp = RouteProp<MainStackParamList, 'PokemonDetail'>;

/**
 * PokemonDetailScreen — Pantalla de detalle de un Pokémon
 *
 * ¿Qué hace?
 *   - Recibe el ID y nombre del Pokémon desde la pantalla anterior
 *   - Llama a la PokéAPI para obtener todos sus datos (imagen, stats, habilidades, tipos)
 *   - Muestra la imagen grande arriba, y debajo en una tarjeta: estadísticas y habilidades
 *   - Permite marcar/desmarcar como favorito (guarda en Redux + SQLite)
 *
 * ¿Con qué se conecta?
 *   - pokemonService → llama a internet para traer datos del Pokémon
 *   - Redux (favoritesSlice) → guarda los favoritos en memoria global
 *   - SQLite (db.ts) → guarda los favoritos en la base de datos del teléfono
 *   - AppNavigator → llega aquí desde HomeScreen o FavoritesScreen
 */
const PokemonDetailScreen = () => {
  // useRoute lee los parámetros que vinieron al navegar a esta pantalla
  const route = useRoute<DetailScreenRouteProp>();
  // useNavigation nos da acceso a goBack() para volver a la lista
  const navigation = useNavigation();
  // dispatch envía acciones a Redux (como "agregar a favoritos")
  const dispatch = useAppDispatch();
  // Extraemos el ID y nombre del Pokémon de los parámetros de ruta
  const { pokemonId, pokemonName } = route.params;

  // pokemon: guarda todos los datos del Pokémon cuando la API los devuelve
  // null = todavía no cargó
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  // favorites: lista de IDs de Pokémon marcados como favoritos (del estado global Redux)
  const favorites = useAppSelector(state => state.favorites.pokemonIds);
  // isFavorite: true si el Pokémon actual está en la lista de favoritos
  const isFavorite = favorites.includes(pokemonId);

  // useEffect se ejecuta una vez cuando la pantalla abre
  // Llama a la API para traer los datos del Pokémon por su ID
  useEffect(() => {
    const loadDetail = async () => {
      const data = await pokemonService.getPokemonById(pokemonId);
      setPokemon(data); // Guarda los datos en el estado local
    };
    loadDetail();
  }, [pokemonId]);

  /**
   * handleToggleFavorite — Agrega o quita el Pokémon de favoritos
   *
   * Funciona en dos niveles al mismo tiempo:
   *   1. SQLite: guarda en la base de datos del teléfono (persiste aunque se cierre la app)
   *   2. Redux: actualiza el estado global en memoria (actualiza la UI inmediatamente)
   */
  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteDB(pokemonId); // Borra de la base de datos SQLite
    } else {
      addFavoriteDB(pokemonId);    // Agrega a la base de datos SQLite
    }
    dispatch(toggleFavorite(pokemonId)); // Actualiza Redux (y AsyncStorage por redux-persist)
  };

  // Mientras los datos no lleguen de la API, mostramos la rueda de carga
  if (!pokemon) return <View style={styles.center}><LoadingSpinner /></View>;

  // La imagen oficial del Pokémon. Si no existe el artwork oficial, usa el sprite básico
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default
    || pokemon.sprites.front_default;

  return (
    // ScrollView permite deslizar hacia abajo para ver las habilidades completas
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Encabezado con botón de volver atrás y estrella de favorito */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favButton}>
          {/* Estrella amarilla = favorito, estrella vacía = no favorito */}
          <Icon name={isFavorite ? "star" : "star-outline"} size={28} color={isFavorite ? "#F8D030" : "#fff"} />
        </TouchableOpacity>
      </View>

      {/* Contenedor de la imagen: tamaño fijo para que todos los Pokémon se vean igual */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain" // "contain" = la imagen entra completa sin cortarse ni deformarse
        />
      </View>

      {/* Tarjeta inferior con fondo redondeado que contiene toda la información */}
      <View style={styles.card}>
        {/* Nombre y número del Pokémon */}
        <Text style={styles.name}>
          {capitalizeFirstLetter(pokemon.name)} {formatPokemonId(pokemon.id)}
        </Text>

        {/* Fila de tipos (FUEGO, AGUA, PLANTA, etc.) */}
        <View style={styles.typesRow}>
          {pokemon.types.map(t => (
            <PokemonTypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </View>

        {/* Sección de estadísticas base (HP, Ataque, Defensa, etc.) */}
        <Text style={styles.sectionTitle}>Stats Base</Text>
        {pokemon.stats.map(s => (
          // StatBar dibuja una barra de progreso con el valor de la estadística
          <StatBar key={s.stat.name} label={s.stat.name} value={s.base_stat} color="#5c5cff" />
        ))}

        {/* Sección de habilidades (los poderes especiales del Pokémon) */}
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
  // Fondo negro de toda la pantalla
  center: { flex: 1, backgroundColor: '#121212', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#121212' },
  // paddingBottom para que las habilidades no queden tapadas por la barra de navegación
  scrollContent: { paddingBottom: 80 },
  // Fila superior: flecha atrás a la izquierda, estrella a la derecha
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  backButton: { padding: 5 },
  favButton: { padding: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  // Caja que contiene la imagen: ancho completo, altura fija para uniformidad
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  // La imagen ocupa el 75% del ancho de pantalla, centrada
  image: {
    width: SCREEN_WIDTH * 0.75,
    height: 240,
  },
  // Tarjeta blanca/oscura con bordes redondeados arriba
  card: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    marginTop: -20,
  },
  name: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 15 },
  typesRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  sectionTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#fff',
    marginTop: 15, marginBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 5
  },
  // Las habilidades se muestran en fila y hacen salto de línea si no caben
  abilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  abilityBadge: { backgroundColor: '#333', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  abilityText: { color: '#fff' }
});

export default PokemonDetailScreen;