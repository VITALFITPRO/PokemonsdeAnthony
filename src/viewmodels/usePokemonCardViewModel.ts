import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCachedPokemon } from '../store/slices/pokemonCacheSlice';
import { pokemonService } from '../services/pokemonService';
import { PokemonViewData } from '../types/pokemon';
import { getPokemonIdFromUrl } from '../utils/helpers';

/**
 * usePokemonCardViewModel — Carga datos de un Pokémon con caché en Redux
 *
 * Flujo:
 *   1. Calcula el ID numérico desde la prop `id` o desde `url` (getPokemonIdFromUrl)
 *   2. Consulta el caché en Redux (pokemonCache.data[id])
 *   3. Si existe → devuelve inmediatamente sin llamada a la API
 *   4. Si no existe → llama pokemonService.getPokemonById + mapToPokemonViewData
 *      y guarda el resultado en el caché para futuros renders
 *
 * Resultado: la segunda vez que PokemonCard renderiza el mismo Pokémon
 * (al scrollear hacia arriba, al volver de favoritos, etc.) no hay "Cargando..."
 */
export const usePokemonCardViewModel = (
  name: string,
  url?: string,
  id?: number,
) => {
  const dispatch = useAppDispatch();

  // Determina el ID numérico a partir de las props disponibles
  const numericId: number | null =
    id != null
      ? id
      : url
      ? getPokemonIdFromUrl(url)
      : null;

  // Lee el caché directamente del store (sin useState para evitar un render extra)
  const cached = useAppSelector(state =>
    numericId != null ? state.pokemonCache.data[numericId] ?? null : null
  );

  const [pokemon, setPokemon] = useState<PokemonViewData | null>(cached);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    // Si ya tenemos el dato en caché, no hacer nada
    if (cached) {
      setPokemon(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchDetail = async () => {
      try {
        const identifier = numericId ?? name;
        const raw = await pokemonService.getPokemonById(identifier);
        const mapped = pokemonService.mapToPokemonViewData(raw);
        if (!cancelled) {
          dispatch(setCachedPokemon(mapped));
          setPokemon(mapped);
        }
      } catch (error) {
        console.error('Error fetching card detail', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericId, name]);

  return { pokemon, loading };
};
