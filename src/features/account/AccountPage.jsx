import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/useAuth.js';

const roleLabels = {
  customer: 'Pelanggan',
  owner: 'Pemilik',
};

export default function AccountPage() {
  const { profile, role, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError('');

    try {
      await signOut();
      navigate('/');
    } catch (error) {
      setSignOutError(error.message || 'Gagal keluar. Coba lagi.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-page px-4 py-8">
      <section className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-5 sm:p-8">
        <h1 className="text-2xl font-semibold text-text">Profil saya</h1>
        <span className="mt-3 inline-block rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
          {roleLabels[role] ?? role}
        </span>
        <dl className="mt-6 space-y-4 text-text">
          <div>
            <dt className="text-sm text-text-muted">Nama lengkap</dt>
            <dd className="mt-1 text-base font-medium">{profile?.full_name}</dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Email</dt>
            <dd className="mt-1 text-base font-medium">{user?.email}</dd>
          </div>
        </dl>
        {signOutError && (
          <p className="mt-6 rounded-xl bg-danger-soft p-3 text-sm text-danger-text" role="alert">
            {signOutError}
          </p>
        )}
        <div className="mt-8 space-y-3">
          <Link
            className="flex h-12 w-full items-center justify-center rounded-xl border border-border-control text-base font-medium text-primary hover:border-primary"
            to="/"
          >
            Jelajahi Menu
          </Link>
          <button
            className="h-12 w-full rounded-xl border border-danger px-4 text-base font-semibold text-danger-text hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSigningOut}
            onClick={handleSignOut}
            type="button"
          >
            {isSigningOut ? 'Keluar...' : 'Keluar dari akun'}
          </button>
        </div>
      </section>
    </main>
  );
}
