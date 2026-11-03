function requiredError(label) {
  return `${label} wajib diisi.`;
}

export function validateFullName(value) {
  const fullName = value?.trim() ?? '';

  if (!fullName) {
    return requiredError('Nama lengkap');
  }

  if (fullName.length < 2) {
    return 'Nama lengkap minimal 2 karakter.';
  }

  return '';
}

export function validateEmail(value) {
  const email = value?.trim() ?? '';

  if (!email) {
    return requiredError('Email');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Format email tidak valid.';
  }

  return '';
}

export function validateLoginForm({ email, password }) {
  return {
    email: validateEmail(email),
    password: password ? '' : requiredError('Kata sandi'),
  };
}

export function validatePassword(value) {
  const password = value ?? '';

  if (!password) {
    return requiredError('Kata sandi');
  }

  if (password.length < 8) {
    return 'Kata sandi minimal 8 karakter.';
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Kata sandi harus mengandung huruf dan angka.';
  }

  return '';
}

export function validateRegisterForm({ fullName, email, password, confirmPassword }) {
  const errors = {
    fullName: validateFullName(fullName),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: '',
  };

  if (!confirmPassword) {
    errors.confirmPassword = requiredError('Konfirmasi kata sandi');
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Konfirmasi kata sandi harus sama.';
  }

  return errors;
}
