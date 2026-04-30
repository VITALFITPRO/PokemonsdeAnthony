import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const username = useAppSelector(state => state.auth.username);
  const favoritesCount = useAppSelector(state => state.favorites.pokemonIds.length);

  return (
    <View style={styles.container}>
      <View style={styles.circleAvatar}>
         <Icon name="person" size={50} color="#fff" />
      </View>
      <Text style={styles.username}>{username || 'admin'}</Text>
      <Text style={styles.role}>Entrenador Pokémon</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Icon name="heart" size={20} color="#5c5cff" />
          <Text style={styles.statLabel}>Favoritos</Text>
          <Text style={styles.statValue}>{favoritesCount}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => dispatch(logout())}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', alignItems: 'center', paddingTop: 60 },
  circleAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#5c5cff', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  username: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  role: { color: '#888', fontSize: 16, marginBottom: 30 },
  statsContainer: { width: '80%', marginBottom: 40 },
  statBox: { backgroundColor: '#2a2a2a', padding: 20, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: '#ccc', fontSize: 16, flex: 1, marginLeft: 15 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#5c5cff', width: '80%', padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;