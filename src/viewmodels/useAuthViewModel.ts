import { useState } from 'react';
import { LayoutAnimation, UIManager, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { addUser } from '../store/slices/usersSlice';
import { AuthStackParamList } from '../types/navigation';
import { validateLogin, validateRegisterForm } from '../services/authService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Hook de Login ────────────────────────────────────────────────────────────
export const useLoginViewModel = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const registeredUsers = useAppSelector(state => state.users.users);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const found = validateLogin(registeredUsers, email, password);
    if (found) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dispatch(login({ username: found.email, rememberPassword: true }));
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return {
    email,
    setEmail: (text: string) => { setEmail(text); setError(''); },
    password,
    setPassword: (text: string) => { setPassword(text); setError(''); },
    error,
    showPassword,
    setShowPassword,
    handleLogin,
    goToRegister: () => navigation.navigate('Register'),
  };
};

// ─── Hook de Registro ─────────────────────────────────────────────────────────
export const useRegisterViewModel = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Register'>>();
  const existingUsers = useAppSelector(state => state.users.users);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /**
   * handleRegister — Valida el formulario y crea la cuenta
   * @returns string con el mensaje de error, o null si el registro fue exitoso
   */
  const handleRegister = (): string | null => {
    const errorMsg = validateRegisterForm(
      { name, email, password, confirmPassword },
      existingUsers
    );
    if (errorMsg) return errorMsg;

    dispatch(addUser({ email: email.toLowerCase().trim(), password, name }));
    return null;
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    handleRegister,
    goToLogin: () => navigation.navigate('Login'),
    goBack: () => navigation.goBack(),
  };
};
