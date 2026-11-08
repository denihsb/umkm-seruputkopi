import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { validateRegisterForm } from '@/lib/validators.js';

import { useAuth } from './useAuth.js';
import { getHomePath } from './redirect.js';
import AuthCard from './components/AuthCard.jsx';
import PasswordField from './components/PasswordField.jsx';
import TextField from './components/TextField.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { role, signUp, loading } = useAuth();
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
    setServerError('');
  }

  function validateField(fieldName) {
    const nextErrors = validateRegisterForm(values);
    setErrors((currentErrors) => ({ ...currentErrors, [fieldName]: nextErrors[fieldName] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);
    setServerError('');
    setConfirmationMessage('');

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp(values.fullName.trim(), values.email.trim(), values.password);
      if (result.needsEmailConfirmation) {
        setConfirmationMessage('Cek email kamu untuk konfirmasi, lalu masuk.');
      } else {
        navigate(getHomePath(role));
      }
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isBusy = loading || isSubmitting;

  return (
    <AuthCard
      footer={
        <Link className="text-accent-text underline" to="/login">
          Sudah punya akun? Masuk
        </Link>
      }
      subtitle="Buat akun untuk pesan kopi favoritmu di Seruput."
      title="Daftar"
    >
      {serverError && (
        <p className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-text" role="alert">
          {serverError}
        </p>
      )}
      {confirmationMessage && (
        <p className="mt-4 rounded-xl bg-primary-soft p-3 text-sm text-primary" role="status">
          {confirmationMessage}
        </p>
      )}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <TextField
          autoComplete="name"
          error={errors.fullName}
          label="Nama lengkap"
          name="fullName"
          onBlur={() => validateField('fullName')}
          onChange={updateValue}
          value={values.fullName}
        />
        <TextField
          autoComplete="email"
          error={errors.email}
          label="Email"
          name="email"
          onBlur={() => validateField('email')}
          onChange={updateValue}
          type="email"
          value={values.email}
        />
        <PasswordField
          autoComplete="new-password"
          error={errors.password}
          helpText="Minimal 8 karakter, mengandung huruf dan angka."
          label="Kata sandi"
          name="password"
          onBlur={() => validateField('password')}
          onChange={updateValue}
          value={values.password}
        />
        <PasswordField
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Konfirmasi kata sandi"
          name="confirmPassword"
          onBlur={() => validateField('confirmPassword')}
          onChange={updateValue}
          value={values.confirmPassword}
        />
        <button
          className="h-12 w-full rounded-xl bg-primary px-4 text-base font-semibold text-surface hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
    </AuthCard>
  );
}
