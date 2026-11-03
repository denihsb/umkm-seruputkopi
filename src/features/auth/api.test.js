import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signIn, signOut } from './api.js';

const { mockSignInWithPassword, mockSignOut } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
  },
}));

describe('signOut', () => {
  beforeEach(() => {
    mockSignOut.mockReset();
  });

  it('melempar galat berbahasa Indonesia jika Supabase mengembalikan galat', async () => {
    mockSignOut.mockResolvedValue({ data: null, error: new Error('network error') });

    await expect(signOut()).rejects.toThrow('Gagal keluar. Coba lagi.');
  });

  it('menerjemahkan penolakan dari Supabase menjadi galat yang jelas', async () => {
    mockSignOut.mockRejectedValue(new Error('network error'));

    await expect(signOut()).rejects.toThrow('Gagal keluar. Coba lagi.');
  });
});

describe('signIn', () => {
  beforeEach(() => {
    mockSignInWithPassword.mockReset();
  });

  it.each([
    ['Invalid login credentials', 'Email atau kata sandi salah'],
    ['Email not confirmed', 'Email belum dikonfirmasi. Cek kotak masuk kamu.'],
    ['Failed to fetch', 'Tidak dapat terhubung. Periksa koneksi internet kamu.'],
    ['unexpected error', 'Terjadi kesalahan. Coba lagi.'],
  ])('menerjemahkan galat %s', async (message, friendlyMessage) => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message },
    });

    await expect(signIn('dewi@example.com', 'sandi')).rejects.toThrow(friendlyMessage);
  });

  it('menerjemahkan galat jaringan yang ditolak oleh fetch', async () => {
    mockSignInWithPassword.mockRejectedValue(
      new TypeError('NetworkError when attempting to fetch'),
    );

    await expect(signIn('dewi@example.com', 'sandi')).rejects.toThrow(
      'Tidak dapat terhubung. Periksa koneksi internet kamu.',
    );
  });
});
