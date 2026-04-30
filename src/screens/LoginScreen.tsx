import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === '12345678') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dispatch(login({ username, rememberPassword: true }));
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.circleAvatar} />
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        <Icon name="person" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock-closed" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>INGRESAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 20 },
  circleAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#5c5cff', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, width: '100%' },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, color: '#fff' },
  button: { backgroundColor: '#5c5cff', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  errorText: { color: '#ff5c5c', marginBottom: 10 },
});

export default LoginScreen;