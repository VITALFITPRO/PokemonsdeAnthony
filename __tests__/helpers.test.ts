/**
 * helpers.test.ts — Tests unitarios
 *
 * Cubre las funciones de utilidad, el reducer de favoritos y la lógica de auth.
 * Ejecutar con: npx jest
 */

import { getPokemonIdFromUrl, formatPokemonId, capitalizeFirstLetter } from '../src/utils/helpers';
import favoritesReducer from '../src/store/slices/favoritesSlice';
import { toggleFavorite, clearFavorites, setFavorites } from '../src/store/slices/favoritesSlice';
import { validateLogin, validateRegisterForm } from '../src/services/authService';
import type { RegisteredUser } from '../src/store/slices/usersSlice';

// ─── Utilidades ───────────────────────────────────────────────────────────────

describe('getPokemonIdFromUrl', () => {
  it('extrae el id numérico de una URL de PokéAPI', () => {
    expect(getPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });

  it('funciona con URLs sin barra al final', () => {
    expect(getPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/150')).toBe(150);
  });
});

describe('formatPokemonId', () => {
  it('formatea id de 1 dígito con ceros', () => {
    expect(formatPokemonId(1)).toBe('#001');
  });

  it('formatea id de 3 dígitos sin ceros extra', () => {
    expect(formatPokemonId(151)).toBe('#151');
  });

  it('formatea id de 4 dígitos (nuevos Pokémon)', () => {
    expect(formatPokemonId(1008)).toBe('#1008');
  });
});

describe('capitalizeFirstLetter', () => {
  it('pone en mayúscula la primera letra', () => {
    expect(capitalizeFirstLetter('pikachu')).toBe('Pikachu');
  });

  it('no rompe cadenas vacías', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('no altera strings ya capitalizados', () => {
    expect(capitalizeFirstLetter('Charmander')).toBe('Charmander');
  });
});

// ─── Reducer de favoritos ─────────────────────────────────────────────────────

const initialState = { pokemonIds: [] as number[] };

describe('favoritesSlice reducer', () => {
  it('agrega un Pokémon a favoritos con toggleFavorite', () => {
    const state = favoritesReducer(initialState, toggleFavorite(25));
    expect(state.pokemonIds).toContain(25);
  });

  it('elimina un Pokémon ya favorito con toggleFavorite (toggle off)', () => {
    const withPika = { pokemonIds: [25] };
    const state = favoritesReducer(withPika, toggleFavorite(25));
    expect(state.pokemonIds).not.toContain(25);
  });

  it('limpia todos los favoritos con clearFavorites', () => {
    const withMany = { pokemonIds: [1, 4, 7, 25] };
    const state = favoritesReducer(withMany, clearFavorites());
    expect(state.pokemonIds).toHaveLength(0);
  });

  it('reemplaza la lista con setFavorites (sincronización desde SQLite)', () => {
    const state = favoritesReducer(initialState, setFavorites([10, 20, 30]));
    expect(state.pokemonIds).toEqual([10, 20, 30]);
  });
});

// ─── authService ─────────────────────────────────────────────────────────────

const mockUsers: RegisteredUser[] = [
  { email: 'ash@pokemon.com', password: 'pikachu123', name: 'Ash' },
  { email: 'misty@pokemon.com', password: 'starmie99', name: 'Misty' },
];

describe('validateLogin', () => {
  it('devuelve el usuario cuando las credenciales son correctas', () => {
    const result = validateLogin(mockUsers, 'ash@pokemon.com', 'pikachu123');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Ash');
  });

  it('es insensible a mayúsculas en el email', () => {
    const result = validateLogin(mockUsers, 'ASH@POKEMON.COM', 'pikachu123');
    expect(result).not.toBeNull();
  });

  it('devuelve null cuando la contraseña es incorrecta', () => {
    const result = validateLogin(mockUsers, 'ash@pokemon.com', 'wrongpassword');
    expect(result).toBeNull();
  });

  it('devuelve null cuando el email no existe', () => {
    const result = validateLogin(mockUsers, 'brock@pokemon.com', 'rock123');
    expect(result).toBeNull();
  });
});

describe('validateRegisterForm', () => {
  const validForm = {
    name: 'Brock',
    email: 'brock@pokemon.com',
    password: 'geodude1',
    confirmPassword: 'geodude1',
  };

  it('devuelve null para un formulario válido', () => {
    expect(validateRegisterForm(validForm, mockUsers)).toBeNull();
  });

  it('devuelve error si falta algún campo', () => {
    const error = validateRegisterForm({ ...validForm, name: '' }, mockUsers);
    expect(error).not.toBeNull();
  });

  it('devuelve error si las contraseñas no coinciden', () => {
    const error = validateRegisterForm(
      { ...validForm, confirmPassword: 'different' },
      mockUsers
    );
    expect(error).not.toBeNull();
  });

  it('devuelve error si la contraseña tiene menos de 6 caracteres', () => {
    const error = validateRegisterForm(
      { ...validForm, password: 'abc', confirmPassword: 'abc' },
      mockUsers
    );
    expect(error).not.toBeNull();
  });

  it('devuelve error si el email ya está registrado', () => {
    const error = validateRegisterForm(
      { ...validForm, email: 'ash@pokemon.com' },
      mockUsers
    );
    expect(error).not.toBeNull();
  });
});
