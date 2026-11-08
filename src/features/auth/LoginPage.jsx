import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { validateLoginForm } from '@/lib/validators.js';

import { getPostLoginPath } from './redirect.js';
import { useAuth } from './useAuth.js';
import AuthCard from './components/AuthCard.jsx';
import PasswordField from './components/PasswordField.jsx';
import TextField from './components/TextField.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signIn, loading } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !isSubmitting) {
      navigate('/', { replace: true });
    }
  }, [isSubmitting, loading, navigate, user]);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
    setServerError('');
  }

  function validateField(fieldName) {
    const nextErrors = validateLoginForm(values);
    setErrors((currentErrors) => ({ ...currentErrors, [fieldName]: nextErrors[fieldName] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);
    setServerError('');

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(values.email.trim(), values.password);
      navigate(getPostLoginPath(role, location.state?.from ?? '/'), { replace: true });
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
        <Link className="text-accent-text underline" to="/register">
          Belum punya akun? Daftar
        </Link>
      }
      subtitle="Selamat datang kembali, silakan masuk ke akunmu."
      title="Masuk"
    >
      {serverError && (
        <p className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-text" role="alert">
          {serverError}
        </p>
      )}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
          error={errors.password}
          label="Kata sandi"
          name="password"
          onBlur={() => validateField('password')}
          onChange={updateValue}
          value={values.password}
        />
        <button
          className="h-12 w-full rounded-xl bg-primary px-4 text-base font-semibold text-surface hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </AuthCard>
  );
}
