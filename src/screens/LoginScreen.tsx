import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  LayoutAnimation, UIManager, Platform, Image, Alert,
  KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthStackParamList } from '../types/navigation';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LoginNav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LoginNav>();
  // Lee todos los usuarios registrados (persiste entre sesiones)
  const registeredUsers = useAppSelector(state => state.users.users);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Busca el usuario por email (case insensitive) y verifica la contraseña
    const found = registeredUsers.find(
      u =>
        u.email.toLowerCase() === username.toLowerCase().trim() &&
        u.password === password
    );
    if (found) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dispatch(login({ username: found.email, rememberPassword: true }));
    } else {
      setError('Credenciales incorrectas');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar contraseña',
      'Se enviará un enlace de recuperación a tu correo registrado.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      {/* Logo sin marco: imagen limpia sobre fondo oscuro */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Pokédex</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <View style={styles.inputContainer}>
        <Icon name="mail" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#888"
          value={username}
          onChangeText={text => { setUsername(text); setError(''); }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock-closed" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          value={password}
          onChangeText={text => { setPassword(text); setError(''); }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>INGRESAR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerContainer} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text></Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: '#1a1a1a' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 24,
    paddingBottom: 40,
  },
  // Logo a tamaño completo, sin ningún contenedor con fondo visible
  logo: { width: 220, height: 220, marginBottom: 16, backgroundColor: 'transparent' },
  circleAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#5c5cff', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, width: '100%' },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, color: '#fff' },
  button: { backgroundColor: '#5c5cff', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  errorText: { color: '#ff5c5c', marginBottom: 8, alignSelf: 'flex-start' },
  forgotContainer: { alignSelf: 'flex-end', marginBottom: 15 },
  forgotText: { color: '#5c5cff', fontSize: 13 },
  registerContainer: { marginTop: 20 },
  registerText: { color: '#888', fontSize: 14 },
  registerLink: { color: '#5c5cff', fontWeight: 'bold' },
});

export default LoginScreen;