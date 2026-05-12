import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { pokemonService } from '../services/pokemonService';
import { PokemonViewData } from '../types/pokemon';
import PokemonTypeBadge from '../components/PokemonTypeBadge';
import StatBar from '../components/StatBar';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleFavorite } from '../store/slices/favoritesSlice';
import { MainStackParamList } from '../types/navigation';
import { capitalizeFirstLetter, formatPokemonId } from '../utils/helpers';
import { addFavoriteDB, removeFavoriteDB } from '../database/db';
import { traducciones } from '../utils/translations';
import { usePokemonSpeech } from '../viewmodels/usePokemonSpeech';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type DetailScreenRouteProp = RouteProp<MainStackParamList, 'PokemonDetail'>;

const PokemonDetailScreen = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { pokemonId } = route.params;

  const [pokemon, setPokemon] = useState<PokemonViewData | null>(null);

  const favorites = useAppSelector(state => state.favorites.pokemonIds);
  const isFavorite = favorites.includes(pokemonId);

  // Toda la lógica de TTS, descripción y habilidades en el ViewModel
  const {
    lang,
    isPlaying,
    description,
    category,
    translatedAbilities,
    loadingExtra,
    toggleTTS,
    toggleLang,
  } = usePokemonSpeech(pokemonId, pokemon);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteDB(pokemonId);
    } else {
      addFavoriteDB(pokemonId);
    }
    dispatch(toggleFavorite(pokemonId));
  };

  // Carga los datos principales del Pokémon y los mapea al modelo interno
  useEffect(() => {
    const loadDetail = async () => {
      const raw = await pokemonService.getPokemonById(pokemonId);
      setPokemon(pokemonService.mapToPokemonViewData(raw));
    };
    loadDetail();
  }, [pokemonId]);

  if (!pokemon) {
    return (
      <View style={styles.center}>
        <LoadingSpinner />
      </View>
    );
  }

  const dic = traducciones[lang];
  const imageUrl = pokemon.image;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Header: botón volver | botón idioma | estrella favorito */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleLang} style={styles.langButton}>
          <Text style={styles.langText}>{dic.ui.buttonLang}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favButton}>
          <Icon
            name={isFavorite ? 'star' : 'star-outline'}
            size={28}
            color={isFavorite ? '#F8D030' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Imagen oficial */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
      </View>

      {/* Tarjeta de información */}
      <View style={styles.card}>
        <Text style={styles.name}>
          {capitalizeFirstLetter(pokemon.name)} {formatPokemonId(pokemon.id)}
        </Text>

        {category ? <Text style={styles.category}>{category}</Text> : null}

        <View style={styles.typesRow}>
          {pokemon.types.map(t => (
            <PokemonTypeBadge key={t} type={t} />
          ))}
        </View>

        {/* Stats base */}
        <Text style={styles.sectionTitle}>{dic.ui.statsTitle}</Text>
        {pokemon.stats.map(s => (
          <StatBar
            key={s.name}
            label={dic.stats[s.name] || s.name}
            value={s.value}
            color="#5c5cff"
          />
        ))}

        {/* Habilidades */}
        <Text style={styles.sectionTitle}>{dic.ui.abilitiesTitle}</Text>
        {loadingExtra ? (
          <ActivityIndicator color="#5c5cff" style={{ marginVertical: 10 }} />
        ) : (
          <View style={styles.abilitiesRow}>
            {translatedAbilities.map((ab, i) => (
              <View key={i} style={styles.abilityBadge}>
                <Text style={styles.abilityText}>{ab}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Descripción */}
        {description ? (
          <>
            <Text style={styles.sectionTitle}>
              {lang === 'es' ? 'Descripción' : 'Description'}
            </Text>
            <Text style={styles.description}>{description}</Text>
          </>
        ) : null}

        {/* Botón de audio: Activar / Desactivar */}
        <TouchableOpacity
          style={[
            styles.ttsButton,
            isPlaying && styles.ttsButtonPlaying,
            loadingExtra && styles.ttsButtonDisabled,
          ]}
          onPress={toggleTTS}
          disabled={loadingExtra}
        >
          <Text style={styles.ttsText}>
            {loadingExtra
              ? '⏳ Cargando...'
              : isPlaying
              ? '🔇 Desactivar Audio'
              : '🔊 Activar Audio Pokédex'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#121212', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: { padding: 5 },
  langButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  langText: { color: '#fff', fontSize: 12 },
  favButton: {
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: SCREEN_WIDTH * 0.85, height: 280 },
  card: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    marginTop: -20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  category: {
    fontSize: 15,
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  typesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  abilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  abilityBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  abilityText: { color: '#fff' },
  description: { color: '#ccc', fontSize: 14, lineHeight: 22, marginBottom: 10 },
  ttsButton: {
    backgroundColor: '#E3350D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  ttsButtonPlaying: { backgroundColor: '#5c5cff' },
  ttsButtonDisabled: { backgroundColor: '#555' },
  ttsText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default PokemonDetailScreen;
