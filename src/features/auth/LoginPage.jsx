import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { validateLoginForm } from '@/lib/validators.js';

import { getPostLoginPath } from './redirect.js';
import { useAuth } from './useAuth.js';

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
    <main className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      <section className="rounded-base bg-white p-5 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-primary">Masuk</h1>
        <p className="mt-2 text-ink">Masuk ke akun Seruput kamu.</p>
        {serverError && (
          <p className="mt-4 rounded-base bg-red-100 p-3 text-red-800" role="alert">
            {serverError}
          </p>
        )}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <Field
            autoComplete="email"
            error={errors.email}
            label="Email"
            name="email"
            onBlur={() => validateField('email')}
            onChange={updateValue}
            type="email"
            value={values.email}
          />
          <Field
            autoComplete="current-password"
            error={errors.password}
            label="Kata sandi"
            name="password"
            onBlur={() => validateField('password')}
            onChange={updateValue}
            type="password"
            value={values.password}
          />
          <button
            className="min-h-11 w-full rounded-base bg-primary px-4 py-2 font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="mt-6 text-center text-ink">
          <Link className="text-caramel underline" to="/register">
            Belum punya akun? Daftar
          </Link>
        </p>
      </section>
    </main>
  );
}

function Field({ autoComplete, error, label, name, onBlur, onChange, type, value }) {
  return (
    <div>
      <label className="mb-1 block font-medium text-ink" htmlFor={name}>
        {label}
      </label>
      <input
        autoComplete={autoComplete}
        className="min-h-11 w-full rounded-base border border-primary/30 bg-white px-3 text-ink outline-none focus:border-primary"
        id={name}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        type={type}
        value={value}
      />
      {error && (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
