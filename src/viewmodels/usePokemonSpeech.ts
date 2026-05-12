import { useState, useEffect, useRef } from 'react';
import Tts from 'react-native-tts';
import { pokemonService } from '../services/pokemonService';
import { PokemonViewData } from '../types/pokemon';
import { traducciones, Lang } from '../utils/translations';
import { capitalizeFirstLetter } from '../utils/helpers';

/**
 * usePokemonSpeech — Centraliza toda la lógica de TTS + descripción/habilidades
 * Extrae del componente PokemonDetailScreen toda la lógica de audio y datos extra.
 *
 * IMPORTANTE sobre TTS crash:
 *   No se llama Tts.removeEventListener porque en la versión instalada (v4.1.1)
 *   esta función no está expuesta como pública y causa crash al retroceder.
 *   Solo usamos Tts.stop() + isMountedRef + clearTimeout(autoPlayTimerRef).
 */
export const usePokemonSpeech = (pokemonId: number, pokemon: PokemonViewData | null) => {
  const [lang, setLang] = useState<Lang>('es');
  const [isPlaying, setIsPlaying] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [translatedAbilities, setTranslatedAbilities] = useState<string[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  const isMountedRef = useRef(true);
  const autoPlayedRef = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Construye la frase y la entrega al motor TTS
  const iniciarHabla = (
    pkm: PokemonViewData,
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
      .map((t: string) => (dic.tipos as any)[t] || t)
      .join(idioma === 'es' ? ' y ' : ' and ');

    const statsText = pkm.stats
      .map(s => `${(dic.stats as any)[s.name] || s.name} ${s.value}`)
      .join(', ');

    const habilidadesText = abilities.join(idioma === 'es' ? ' y ' : ' and ');

    const frase =
      idioma === 'es'
        ? `${pkm.name}. ${cat}. ${desc} Es de tipo ${tipos}. Su estado base es: ${statsText}. Y sus habilidades son: ${habilidadesText}.`
        : `${pkm.name}. ${cat}. ${desc} It is ${tipos} type. Base stats: ${statsText}. Abilities: ${habilidadesText}.`;

    Tts.speak(frase);
    setIsPlaying(true);
  };

  // Suscripción a eventos TTS — ver nota arriba sobre removeEventListener
  useEffect(() => {
    isMountedRef.current = true;
    Tts.addEventListener('tts-finish', () => {
      if (isMountedRef.current) setIsPlaying(false);
    });
    Tts.addEventListener('tts-cancel', () => {
      if (isMountedRef.current) setIsPlaying(false);
    });
    return () => {
      isMountedRef.current = false;
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      Tts.stop();
    };
  }, []);

  // Carga descripción, categoría y habilidades; luego hace auto-play
  useEffect(() => {
    if (!pokemon) return;
    const fetchTranslatedData = async () => {
      setLoadingExtra(true);
      try {
        const speciesData = await pokemonService.getPokemonSpecies(pokemonId);

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

        const abilitiesPromises = pokemon.abilities.map(async (ab) => {
          const abData = await pokemonService.getAbilityDetail(ab.url);
          // Preferimos el nombre en inglés porque la PokéAPI tiene español abreviado
          const enName = abData.names.find((n: any) => n.language.name === 'en');
          return enName ? enName.name : capitalizeFirstLetter(ab.name);
        });
        const resolved = await Promise.all(abilitiesPromises);
        setTranslatedAbilities(resolved);

        // Auto-play: una sola vez por Pokémon
        if (autoPlayedRef.current !== pokemonId) {
          autoPlayedRef.current = pokemonId;
          autoPlayTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              iniciarHabla(pokemon, lang, newDesc, newCategory, resolved);
            }
          }, 600);
        }
      } catch (err) {
        console.error('Error fetching translated data:', err);
      } finally {
        setLoadingExtra(false);
      }
    };
    fetchTranslatedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemonId, lang, pokemon]);

  const toggleTTS = () => {
    if (isPlaying) {
      Tts.stop();
      setIsPlaying(false);
    } else if (pokemon) {
      iniciarHabla(pokemon, lang, description, category, translatedAbilities);
    }
  };

  const toggleLang = () => {
    Tts.stop();
    setIsPlaying(false);
    autoPlayedRef.current = null;
    setLang(prev => (prev === 'es' ? 'en' : 'es'));
  };

  return {
    lang,
    isPlaying,
    description,
    category,
    translatedAbilities,
    loadingExtra,
    toggleTTS,
    toggleLang,
  };
};
