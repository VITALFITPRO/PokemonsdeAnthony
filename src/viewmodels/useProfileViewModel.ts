import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { updateProfile } from '../store/slices/profileSlice';
import { launchImageLibrary } from 'react-native-image-picker';

/**
 * useProfileViewModel — Centraliza toda la lógica de ProfileScreen
 * La pantalla sólo renderiza JSX con los valores y handlers expuestos aquí.
 */
export const useProfileViewModel = () => {
  const dispatch = useAppDispatch();

  const username = useAppSelector(state => state.auth.username);
  const favoritesCount = useAppSelector(state => state.favorites.pokemonIds.length);
  const isDark = useAppSelector(state => state.theme.isDark);
  const profile = useAppSelector(state => state.profile);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.displayName);
  const [draftAge, setDraftAge] = useState(profile.age);
  const [draftGender, setDraftGender] = useState(profile.gender);

  // Colores derivados del tema actual
  const bg = isDark ? '#1a1a1a' : '#f0f0f0';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#111';
  const subColor = isDark ? '#aaa' : '#555';

  const handlePickPhoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) dispatch(updateProfile({ photoUri: uri }));
      }
    );
  };

  const handleSave = () => {
    dispatch(updateProfile({
      displayName: draftName.trim(),
      age: draftAge.trim(),
      gender: draftGender,
    }));
    setEditing(false);
  };

  const handleCancel = () => {
    setDraftName(profile.displayName);
    setDraftAge(profile.age);
    setDraftGender(profile.gender);
    setEditing(false);
  };

  const handleToggleTheme = () => dispatch(toggleTheme());

  const handleLogout = () => dispatch(logout());

  return {
    // Estado
    username,
    favoritesCount,
    isDark,
    profile,
    editing,
    draftName,
    draftAge,
    draftGender,
    // Colores
    bg,
    cardBg,
    textColor,
    subColor,
    // Setters de draft
    setEditing,
    setDraftName,
    setDraftAge,
    setDraftGender,
    // Handlers
    handlePickPhoto,
    handleSave,
    handleCancel,
    handleToggleTheme,
    handleLogout,
  };
};
