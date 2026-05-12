import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';

// Habilitar promesas para react-native-sqlite-storage
enablePromise(true);

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return openDatabase({ name: 'pokeexplorer.db', location: 'default' });
};

// Crear la tabla si no existe
export const initDB = async () => {
  try {
    const db = await getDBConnection();
    await db.executeSql('CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY);');
    console.log('[SQLite] Base de datos inicializada');
  } catch (error) {
    console.error('[SQLite] Error inicializando DB', error);
  }
};

// Agregar un id a la base de datos (Híbrido)
export const addFavoriteDB = async (id: number) => {
  try {
    const db = await getDBConnection();
    await db.executeSql('INSERT OR IGNORE INTO favorites (id) VALUES (?);', [id]);
    console.log(`[SQLite] Pokemon ${id} guardado en BD local`);
  } catch (error) {
    console.error('[SQLite] Error insertando favorito', error);
  }
};

// Remover un id de la base de datos
export const removeFavoriteDB = async (id: number) => {
  try {
    const db = await getDBConnection();
    await db.executeSql('DELETE FROM favorites WHERE id = ?;', [id]);
    console.log(`[SQLite] Pokemon ${id} eliminado de BD local`);
  } catch (error) {
    console.error('[SQLite] Error eliminando favorito', error);
  }
};

// Carga todos los ids de favoritos desde SQLite al iniciar la app
// Se usa como fuente de verdad al arrancar (en vez de redux-persist)
export const loadFavoritesFromDB = async (): Promise<number[]> => {
  try {
    const db = await getDBConnection();
    const results = await db.executeSql('SELECT id FROM favorites;');
    const ids: number[] = [];
    const rows = results[0].rows;
    for (let i = 0; i < rows.length; i++) {
      ids.push(rows.item(i).id);
    }
    console.log(`[SQLite] ${ids.length} favoritos cargados desde BD`);
    return ids;
  } catch (error) {
    console.error('[SQLite] Error cargando favoritos', error);
    return [];
  }
};