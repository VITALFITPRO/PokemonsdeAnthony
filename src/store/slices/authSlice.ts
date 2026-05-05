// createSlice: crea de forma sencilla el manejador de un trozo del estado global
// PayloadAction: define el tipo de dato que llega con la acción (ej: el username)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * AuthState — La "forma" del estado de autenticación
 *
 * isAuthenticated: true si el usuario inició sesión, false si no
 * username: el correo del usuario que inició sesión (o null si no hay sesión)
 * rememberPassword: si el usuario pidió recordar su contraseña
 */
interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  rememberPassword: boolean;
}

// Estado inicial: la app arranca sin sesión iniciada
const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
  rememberPassword: false,
};

/**
 * authSlice — Maneja todo lo relacionado con el inicio/cierre de sesión
 *
 * ¿Con qué se conecta?
 *   - LoginScreen: llama a login() cuando las credenciales son correctas
 *   - ProfileScreen: llama a logout() cuando el usuario toca "Cerrar sesión"
 *   - AppNavigator: lee isAuthenticated para decidir si mostrar el Login o la app principal
 *   - redux-persist: guarda este estado en AsyncStorage para recordar la sesión
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * login — Marca al usuario como autenticado y guarda su nombre
     * Recibe: { username: correo del usuario, rememberPassword: si quiere recordarla }
     */
    login: (state, action: PayloadAction<{ username: string; rememberPassword: boolean }>) => {
      state.isAuthenticated = true;
      state.username = action.payload.username;
      state.rememberPassword = action.payload.rememberPassword;
    },
    /**
     * logout — Cierra la sesión y borra el nombre de usuario
     * No recibe nada. Simplemente resetea todo al estado inicial.
     */
    logout: (state) => {
      state.isAuthenticated = false;
      state.username = null;
      state.rememberPassword = false;
    }
  }
});

// Exportamos las acciones para usarlas desde cualquier pantalla
export const { login, logout } = authSlice.actions;
// Exportamos el reducer para registrarlo en el store central
export default authSlice.reducer;