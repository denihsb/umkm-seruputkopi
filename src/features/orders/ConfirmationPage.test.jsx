import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ConfirmationPage from './ConfirmationPage.jsx';

const { mockGetOrderDetail } = vi.hoisted(() => ({ mockGetOrderDetail: vi.fn() }));
vi.mock('./api.js', () => ({ getOrderDetail: mockGetOrderDetail }));

const order = {
  id: '11111111-1111-4111-8111-111111111111',
  orderNumber: 'S-1001',
  orderType: 'take_away',
  paymentMethod: 'cash',
  paymentStatus: 'pending',
  status: 'received',
  notes: 'Kurangi gula',
  totalAmount: 30000,
  items: [
    {
      id: 'item-1',
      menuName: 'Kopi Susu',
      quantity: 2,
      subtotal: 30000,
      options: [{ id: 'option-1', optionName: 'Sedang' }],
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/pesanan/${order.id}`]}>
      <Routes>
        <Route element={<ConfirmationPage />} path="/pesanan/:id" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ConfirmationPage', () => {
  beforeEach(() => {
    mockGetOrderDetail.mockReset();
    mockGetOrderDetail.mockResolvedValue(order);
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('menampilkan nomor, item, dan status saat ini', async () => {
    renderPage();

    expect(await screen.findByTestId('order-number')).toHaveTextContent('S-1001');
    expect(screen.getByText('2 x Kopi Susu')).toBeInTheDocument();
    expect(screen.getByText('Diterima')).toHaveAttribute('aria-current', 'step');
  });

  it.each([
    ['received', 'Diterima'],
    ['processing', 'Diproses'],
    ['ready', 'Siap'],
    ['completed', 'Selesai'],
  ])('menandai langkah %s dengan benar', async (status, label) => {
    mockGetOrderDetail.mockResolvedValue({ ...order, status });
    renderPage();

    expect(await screen.findByText(label)).toHaveAttribute('aria-current', 'step');
  });

  it('menampilkan informasi tunai belum dibayar dan QRIS lunas', async () => {
    renderPage();
    expect(await screen.findByText('Bayar di kasir saat mengambil pesanan.')).toBeInTheDocument();
    cleanup();

    mockGetOrderDetail.mockResolvedValue({
      ...order,
      paymentMethod: 'qris_sim',
      paymentStatus: 'paid',
    });
    renderPage();
    expect(await screen.findByText('QRIS (simulasi)')).toBeInTheDocument();
    expect(screen.getByText('Lunas')).toBeInTheDocument();
  });

  it('menampilkan kondisi tidak ditemukan dan galat dengan coba lagi', async () => {
    mockGetOrderDetail.mockRejectedValueOnce(new Error('Pesanan tidak ditemukan.'));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Pesanan tidak ditemukan.');
    expect(screen.getByRole('link', { name: 'Lihat menu' })).toBeInTheDocument();

    cleanup();
    mockGetOrderDetail.mockRejectedValueOnce(
      new Error('Gagal memuat pesanan. Periksa koneksi internet kamu.'),
    );
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat pesanan.');
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
  });

  it('memanggil ulang API setelah 30 detik dan berhenti setelah selesai', async () => {
    vi.useFakeTimers();
    renderPage();
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockGetOrderDetail).toHaveBeenCalledTimes(1);

    mockGetOrderDetail.mockResolvedValue({ ...order, status: 'completed' });
    await act(async () => {
      vi.advanceTimersByTime(30000);
      await Promise.resolve();
    });
    expect(mockGetOrderDetail).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Selesai')).toHaveAttribute('aria-current', 'step');
    vi.advanceTimersByTime(30000);
    expect(mockGetOrderDetail).toHaveBeenCalledTimes(2);
  });

  it('menyalin nomor pesanan', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    renderPage();
    await screen.findByTestId('order-number');

    fireEvent.click(screen.getByRole('button', { name: 'Salin nomor' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('S-1001'));
    expect(await screen.findByRole('button', { name: 'Tersalin' })).toBeInTheDocument();
  });
});
