import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signIn } from './api.js';

const { mockSignInWithPassword } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
}));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  },
}));

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
