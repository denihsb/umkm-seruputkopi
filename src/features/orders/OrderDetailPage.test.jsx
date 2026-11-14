import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '@/app/routes/ProtectedRoute.jsx';
import RoleRoute from '@/app/routes/RoleRoute.jsx';
import OrderDetailPage from './OrderDetailPage.jsx';
import { formatDateTime } from '@/lib/format.js';

const { mockGetOrderDetail, mockUseAuth } = vi.hoisted(() => ({
  mockGetOrderDetail: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock('./api.js', () => ({ getOrderDetail: mockGetOrderDetail }));
vi.mock('@/features/auth/useAuth.js', () => ({ useAuth: () => mockUseAuth() }));

const order = {
  id: '11111111-1111-4111-8111-111111111111',
  orderNumber: 'SRP-001',
  orderType: 'take_away',
  paymentMethod: 'qris_sim',
  paymentStatus: 'paid',
  status: 'processing',
  notes: 'Kurangi gula',
  totalAmount: 30000,
  createdAt: '2026-11-14T06:45:00Z',
  customerName: 'Deni',
  items: [
    {
      id: 'item-1',
      menuName: 'Kopi Susu',
      unitPrice: 15000,
      quantity: 2,
      subtotal: 30000,
      options: [{ id: 'option-1', optionName: 'Sedang' }],
    },
  ],
};

function renderPage(path = `/dashboard/pesanan/${order.id}`) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['owner']} />}>
            <Route element={<OrderDetailPage />} path="/dashboard/pesanan/:id" />
          </Route>
        </Route>
        <Route element={<p>Beranda pelanggan</p>} path="/" />
        <Route element={<p>Halaman masuk</p>} path="/login" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    mockGetOrderDetail.mockReset();
    mockGetOrderDetail.mockResolvedValue(order);
    mockUseAuth.mockReturnValue({
      user: { id: 'owner-1' },
      role: 'owner',
      loading: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('menampilkan informasi transaksi dan tautan kembali ke dashboard', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'SRP-001' })).toBeInTheDocument();
    expect(screen.getByText('Diproses')).toBeInTheDocument();
    expect(screen.getByText(formatDateTime(order.createdAt))).toBeInTheDocument();
    expect(screen.getByText('Deni')).toBeInTheDocument();
    expect(screen.getByText('Bawa pulang')).toBeInTheDocument();
    expect(screen.getByText('QRIS (simulasi)')).toBeInTheDocument();
    expect(screen.getByText('Lunas')).toBeInTheDocument();
    expect(screen.getByText('Kurangi gula')).toBeInTheDocument();
    expect(screen.getByText('2 x Kopi Susu')).toBeInTheDocument();
    expect(screen.getByText('Sedang')).toBeInTheDocument();
    expect(screen.getByText('Total').parentElement).toHaveTextContent('Rp30.000');
    expect(screen.getByRole('link', { name: 'Kembali ke dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(screen.getByLabelText('Area tombol status pesanan')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('menampilkan catatan hanya jika berisi teks', async () => {
    renderPage();
    expect(await screen.findByText('Kurangi gula')).toBeInTheDocument();

    cleanup();
    mockGetOrderDetail.mockResolvedValueOnce({ ...order, notes: '   ' });
    renderPage();

    await screen.findByRole('heading', { name: 'SRP-001' });
    await waitFor(() =>
      expect(screen.queryByText('Catatan untuk barista')).not.toBeInTheDocument(),
    );
  });

  it('menampilkan item tanpa varian', async () => {
    mockGetOrderDetail.mockResolvedValue({
      ...order,
      items: [{ ...order.items[0], options: [] }],
    });

    renderPage();

    expect(await screen.findByText('2 x Kopi Susu')).toBeInTheDocument();
    expect(screen.queryByText('Sedang')).not.toBeInTheDocument();
  });

  it('menampilkan keadaan tidak ditemukan dan tautan kembali', async () => {
    mockGetOrderDetail.mockRejectedValue(new Error('Pesanan tidak ditemukan.'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Pesanan tidak ditemukan.');
    expect(screen.getByRole('link', { name: 'Kembali ke dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('menampilkan galat dan memuat ulang saat Coba lagi dipilih', async () => {
    mockGetOrderDetail
      .mockRejectedValueOnce(new Error('Gagal memuat pesanan. Periksa koneksi internet kamu.'))
      .mockResolvedValueOnce(order);

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat pesanan.');
    screen.getByRole('button', { name: 'Coba lagi' }).click();
    expect(await screen.findByRole('heading', { name: 'SRP-001' })).toBeInTheDocument();
    expect(mockGetOrderDetail).toHaveBeenCalledTimes(2);
  });

  it('menampilkan skeleton saat detail masih dimuat', () => {
    mockGetOrderDetail.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByLabelText('Memuat detail pesanan')).toBeInTheDocument();
  });

  it('mengarahkan pelanggan yang membuka URL ke beranda', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'customer-1' },
      role: 'customer',
      loading: false,
    });

    renderPage();

    expect(screen.getByText('Beranda pelanggan')).toBeInTheDocument();
    expect(mockGetOrderDetail).not.toHaveBeenCalled();
  });
});
