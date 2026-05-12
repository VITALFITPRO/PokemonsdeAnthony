import { RegisteredUser } from '../store/slices/usersSlice';

/**
 * authService — Lógica de autenticación local/simulada
 *
 * NOTA IMPORTANTE: Las contraseñas se guardan en texto plano en AsyncStorage.
 * Esto es intencionado para un proyecto académico sin backend real.
 * En una app de producción se usaría hashing (bcrypt) y un servidor seguro.
 */

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * validateLogin — Busca el usuario por email y verifica la contraseña
 * @returns El usuario encontrado, o null si las credenciales son incorrectas
 */
export const validateLogin = (
  users: RegisteredUser[],
  email: string,
  password: string
): RegisteredUser | null => {
  return (
    users.find(
      u =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.password === password
    ) ?? null
  );
};

/**
 * validateRegisterForm — Valida todos los campos del formulario de registro
 * @returns Un string con el mensaje de error, o null si todo está correcto
 */
export const validateRegisterForm = (
  form: RegisterForm,
  existingUsers: RegisteredUser[]
): string | null => {
  const { name, email, password, confirmPassword } = form;

  if (!name.trim() || !email.trim() || !password || !confirmPassword) {
    return 'Por favor completa todos los campos.';
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  const emailNorm = email.toLowerCase().trim();
  if (existingUsers.find(u => u.email.toLowerCase() === emailNorm)) {
    return 'Ya existe una cuenta con ese correo electrónico.';
  }
  return null;
};
