/**
 * translations.ts — Diccionario de traducciones locales de la app
 *
 * ¿Para qué sirve?
 *   Guarda las traducciones de tipos, estadísticas y textos de la UI
 *   en español e inglés SIN necesitar llamar a internet.
 *   Así la pantalla de detalle puede cambiar de idioma instantáneamente.
 *
 * ¿Con qué se conecta?
 *   - PokemonDetailScreen: lo importa para mostrar la UI en el idioma elegido
 *     y para construir la frase que lee el TTS (Text-to-Speech)
 */

export type Lang = 'es' | 'en';

export const traducciones = {
  es: {
    // Tipos de Pokémon en español
    tipos: {
      normal: 'Normal',
      fighting: 'Lucha',
      flying: 'Volador',
      poison: 'Veneno',
      ground: 'Tierra',
      rock: 'Roca',
      bug: 'Bicho',
      ghost: 'Fantasma',
      steel: 'Acero',
      fire: 'Fuego',
      water: 'Agua',
      grass: 'Planta',
      electric: 'Eléctrico',
      psychic: 'Psíquico',
      ice: 'Hielo',
      dragon: 'Dragón',
      dark: 'Siniestro',
      fairy: 'Hada',
    } as Record<string, string>,

    // Nombres de estadísticas base en español
    stats: {
      hp: 'Puntos de Vida',
      attack: 'Ataque',
      defense: 'Defensa',
      'special-attack': 'Ataque Especial',
      'special-defense': 'Defensa Especial',
      speed: 'Velocidad',
    } as Record<string, string>,

    // Textos de la interfaz en español
    ui: {
      typesTitle: 'Tipo',
      statsTitle: 'Stats Base',
      abilitiesTitle: 'Habilidades',
      buttonTTS: '🔊 Escuchar Pokédex',
      buttonLang: 'Cambiar a Inglés 🇺🇸',
      loading: 'Cargando datos...',
    },
  },

  en: {
    // Pokémon types in English
    tipos: {
      normal: 'Normal',
      fighting: 'Fighting',
      flying: 'Flying',
      poison: 'Poison',
      ground: 'Ground',
      rock: 'Rock',
      bug: 'Bug',
      ghost: 'Ghost',
      steel: 'Steel',
      fire: 'Fire',
      water: 'Water',
      grass: 'Grass',
      electric: 'Electric',
      psychic: 'Psychic',
      ice: 'Ice',
      dragon: 'Dragon',
      dark: 'Dark',
      fairy: 'Fairy',
    } as Record<string, string>,

    // Base stat names in English
    stats: {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Special Attack',
      'special-defense': 'Special Defense',
      speed: 'Speed',
    } as Record<string, string>,

    // UI texts in English
    ui: {
      typesTitle: 'Type',
      statsTitle: 'Base Stats',
      abilitiesTitle: 'Abilities',
      buttonTTS: '🔊 Listen to Pokédex',
      buttonLang: 'Switch to Spanish 🇪🇸',
      loading: 'Loading data...',
    },
  },
};
