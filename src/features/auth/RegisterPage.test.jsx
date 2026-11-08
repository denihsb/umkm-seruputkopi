import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RegisterPage from './RegisterPage.jsx';

const mockSignUp = vi.fn();

vi.mock('./useAuth.js', () => ({
  useAuth: () => ({
    loading: false,
    signUp: mockSignUp,
  }),
}));

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('menampilkan galat kolom kosong dan tidak memanggil signUp', () => {
    renderRegisterPage();

    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(4);
    expect(alerts.map((alert) => alert.textContent)).toEqual(
      expect.arrayContaining(['Nama lengkap wajib diisi.']),
    );
    expect(screen.getByText('Email wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi.')).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('menghubungkan label ke input dan menampilkan atau menyembunyikan kata sandi', () => {
    renderRegisterPage();

    const passwordInput = screen.getByLabelText('Kata sandi');
    const toggleButton = screen.getAllByRole('button', { name: 'Tampilkan kata sandi' })[0];

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByText('Minimal 8 karakter, mengandung huruf dan angka.')).toBeInTheDocument();
    fireEvent.click(toggleButton);
    expect(screen.getByLabelText('Kata sandi')).toHaveAttribute('type', 'text');
    expect(screen.getAllByRole('button', { name: 'Sembunyikan kata sandi' })[0]).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('memanggil signUp dengan data valid', async () => {
    mockSignUp.mockResolvedValue({ needsEmailConfirmation: true });
    renderRegisterPage();

    fireEvent.change(screen.getByLabelText('Nama lengkap'), {
      target: { value: 'Dewi Seruput' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'dewi@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Kata sandi'), {
      target: { value: 'rahasia1' },
    });
    fireEvent.change(screen.getByLabelText('Konfirmasi kata sandi'), {
      target: { value: 'rahasia1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));

    expect(await mockSignUp).toHaveBeenCalledWith('Dewi Seruput', 'dewi@example.com', 'rahasia1');
  });

  it('menampilkan galat dari server', async () => {
    mockSignUp.mockRejectedValue(new Error('Email sudah terdaftar. Silakan masuk.'));
    renderRegisterPage();

    fireEvent.change(screen.getByLabelText('Nama lengkap'), {
      target: { value: 'Dewi Seruput' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'dewi@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Kata sandi'), {
      target: { value: 'rahasia1' },
    });
    fireEvent.change(screen.getByLabelText('Konfirmasi kata sandi'), {
      target: { value: 'rahasia1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));

    expect(await screen.findByText('Email sudah terdaftar. Silakan masuk.')).toBeInTheDocument();
  });
});
