import React, { useEffect, useState } from 'react';
// ScrollView permite hacer scroll cuando el contenido es más largo que la pantalla
// Dimensions obtiene el ancho real del teléfono para calcular tamaños de imagen
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
// Tts: convierte texto en voz usando el motor de texto-a-voz del teléfono
import Tts from 'react-native-tts';
// traducciones: diccionario local de tipos, stats y textos de UI en ES/EN
import { traducciones, Lang } from '../utils/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type DetailScreenRouteProp = RouteProp<MainStackParamList, 'PokemonDetail'>;

/**
 * PokemonDetailScreen — Pantalla de detalle de un Pokémon
 *
 * ¿Qué hace?
 *   - Carga los datos del Pokémon desde la PokéAPI (imagen, stats, tipos, habilidades)
 *   - Carga descripción y categoría desde el endpoint de especie (pokemon-species)
 *   - Traduce habilidades al idioma elegido consultando la URL de cada habilidad
 *   - Permite cambiar entre Español 🇪🇸 e Inglés 🇺🇸 con un botón en el header
 *   - Botón "🔊 Escuchar Pokédex" que lee todo en voz alta al estilo del anime
 *   - Permite marcar/desmarcar favorito (SQLite + Redux)
 *
 * ¿Con qué se conecta?
 *   - pokemonService → datos del Pokémon
 *   - PokéAPI (fetch) → descripción, categoría y nombre de habilidades traducidos
 *   - react-native-tts → motor de voz del teléfono
 *   - translations.ts → diccionario local de tipos y stats
 *   - favoritesSlice + db.ts → sistema de favoritos
 */
