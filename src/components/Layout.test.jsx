import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Layout from './Layout.jsx';
import { CartProvider } from '@/features/cart/CartContext.jsx';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth/useAuth.js', () => ({
  useAuth: mocks.useAuth,
}));

function CurrentPath() {
  const location = useLocation();
  return <p>Halaman: {location.pathname}</p>;
}

const cartItem = {
  key: '1:2',
  menuId: 1,
  menuName: 'Kopi',
  basePrice: 10000,
  unitPrice: 10000,
  quantity: 3,
  note: '',
  selectedOptions: [],
};

function renderLayout(initialItems = [], initialPath = '/dashboard') {
  return render(
    <CartProvider initialItems={initialItems}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<CurrentPath />} path="/dashboard" />
            <Route element={<CurrentPath />} path="/" />
          </Route>
        </Routes>
      </MemoryRouter>
    </CartProvider>,
  );
}

describe('Layout', () => {
  beforeEach(() => {
    mocks.signOut.mockReset();
    mocks.useAuth.mockReset();
    mocks.useAuth.mockReturnValue({
      profile: { full_name: 'Dewi' },
      role: 'customer',
      signOut: mocks.signOut,
      user: { id: 'user-1' },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('memanggil signOut lalu mengarahkan pengguna ke beranda', async () => {
    mocks.signOut.mockResolvedValue();
    renderLayout([], '/');

    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(await screen.findByText('Halaman: /')).toBeInTheDocument();
  });

  it('menautkan nama pengguna ke halaman akun', () => {
    renderLayout();

    expect(screen.getByRole('link', { name: 'Dewi' })).toHaveAttribute('href', '/akun');
  });

  it('menampilkan tautan dashboard pada halaman pelanggan untuk owner', () => {
    mocks.useAuth.mockReturnValue({
      profile: { full_name: 'Deni Pemilik' },
      role: 'owner',
      signOut: mocks.signOut,
      user: { id: 'owner-1', email: 'denianugra8@gmail.com' },
    });

    renderLayout([], '/');

    expect(screen.getAllByRole('link', { name: 'Dashboard Pemilik' })[0]).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('menampilkan galat dan membiarkan pengguna tetap login jika signOut gagal', async () => {
    mocks.signOut.mockRejectedValue(new Error('Gagal keluar. Coba lagi.'));
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal keluar. Coba lagi.');
    expect(screen.getByText('Dewi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeInTheDocument();
    expect(screen.getByText('Halaman: /dashboard')).toBeInTheDocument();
  });

  it('menampilkan lencana sesuai jumlah item dan menyembunyikannya saat kosong', () => {
    const { unmount } = renderLayout([cartItem]);

    expect(screen.getByRole('link', { name: 'Keranjang, 3 item' })).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);

    unmount();
    renderLayout();
    expect(screen.getByRole('link', { name: 'Keranjang, 0 item' })).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });
});
