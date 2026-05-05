import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RegisteredUser {
  email: string;
  password: string;
  name: string;
}

interface UsersState {
  users: RegisteredUser[];
}

// El usuario administrador viene pre-cargado para que siempre funcione
const initialState: UsersState = {
  users: [{ email: 'antrch28@gmail.com', password: '3765844', name: 'Anthony' }],
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Agrega un usuario nuevo; ignora si el email ya existe
    addUser: (state, action: PayloadAction<RegisteredUser>) => {
      const exists = state.users.find(u => u.email === action.payload.email);
      if (!exists) {
        state.users.push(action.payload);
      }
    },
  },
});

export const { addUser } = usersSlice.actions;
export default usersSlice.reducer;
