import { describe, expect, it } from 'vitest';

import {
  validateEmail,
  validateCheckoutForm,
  validateFullName,
  validateLoginForm,
  validatePassword,
  validateRegisterForm,
} from './validators.js';

describe('validator checkout', () => {
  it('menolak tipe pesanan yang kosong', () => {
    expect(validateCheckoutForm({ orderType: '', notes: '' })).toEqual({
      orderType: 'Pilih tipe pesanan.',
      notes: '',
    });
  });

  it('menerima tipe pesanan yang valid dan catatan opsional', () => {
    expect(validateCheckoutForm({ orderType: 'dine_in', notes: '  tidak manis  ' })).toEqual({
      orderType: '',
      notes: '',
    });
  });

  it('menolak catatan lebih dari 200 karakter setelah trim', () => {
    expect(validateCheckoutForm({ orderType: 'take_away', notes: ` ${'a'.repeat(201)} ` })).toEqual(
      {
        orderType: '',
        notes: 'Catatan maksimal 200 karakter.',
      },
    );
  });
});

describe('validator login', () => {
  it('menolak semua kolom kosong', () => {
    expect(validateLoginForm({ email: '', password: '' })).toEqual({
      email: 'Email wajib diisi.',
      password: 'Kata sandi wajib diisi.',
    });
  });

  it('menolak format email yang salah', () => {
    expect(validateLoginForm({ email: 'bukan-email', password: '123' })).toEqual({
      email: 'Format email tidak valid.',
      password: '',
    });
  });

  it('menerima email valid dan kata sandi yang terisi', () => {
    expect(validateLoginForm({ email: 'dewi@example.com', password: '1' })).toEqual({
      email: '',
      password: '',
    });
  });
});

describe('validator registrasi', () => {
  it('menerima data registrasi yang valid', () => {
    expect(
      validateRegisterForm({
        fullName: 'Dewi Seruput',
        email: 'dewi@example.com',
        password: 'rahasia1',
        confirmPassword: 'rahasia1',
      }),
    ).toEqual({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  });

  it('menolak semua kolom kosong', () => {
    expect(
      validateRegisterForm({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      }),
    ).toEqual({
      fullName: 'Nama lengkap wajib diisi.',
      email: 'Email wajib diisi.',
      password: 'Kata sandi wajib diisi.',
      confirmPassword: 'Konfirmasi kata sandi wajib diisi.',
    });
  });

  it('menolak format email yang salah dan konfirmasi berbeda', () => {
    expect(validateEmail('bukan-email')).toBe('Format email tidak valid.');
    expect(
      validateRegisterForm({
        fullName: 'Dewi',
        email: 'dewi@example.com',
        password: 'rahasia1',
        confirmPassword: 'berbeda1',
      }).confirmPassword,
    ).toBe('Konfirmasi kata sandi harus sama.');
  });

  it('memeriksa batas minimum nama dan kata sandi', () => {
    expect(validateFullName(' A ')).toBe('Nama lengkap minimal 2 karakter.');
    expect(validatePassword('Abc1234')).toBe('Kata sandi minimal 8 karakter.');
    expect(validatePassword('abcdefgh')).toBe('Kata sandi harus mengandung huruf dan angka.');
    expect(validatePassword('12345678')).toBe('Kata sandi harus mengandung huruf dan angka.');
  });
});
