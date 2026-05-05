import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  displayName: string;
  age: string;
  gender: string;
  photoUri: string | null;
}

const initialState: ProfileState = {
  displayName: '',
  age: '',
  gender: '',
  photoUri: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Actualiza uno o varios campos del perfil a la vez
    updateProfile: (state, action: PayloadAction<Partial<ProfileState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateProfile } = profileSlice.actions;
export default profileSlice.reducer;
