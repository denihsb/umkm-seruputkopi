import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CheckoutPage from './CheckoutPage.jsx';
import PaymentPlaceholderPage from './PaymentPlaceholderPage.jsx';

const { mockUseAuth, mockUseCart } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseCart: vi.fn(),
}));

vi.mock('@/features/auth/useAuth.js', () => ({ useAuth: mockUseAuth }));
vi.mock('@/features/cart/useCart.js', () => ({ useCart: mockUseCart }));
const item = {
  key: 'kopi',
  menuName: 'Kopi Susu',
  quantity: 2,
  unitPrice: 27000,
  selectedOptions: [],
};

function renderCheckout(items = [item]) {
  mockUseAuth.mockReturnValue({ profile: { full_name: 'Dewi Seruput' } });
  mockUseCart.mockReturnValue({ items, itemCount: 2, subtotal: 54000 });
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <CheckoutPage />
    </MemoryRouter>,
  );
}

describe('CheckoutPage', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseCart.mockReset();
  });

  it('menampilkan keadaan kosong tanpa redirect otomatis', () => {
    renderCheckout([]);

    expect(screen.getByRole('heading', { name: 'Keranjang kosong' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat menu' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('button', { name: 'Lanjut ke pembayaran' })).not.toBeInTheDocument();
  });

  it('menampilkan galat tipe pesanan dan tidak berpindah halaman', () => {
    renderCheckout();

    fireEvent.click(screen.getByRole('button', { name: 'Lanjut ke pembayaran' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Pilih tipe pesanan.');
  });

  it('menampilkan galat catatan lebih dari 200 karakter', () => {
    renderCheckout();

    fireEvent.change(screen.getByLabelText('Catatan untuk barista (opsional)'), {
      target: { value: 'a'.repeat(201) },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Lanjut ke pembayaran' }).closest('form'));

    expect(
      screen.getByText('Catatan maksimal 200 karakter.', { selector: 'p' }),
    ).toBeInTheDocument();
  });

  it('berpindah ke placeholder dengan state checkout yang benar', () => {
    renderCheckout();

    const takeAwayRadio = screen.getByRole('radio', { name: 'Bawa pulang' });
    fireEvent.click(takeAwayRadio);
    expect(takeAwayRadio).toBeChecked();
    fireEvent.change(screen.getByLabelText('Catatan untuk barista (opsional)'), {
      target: { value: 'Jangan terlalu manis' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut ke pembayaran' }));

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });
});

describe('ProtectedRoute checkout redirect', () => {
  afterEach(() => cleanup());

  it('mengarahkan pengguna yang belum login ke login dengan asal checkout', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    mockUseCart.mockReturnValue({ items: [], itemCount: 0, subtotal: 0 });
    const ProtectedRoute = (await import('@/app/routes/ProtectedRoute.jsx')).default;

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route element={<ProtectedRoute />} path="/">
            <Route element={<p>Checkout</p>} path="checkout" />
          </Route>
          <Route element={<p>Login</p>} path="/login" />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});

describe('PaymentPlaceholderPage', () => {
  afterEach(() => cleanup());

  it('menampilkan state tipe pesanan dan catatan', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/checkout/pembayaran',
            state: { orderType: 'take_away', notes: 'Jangan terlalu manis' },
          },
        ]}
      >
        <PaymentPlaceholderPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Bawa pulang')).toBeInTheDocument();
    expect(screen.getByText('Jangan terlalu manis')).toBeInTheDocument();
  });
  afterEach(() => cleanup());

  it('mengarahkan kembali ke checkout jika tanpa state', () => {
    render(
      <MemoryRouter initialEntries={['/checkout/pembayaran']}>
        <Routes>
          <Route element={<PaymentPlaceholderPage />} path="/checkout/pembayaran" />
          <Route element={<p>Checkout</p>} path="/checkout" />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });
});
