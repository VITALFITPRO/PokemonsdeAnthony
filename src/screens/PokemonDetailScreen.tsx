import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
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
import Tts from 'react-native-tts';
import { traducciones, Lang } from '../utils/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type DetailScreenRouteProp = RouteProp<MainStackParamList, 'PokemonDetail'>;

const PokemonDetailScreen = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { pokemonId } = route.params;

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [lang, setLang] = useState<Lang>('es');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [translatedAbilities, setTranslatedAbilities] = useState<string[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);
  // true cuando el TTS está reproduciendo activamente
  const [isPlaying, setIsPlaying] = useState(false);
  // Controla que el auto-play solo ocurra una vez por Pokémon
  const autoPlayedRef = useRef<number | null>(null);

  const favorites = useAppSelector(state => state.favorites.pokemonIds);
  const isFavorite = favorites.includes(pokemonId);

  // ─── Construye la frase y la lee en voz alta ───────────────────────────────
  // Recibe los datos como parámetros para poder llamarse desde el useEffect
  // (evitando depender de estado que podría no estar actualizado)
  const iniciarHabla = (
    pkm: Pokemon,
    idioma: Lang,
    desc: string,
    cat: string,
    abilities: string[],
  ) => {
    Tts.stop();
    Tts.setDefaultLanguage(idioma === 'es' ? 'es-MX' : 'en-US');
    Tts.setDefaultRate(0.5);

    const dic = traducciones[idioma];

    const tipos = pkm.types
      .map((t: any) => dic.tipos[t.type.name] || t.type.name)
      .join(idioma === 'es' ? ' y ' : ' and ');

    const statsText = pkm.stats
      .map((s: any) => `${dic.stats[s.stat.name] || s.stat.name} ${s.base_stat}`)
      .join(', ');

    const habilidadesText = abilities.join(idioma === 'es' ? ' y ' : ' and ');

    const frase =
      idioma === 'es'
        ? `${pkm.name}. ${cat}. ${desc} Es de tipo ${tipos}. Su estado base es: ${statsText}. Y sus habilidades son: ${habilidadesText}.`
        : `${pkm.name}. ${cat}. ${desc} It is ${tipos} type. Base stats: ${statsText}. Abilities: ${habilidadesText}.`;

    Tts.speak(frase);
    setIsPlaying(true);
  };

  // ─── Botón: activa o desactiva el audio ────────────────────────────────────
  const toggleTTS = () => {
    if (isPlaying) {
      Tts.stop();
      setIsPlaying(false);
    } else {
      if (pokemon) {
        iniciarHabla(pokemon, lang, description, category, translatedAbilities);
      }
    }
  };

  // ─── Cambia idioma y detiene el audio actual ───────────────────────────────
  const toggleLang = () => {
    Tts.stop();
    setIsPlaying(false);
    // Resetea el auto-play para que se reproduzca en el nuevo idioma
    autoPlayedRef.current = null;
    setLang(prev => (prev === 'es' ? 'en' : 'es'));
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteDB(pokemonId);
    } else {
      addFavoriteDB(pokemonId);
    }
    dispatch(toggleFavorite(pokemonId));
  };

  // ─── Suscripción a eventos TTS ─────────────────────────────────────────────
  // Solo llamamos Tts.stop() al desmontar; no usamos removeEventListener porque
  // la versión instalada de react-native-tts no lo expone como función pública
  // (llamarlo causaría crash al retroceder de pantalla).
  useEffect(() => {
    Tts.addEventListener('tts-finish', () => setIsPlaying(false));
    Tts.addEventListener('tts-cancel', () => setIsPlaying(false));
    return () => {
      Tts.stop();
    };
  }, []);

  // ─── Carga los datos principales del Pokémon ───────────────────────────────
  useEffect(() => {
    const loadDetail = async () => {
      const data = await pokemonService.getPokemonById(pokemonId);
      setPokemon(data);
    };
    loadDetail();
  }, [pokemonId]);

  // ─── Carga descripción, categoría y habilidades traducidas ─────────────────
  // Al terminar, inicia el audio automáticamente (auto-play)
  useEffect(() => {
    if (!pokemon) return;
    const fetchTranslatedData = async () => {
      setLoadingExtra(true);
      try {
        const speciesRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
        );
        const speciesData = await speciesRes.json();

        const genusObj = speciesData.genera.find(
          (g: any) => g.language.name === lang
        );
        const newCategory = genusObj ? genusObj.genus : 'Pokémon';
        setCategory(newCategory);

        const flavorObj = speciesData.flavor_text_entries.find(
          (f: any) => f.language.name === lang
        );
        const newDesc = flavorObj
          ? flavorObj.flavor_text.replace(/[\n\f\r]/g, ' ')
          : '';
        setDescription(newDesc);

        const abilitiesPromises = pokemon.abilities.map(async (ab: any) => {
          const abRes = await fetch(ab.ability.url);
          const abData = await abRes.json();
          // Siempre preferimos el nombre en inglés desde la API porque la PokéAPI
          // tiene nombres en español abreviados (ej: 'Absorbe Elec.' en vez del nombre completo).
          // El inglés siempre está completo: 'Volt Absorb', 'Illuminate', etc.
          const enName = abData.names.find((n: any) => n.language.name === 'en');
          return enName
            ? enName.name
            : capitalizeFirstLetter(ab.ability.name);
        });

        const resolved = await Promise.all(abilitiesPromises);
        setTranslatedAbilities(resolved);

        // Auto-play: inicia el audio al cargar datos (usando los valores frescos del fetch)
        if (autoPlayedRef.current !== pokemonId) {
          autoPlayedRef.current = pokemonId;
          setTimeout(() => {
            iniciarHabla(pokemon, lang, newDesc, newCategory, resolved);
          }, 400);
        }
      } catch (err) {
        console.error('Error fetching translated data:', err);
      } finally {
        setLoadingExtra(false);
      }
    };
    fetchTranslatedData();
  }, [pokemonId, lang, pokemon]);

  if (!pokemon) {
    return (
      <View style={styles.center}>
        <LoadingSpinner />
      </View>
    );
  }

  const dic = traducciones[lang];
  const imageUrl =
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.front_default;

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
            <PokemonTypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </View>

        {/* Stats base */}
        <Text style={styles.sectionTitle}>{dic.ui.statsTitle}</Text>
        {pokemon.stats.map(s => (
          <StatBar
            key={s.stat.name}
            label={dic.stats[s.stat.name] || s.stat.name}
            value={s.base_stat}
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
