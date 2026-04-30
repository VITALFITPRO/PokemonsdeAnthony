export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type TabParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  PokemonDetail: { pokemonName: string; pokemonId: number };
};