const PokemonDetailScreen = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { pokemonId } = route.params;

  // Datos principales del Pokémon (imagen, stats, tipos, habilidades)
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  // Idioma actual: 'es' = español, 'en' = inglés
  const [lang, setLang] = useState<Lang>('es');
  // Descripción del Pokémon en el idioma elegido (de la API de especies)
  const [description, setDescription] = useState('');
  // Categoría (ej: "Pokémon Ratón" / "Mouse Pokémon")
  const [category, setCategory] = useState('');
  // Nombres de habilidades traducidos al idioma elegido
  const [translatedAbilities, setTranslatedAbilities] = useState<string[]>([]);
  // true mientras se cargan descripciones y habilidades de la API
  const [loadingExtra, setLoadingExtra] = useState(false);

  const favorites = useAppSelector(state => state.favorites.pokemonIds);
  const isFavorite = favorites.includes(pokemonId);

  // Carga los datos principales del Pokémon al abrir la pantalla
  useEffect(() => {
    const loadDetail = async () => {
      const data = await pokemonService.getPokemonById(pokemonId);
      setPokemon(data);
    };
    loadDetail();
  }, [pokemonId]);

  /**
   * useEffect de traducciones
   * Se ejecuta cada vez que cambia el idioma o se carga un nuevo Pokémon.
   * Hace 3 cosas:
   *   1. /pokemon-species/{id} → descripción y categoría en el idioma elegido
   *   2. URL de cada habilidad → nombre oficial traducido
   */
  useEffect(() => {
    if (!pokemon) return;
    const fetchTranslatedData = async () => {
      setLoadingExtra(true);
      try {
        // Paso 1: especie para obtener descripción y categoría
        const speciesRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
        );
        const speciesData = await speciesRes.json();

        // Categoría en el idioma elegido
        const genusObj = speciesData.genera.find(
          (g: any) => g.language.name === lang
        );
        setCategory(genusObj ? genusObj.genus : 'Pokémon');

        // Descripción limpiando saltos de línea especiales
        const flavorObj = speciesData.flavor_text_entries.find(
          (f: any) => f.language.name === lang
        );
        const cleanDesc = flavorObj
          ? flavorObj.flavor_text.replace(/[\n\f\r]/g, ' ')
          : '';
        setDescription(cleanDesc);

        // Paso 2: nombre traducido de cada habilidad
        const abilitiesPromises = pokemon.abilities.map(async (ab: any) => {
          const abRes = await fetch(ab.ability.url);
          const abData = await abRes.json();
          const abNameObj = abData.names.find(
            (n: any) => n.language.name === lang
          );
          return abNameObj
            ? abNameObj.name
            : capitalizeFirstLetter(ab.ability.name);
        });

        const resolved = await Promise.all(abilitiesPromises);
        setTranslatedAbilities(resolved);
      } catch (err) {
        console.error('Error fetching translated data:', err);
      } finally {
        setLoadingExtra(false);
      }
    };
    fetchTranslatedData();
  }, [pokemonId, lang, pokemon]);

  /**
   * handleToggleFavorite — Agrega o quita de favoritos
   * Sincroniza SQLite (persistencia) y Redux (UI inmediata)
   */
  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteDB(pokemonId);
    } else {
      addFavoriteDB(pokemonId);
    }
    dispatch(toggleFavorite(pokemonId));
  };

  /**
   * speakPokedex — Lee el Pokémon en voz alta al estilo del anime
   *
   * Frase: "[Nombre]. [Categoría]. [Descripción].
   *         Es de tipo [Tipos]. Su estado base es: [Stats].
   *         Y sus habilidades son: [Habilidades]."
   *
   * El NOMBRE nunca se traduce (siempre "Pikachu", "Bulbasaur", etc.)
   * Los tipos, stats y habilidades sí se dicen en el idioma elegido.
   */
  const speakPokedex = () => {
    if (!pokemon) return;
    Tts.stop();
    Tts.setDefaultLanguage(lang === 'es' ? 'es-MX' : 'en-US');
    Tts.setDefaultRate(0.5);

    const dic = traducciones[lang];

    const tipos = pokemon.types
      .map((t: any) => dic.tipos[t.type.name] || t.type.name)
      .join(lang === 'es' ? ' y ' : ' and ');

    const statsText = pokemon.stats
      .map(
        (s: any) =>
          `${dic.stats[s.stat.name] || s.stat.name} ${s.base_stat}`
      )
      .join(', ');

    const habilidadesText = translatedAbilities.join(
      lang === 'es' ? ' y ' : ' and '
    );

    const frase =
      lang === 'es'
        ? `${pokemon.name}. ${category}. ${description} Es de tipo ${tipos}. Su estado base es: ${statsText}. Y sus habilidades son: ${habilidadesText}.`
        : `${pokemon.name}. ${category}. ${description} It is ${tipos} type. Base stats: ${statsText}. Abilities: ${habilidadesText}.`;

    Tts.speak(frase);
  };

  /**
   * toggleLang — Alterna entre español e inglés
   * Detiene el audio si estaba hablando
   */
  const toggleLang = () => {
    Tts.stop();
    setLang(prev => (prev === 'es' ? 'en' : 'es'));
  };

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

        {/* Botón idioma: cambia entre "Cambiar a Inglés 🇺🇸" y "Cambiar a Español 🇪🇸" */}
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

      {/* Imagen oficial, centrada, sin recortes */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
      </View>

      {/* Tarjeta de información */}
      <View style={styles.card}>
        {/* Nombre (NUNCA se traduce) y número */}
        <Text style={styles.name}>
          {capitalizeFirstLetter(pokemon.name)} {formatPokemonId(pokemon.id)}
        </Text>

        {/* Categoría en el idioma elegido */}
        {category ? <Text style={styles.category}>{category}</Text> : null}

        {/* Tipos del Pokémon */}
        <View style={styles.typesRow}>
          {pokemon.types.map(t => (
            <PokemonTypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </View>

        {/* Estadísticas base con nombres traducidos */}
        <Text style={styles.sectionTitle}>{dic.ui.statsTitle}</Text>
        {pokemon.stats.map(s => (
          <StatBar
            key={s.stat.name}
            label={dic.stats[s.stat.name] || s.stat.name}
            value={s.base_stat}
            color="#5c5cff"
          />
        ))}

        {/* Habilidades traducidas */}
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

        {/* Descripción en el idioma elegido */}
        {description ? (
          <>
            <Text style={styles.sectionTitle}>
              {lang === 'es' ? 'Descripción' : 'Description'}
            </Text>
            <Text style={styles.description}>{description}</Text>
          </>
        ) : null}

        {/* Botón rojo "🔊 Escuchar Pokédex" */}
        <TouchableOpacity
          style={[styles.ttsButton, loadingExtra && styles.ttsButtonDisabled]}
          onPress={speakPokedex}
          disabled={loadingExtra}
        >
          <Text style={styles.ttsText}>{dic.ui.buttonTTS}</Text>
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
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: SCREEN_WIDTH * 0.75, height: 240 },
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
  ttsButtonDisabled: { backgroundColor: '#555' },
  ttsText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default PokemonDetailScreen;
