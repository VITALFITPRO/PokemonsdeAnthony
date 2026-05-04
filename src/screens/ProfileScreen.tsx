import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const username = useAppSelector(state => state.auth.username);
  const favoritesCount = useAppSelector(state => state.favorites.pokemonIds.length);
  const isDark = useAppSelector(state => state.theme.isDark);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }]}>
      <View style={styles.circleAvatar}>
         <Icon name="person" size={50} color="#fff" />
      </View>
      <Text style={[styles.username, { color: isDark ? '#fff' : '#111' }]}>{username || 'admin'}</Text>
      <Text style={styles.role}>Entrenador Pokémon</Text>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
          <Icon name="heart" size={20} color="#5c5cff" />
          <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#555' }]}>Favoritos</Text>
          <Text style={[styles.statValue, { color: isDark ? '#fff' : '#111' }]}>{favoritesCount}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}
        onPress={() => dispatch(toggleTheme())}
      >
        <Icon name={isDark ? 'sunny' : 'moon'} size={22} color={isDark ? '#F8D030' : '#5c5cff'} />
        <Text style={[styles.themeText, { color: isDark ? '#F8D030' : '#5c5cff' }]}>
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => dispatch(logout())}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 60 },
  circleAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#5c5cff', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  username: { fontSize: 24, fontWeight: 'bold' },
  role: { color: '#888', fontSize: 16, marginBottom: 30 },
  statsContainer: { width: '80%', marginBottom: 20 },
  statBox: { padding: 20, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontSize: 16, flex: 1, marginLeft: 15 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  themeButton: { flexDirection: 'row', alignItems: 'center', width: '80%', padding: 15, borderRadius: 8, marginBottom: 15, justifyContent: 'center', gap: 10 },
  themeText: { fontWeight: 'bold', fontSize: 16 },
  logoutButton: { backgroundColor: '#5c5cff', width: '80%', padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;