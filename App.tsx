import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB, loadFavoritesFromDB } from './src/database/db';
import { setFavorites } from './src/store/slices/favoritesSlice';

const App = () => {
  useEffect(() => {
    const setup = async () => {
      await initDB();
      // SQLite como fuente de verdad: sobreescribe lo que redux-persist haya cargado
      const ids = await loadFavoritesFromDB();
      if (ids.length > 0) {
        store.dispatch(setFavorites(ids));
      }
    };
    setup();
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppNavigator />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
