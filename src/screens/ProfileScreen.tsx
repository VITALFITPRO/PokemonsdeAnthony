import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Image, Alert, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { updateProfile } from '../store/slices/profileSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

// Opciones de género disponibles
const GENDER_OPTIONS = ['Masculino', 'Femenino', 'Otro'];

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const username = useAppSelector(state => state.auth.username);
  const favoritesCount = useAppSelector(state => state.favorites.pokemonIds.length);
  const isDark = useAppSelector(state => state.theme.isDark);
  const profile = useAppSelector(state => state.profile);

  // Estado local de edición (se guarda al presionar "Guardar")
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.displayName);
  const [draftAge, setDraftAge] = useState(profile.age);
  const [draftGender, setDraftGender] = useState(profile.gender);

  const bg = isDark ? '#1a1a1a' : '#f0f0f0';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#111';
  const subColor = isDark ? '#aaa' : '#555';

  // Abre la galería para seleccionar una foto de perfil
  const handlePickPhoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          dispatch(updateProfile({ photoUri: uri }));
        }
      }
    );
  };

  // Guarda los datos editados en Redux (persiste con redux-persist)
  const handleSave = () => {
    dispatch(updateProfile({
      displayName: draftName.trim(),
      age: draftAge.trim(),
      gender: draftGender,
    }));
    setEditing(false);
  };

  // Cancela la edición y restaura los valores guardados
  const handleCancel = () => {
    setDraftName(profile.displayName);
    setDraftAge(profile.age);
    setDraftGender(profile.gender);
    setEditing(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>

      {/* ── Foto de perfil ──────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickPhoto}>
        {profile.photoUri ? (
          <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarCircle, { backgroundColor: '#5c5cff' }]}>
            <Icon name="person" size={50} color="#fff" />
          </View>
        )}
        {/* Ícono de cámara encima de la foto */}
        <View style={styles.cameraIcon}>
          <Icon name="camera" size={16} color="#fff" />
        </View>
      </TouchableOpacity>

      <Text style={[styles.emailText, { color: subColor }]}>{username}</Text>
      <Text style={[styles.roleText, { color: subColor }]}>Entrenador Pokémon</Text>

      {/* ── Botón editar / guardar ──────────────────────────────────────────── */}
      {!editing ? (
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: cardBg }]}
          onPress={() => setEditing(true)}
        >
          <Icon name="create-outline" size={18} color="#5c5cff" />
          <Text style={styles.editButtonText}>Editar perfil</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.editActions}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: cardBg }]} onPress={handleCancel}>
            <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Tarjeta de información del perfil ───────────────────────────────── */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Información Personal</Text>

        {/* Nombre */}
        <View style={styles.fieldRow}>
          <Icon name="person-outline" size={18} color="#5c5cff" style={styles.fieldIcon} />
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { color: subColor }]}>Nombre</Text>
            {editing ? (
              <TextInput
                style={[styles.fieldInput, { color: textColor, borderBottomColor: '#5c5cff' }]}
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Tu nombre"
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={[styles.fieldValue, { color: textColor }]}>
                {profile.displayName || 'Sin especificar'}
              </Text>
            )}
          </View>
        </View>

        {/* Edad */}
        <View style={styles.fieldRow}>
          <Icon name="calendar-outline" size={18} color="#5c5cff" style={styles.fieldIcon} />
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { color: subColor }]}>Edad</Text>
            {editing ? (
              <TextInput
                style={[styles.fieldInput, { color: textColor, borderBottomColor: '#5c5cff' }]}
                value={draftAge}
                onChangeText={setDraftAge}
                placeholder="Tu edad"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={3}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: textColor }]}>
                {profile.age ? `${profile.age} años` : 'Sin especificar'}
              </Text>
            )}
          </View>
        </View>

        {/* Género */}
        <View style={styles.fieldRow}>
          <Icon name="male-female-outline" size={18} color="#5c5cff" style={styles.fieldIcon} />
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { color: subColor }]}>Género</Text>
            {editing ? (
              <View style={styles.genderRow}>
                {GENDER_OPTIONS.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderChip,
                      draftGender === g && styles.genderChipSelected,
                    ]}
                    onPress={() => setDraftGender(g)}
                  >
                    <Text style={[
                      styles.genderChipText,
                      draftGender === g && styles.genderChipTextSelected,
                    ]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={[styles.fieldValue, { color: textColor }]}>
                {profile.gender || 'Sin especificar'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ── Estadísticas y acceso rápido ────────────────────────────────────── */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Mi Pokédex</Text>

        {/* Acceso a Favoritos */}
        <TouchableOpacity
          style={styles.statRow}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Icon name="star" size={22} color="#F8D030" />
          <Text style={[styles.statLabel, { color: textColor }]}>Pokémon Favoritos</Text>
          <Text style={[styles.statValue, { color: '#5c5cff' }]}>{favoritesCount}</Text>
          <Icon name="chevron-forward" size={18} color={subColor} />
        </TouchableOpacity>
      </View>

      {/* ── Ajustes ─────────────────────────────────────────────────────────── */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Ajustes</Text>

        <TouchableOpacity
          style={styles.statRow}
          onPress={() => dispatch(toggleTheme())}
        >
          <Icon name={isDark ? 'sunny' : 'moon'} size={22} color={isDark ? '#F8D030' : '#5c5cff'} />
          <Text style={[styles.statLabel, { color: textColor }]}>
            {isDark ? 'Modo Claro' : 'Modo Oscuro'}
          </Text>
          <Icon name="chevron-forward" size={18} color={subColor} />
        </TouchableOpacity>
      </View>

      {/* ── Cerrar sesión ───────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() =>
          Alert.alert('Cerrar sesión', '¿Estás seguro que quieres salir?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: () => dispatch(logout()) },
          ])
        }
      >
        <Icon name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 16 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  cameraIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#5c5cff',
    borderRadius: 12,
    padding: 4,
  },
  emailText: { fontSize: 14, marginBottom: 2 },
  roleText: { fontSize: 13, marginBottom: 16 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#5c5cff',
  },
  editButtonText: { color: '#5c5cff', fontWeight: '600', fontSize: 14 },
  editActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  saveButton: {
    backgroundColor: '#5c5cff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#555',
  },
  cancelButtonText: { fontWeight: 'bold' },
  card: {
    width: '100%',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fieldIcon: { marginTop: 2, marginRight: 12 },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 12, marginBottom: 2 },
  fieldValue: { fontSize: 15 },
  fieldInput: {
    fontSize: 15,
    borderBottomWidth: 1,
    paddingBottom: 4,
    paddingTop: 0,
  },
  genderRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  genderChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
  },
  genderChipSelected: { backgroundColor: '#5c5cff', borderColor: '#5c5cff' },
  genderChipText: { color: '#aaa', fontSize: 13 },
  genderChipTextSelected: { color: '#fff', fontWeight: 'bold' },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  statLabel: { flex: 1, fontSize: 15 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginRight: 4 },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E3350D',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ProfileScreen;
