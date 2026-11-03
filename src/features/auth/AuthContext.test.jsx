import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from './AuthContext.jsx';
import { AuthContext } from './authContext.js';

const mocks = vi.hoisted(() => ({
  fetchProfile: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: mocks.onAuthStateChange,
    },
  },
}));

vi.mock('./api.js', () => ({
  fetchProfile: mocks.fetchProfile,
  getSession: mocks.getSession,
  signIn: mocks.signIn,
  signOut: mocks.signOut,
  signUp: mocks.signUp,
}));

function AuthState() {
  const { loading, profile, role, user } = useContext(AuthContext);

  return (
    <p>
      {loading ? 'Memuat' : 'Selesai'} | {user?.id ?? 'tanpa-user'} |{' '}
      {profile?.full_name ?? 'tanpa-profil'} | {role ?? 'tanpa-peran'}
    </p>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthState />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    mocks.fetchProfile.mockReset();
    mocks.getSession.mockReset();
    mocks.onAuthStateChange.mockReset();
    mocks.signIn.mockReset();
    mocks.signOut.mockReset();
    mocks.signUp.mockReset();
    mocks.unsubscribe.mockReset();
    mocks.onAuthStateChange.mockImplementation((callback) => {
      mocks.authCallback = callback;
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('memulihkan sesi dan profil dari getSession saat dimuat', async () => {
    mocks.getSession.mockResolvedValue({ user: { id: 'user-1' } });
    mocks.fetchProfile.mockResolvedValue({ full_name: 'Dewi', role: 'customer' });

    renderAuthProvider();

    expect(await screen.findByText('Selesai | user-1 | Dewi | customer')).toBeInTheDocument();
    expect(mocks.fetchProfile).toHaveBeenCalledWith('user-1');
  });

  it('mengosongkan user, profile, dan role saat menerima SIGNED_OUT', async () => {
    mocks.getSession.mockResolvedValue({ user: { id: 'user-1' } });
    mocks.fetchProfile.mockResolvedValue({ full_name: 'Dewi', role: 'customer' });

    renderAuthProvider();
    await screen.findByText('Selesai | user-1 | Dewi | customer');

    act(() => {
      mocks.authCallback('SIGNED_OUT', null);
    });

    expect(
      await screen.findByText('Selesai | tanpa-user | tanpa-profil | tanpa-peran'),
    ).toBeInTheDocument();
  });

  it('menghentikan subscription saat dilepas', async () => {
    mocks.getSession.mockResolvedValue(null);

    const view = renderAuthProvider();
    await waitFor(() => expect(screen.getByText(/Selesai/)).toBeInTheDocument());
    view.unmount();

    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });
});
