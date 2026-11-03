import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from './LoginPage.jsx';

const { mockSignIn, mockUseAuth } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock('./useAuth.js', () => ({
  useAuth: mockUseAuth,
}));

function CurrentPath() {
  const location = useLocation();
  return <p>Halaman: {location.pathname}</p>;
}

function renderLoginPage(initialEntries = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<CurrentPath />} path="/" />
        <Route element={<CurrentPath />} path="*" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockUseAuth.mockReturnValue({
      loading: false,
      role: null,
      signIn: mockSignIn,
      user: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('menampilkan galat kolom kosong dan tidak memanggil signIn', () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(screen.getByText('Email wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi.')).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('memanggil signIn dengan email dan kata sandi yang valid', async () => {
    mockSignIn.mockResolvedValue({});
    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'dewi@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Kata sandi'), {
      target: { value: 'sandi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('dewi@example.com', 'sandi');
    });
  });

  it('menampilkan galat dari server', async () => {
    mockSignIn.mockRejectedValue(new Error('Email atau kata sandi salah'));
    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'dewi@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Kata sandi'), {
      target: { value: 'sandi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByText('Email atau kata sandi salah')).toBeInTheDocument();
  });

  it('mengalihkan ke beranda setelah berhasil masuk tanpa tujuan asal', async () => {
    mockSignIn.mockResolvedValue({});
    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'dewi@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Kata sandi'), {
      target: { value: 'sandi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByText('Halaman: /')).toBeInTheDocument();
  });

  it('kembali ke tujuan asal setelah berhasil masuk', async () => {
    mockSignIn.mockResolvedValue({});
    renderLoginPage([{ pathname: '/login', state: { from: { pathname: '/cart' } } }]);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'dewi@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Kata sandi'), {
      target: { value: 'sandi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByText('Halaman: /cart')).toBeInTheDocument();
  });
});
