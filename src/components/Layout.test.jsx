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

function renderLayout(initialItems = []) {
  return render(
    <CartProvider initialItems={initialItems}>
      <MemoryRouter initialEntries={['/dashboard']}>
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
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(await screen.findByText('Halaman: /')).toBeInTheDocument();
  });

  it('menautkan nama pengguna ke halaman akun', () => {
    renderLayout();

    expect(screen.getByRole('link', { name: 'Dewi' })).toHaveAttribute('href', '/akun');
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
    expect(screen.getByText('3')).toBeInTheDocument();

    unmount();
    renderLayout();
    expect(screen.getByRole('link', { name: 'Keranjang, 0 item' })).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });
});
