import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardPage from './DashboardPage.jsx';

const { mockListOrders } = vi.hoisted(() => ({ mockListOrders: vi.fn() }));

vi.mock('./api.js', () => ({
  listOrders: mockListOrders,
}));

const orders = [
  {
    id: 'order-1',
    orderNumber: 'SRP-001',
    orderType: 'take_away',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    status: 'received',
    totalAmount: 27000,
    createdAt: '2026-11-14T06:45:00Z',
    customerName: 'Deni',
  },
  {
    id: 'order-2',
    orderNumber: 'SRP-002',
    orderType: 'dine_in',
    paymentMethod: 'qris_sim',
    paymentStatus: 'pending',
    status: 'processing',
    totalAmount: 35000,
    createdAt: '2026-11-13T06:45:00Z',
    customerName: 'Sari',
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => mockListOrders.mockReset());

  it('menampilkan transaksi berurutan dan tautan detail', async () => {
    mockListOrders.mockResolvedValue({ orders, total: 2 });

    renderPage();

    expect(await screen.findByText('SRP-001')).toBeInTheDocument();
    expect(screen.getByText('SRP-002')).toBeInTheDocument();
    expect(screen.getByText('Diterima')).toBeInTheDocument();
    expect(screen.getByText('Bawa pulang')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /SRP-001/ })).toHaveAttribute(
      'href',
      '/dashboard/pesanan/order-1',
    );
  });

  it('menambahkan halaman berikutnya dan menyembunyikan Muat lagi saat selesai', async () => {
    mockListOrders
      .mockResolvedValueOnce({ orders: [orders[0]], total: 2 })
      .mockResolvedValueOnce({ orders: [orders[1]], total: 2 });

    renderPage();

    await screen.findByText('SRP-001');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Muat lagi' })).toBeInTheDocument(),
    );
    screen.getByRole('button', { name: 'Muat lagi' }).click();

    expect(await screen.findByText('SRP-002')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Muat lagi' })).not.toBeInTheDocument(),
    );
  });

  it('menampilkan loading', async () => {
    let resolveRequest;
    mockListOrders.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    renderPage();
    expect(screen.getAllByLabelText('Memuat transaksi')).toHaveLength(2);
    resolveRequest({ orders: [], total: 0 });
    await screen.findByText('Belum ada transaksi.');
  });

  it('menampilkan galat dan dapat mencoba lagi', async () => {
    mockListOrders.mockRejectedValueOnce(
      new Error('Gagal memuat transaksi. Periksa koneksi internet kamu.'),
    );
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat transaksi');
    mockListOrders.mockResolvedValueOnce({ orders: [], total: 0 });
    screen.getByRole('button', { name: 'Coba lagi' }).click();
    expect(await screen.findByText('Belum ada transaksi.')).toBeInTheDocument();
  });

  it('menyisakan transaksi saat pemuatan halaman berikutnya gagal', async () => {
    mockListOrders
      .mockResolvedValueOnce({ orders: [orders[0]], total: 2 })
      .mockRejectedValueOnce(new Error('Gagal memuat transaksi. Periksa koneksi internet kamu.'));

    renderPage();
    await waitFor(() =>
      expect(document.querySelector('a[href="/dashboard/pesanan/order-1"]')).toBeInTheDocument(),
    );
    screen.getByRole('button', { name: 'Muat lagi' }).click();

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat transaksi');
    expect(document.querySelector('a[href="/dashboard/pesanan/order-1"]')).toBeInTheDocument();
  });
});
