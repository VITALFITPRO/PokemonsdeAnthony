import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  rememberPassword: boolean; 
}

const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
  rememberPassword: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; rememberPassword: boolean }>) => {
      // Las credenciales duras y la nueva pass "12345678" se validarán a nivel de UI
      state.isAuthenticated = true;
      state.username = action.payload.username;
      state.rememberPassword = action.payload.rememberPassword;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.username = null;
      state.rememberPassword = false;
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;