import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { validateRegisterForm } from '@/lib/validators.js';

import { useAuth } from './useAuth.js';
import { getHomePath } from './redirect.js';

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
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">Daftar</h1>
      <p className="mt-2 text-ink">Buat akun untuk mulai menggunakan Seruput.</p>
      {serverError && (
        <p className="mt-4 rounded-base bg-red-100 p-3 text-red-800" role="alert">
          {serverError}
        </p>
      )}
      {confirmationMessage && (
        <p className="mt-4 rounded-base bg-green-100 p-3 text-green-800" role="status">
          {confirmationMessage}
        </p>
      )}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <Field
          autoComplete="name"
          error={errors.fullName}
          label="Nama lengkap"
          name="fullName"
          onBlur={() => validateField('fullName')}
          onChange={updateValue}
          value={values.fullName}
        />
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
          autoComplete="new-password"
          error={errors.password}
          label="Kata sandi"
          name="password"
          onBlur={() => validateField('password')}
          onChange={updateValue}
          type="password"
          value={values.password}
        />
        <Field
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Konfirmasi kata sandi"
          name="confirmPassword"
          onBlur={() => validateField('confirmPassword')}
          onChange={updateValue}
          type="password"
          value={values.confirmPassword}
        />
        <button
          className="min-h-11 w-full rounded-base bg-primary px-4 py-2 font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
      <p className="mt-6 text-center text-ink">
        <Link className="text-caramel underline" to="/login">
          Sudah punya akun? Masuk
        </Link>
      </p>
    </main>
  );
}

function Field({ autoComplete, error, label, name, onBlur, onChange, type = 'text', value }) {
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
