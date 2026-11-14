import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ConfirmationPlaceholder from './ConfirmationPlaceholder.jsx';
import PaymentPage from './PaymentPage.jsx';

const { mockPlaceOrder, mockUseAuth, mockUseCart } = vi.hoisted(() => ({
  mockPlaceOrder: vi.fn(),
  mockUseAuth: vi.fn(),
  mockUseCart: vi.fn(),
}));

vi.mock('./orderService.js', () => ({ placeOrder: mockPlaceOrder }));
vi.mock('@/features/cart/useCart.js', () => ({ useCart: mockUseCart }));
vi.mock('@/features/auth/useAuth.js', () => ({ useAuth: mockUseAuth }));

const cartItem = {
  key: 'kopi',
  menuId: 1,
  menuName: 'Kopi Susu',
  quantity: 2,
  selectedOptions: [{ optionId: 3 }],
};
const checkoutState = {
  orderType: 'take_away',
  notes: 'Jangan terlalu manis',
};

function renderPayment({ state = checkoutState, items = [cartItem], clearCart = vi.fn() } = {}) {
  mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  mockUseCart.mockReturnValue({
    items,
    subtotal: 54000,
    clearCart,
  });

  const initialEntry = { pathname: '/checkout/pembayaran' };
  if (state !== undefined) initialEntry.state = state;

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<PaymentPage />} path="/checkout/pembayaran" />
        <Route element={<p>Checkout halaman</p>} path="/checkout" />
        <Route element={<p>Halaman keranjang</p>} path="/keranjang" />
        <Route element={<ConfirmationPlaceholder />} path="/pesanan/:id" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PaymentPage', () => {
  beforeEach(() => {
    mockPlaceOrder.mockReset();
    mockUseAuth.mockReset();
    mockUseCart.mockReset();
    mockPlaceOrder.mockResolvedValue({
      orderId: 'order-1',
      orderNumber: 'S-1001',
      totalAmount: 54000,
    });
  });

  afterEach(() => cleanup());

  it('mengarahkan ke checkout jika state checkout tidak ada', async () => {
    renderPayment({ state: null });

    expect(await screen.findByText('Checkout halaman')).toBeInTheDocument();
    expect(mockPlaceOrder).not.toHaveBeenCalled();
  });

  it('mengarahkan ke keranjang jika keranjang kosong', async () => {
    renderPayment({ items: [] });

    expect(await screen.findByText('Halaman keranjang')).toBeInTheDocument();
  });

  it('meminta metode pembayaran dan memindahkan fokus ke pilihan pertama', () => {
    renderPayment();

    fireEvent.click(screen.getByRole('button', { name: 'Buat pesanan' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Pilih metode pembayaran.');
    expect(screen.getByRole('radio', { name: 'Tunai di kasir' })).toHaveFocus();
    expect(mockPlaceOrder).not.toHaveBeenCalled();
  });

  it('mengirim pesanan dengan metode tunai', async () => {
    renderPayment();
    fireEvent.click(screen.getByRole('radio', { name: 'Tunai di kasir' }));
    expect(screen.getByText('Bayar di kasir saat mengambil pesanan.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Buat pesanan' }));

    await waitFor(() => {
      expect(mockPlaceOrder).toHaveBeenCalledWith({
        items: [cartItem],
        orderType: 'take_away',
        paymentMethod: 'cash',
        notes: checkoutState.notes,
      });
    });
  });

  it('menampilkan QRIS simulasi dan mengirim metode qris_sim', async () => {
    renderPayment();
    fireEvent.click(screen.getByRole('radio', { name: 'QRIS (simulasi)' }));

    expect(screen.getByText('QRIS simulasi, bukan pembayaran sungguhan.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Saya sudah bayar' }));

    await waitFor(() => {
      expect(mockPlaceOrder).toHaveBeenCalledWith(
        expect.objectContaining({ paymentMethod: 'qris_sim' }),
      );
    });
  });

  it('mengabaikan pengiriman ganda selama proses berlangsung', async () => {
    let resolveOrder;
    mockPlaceOrder.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveOrder = resolve;
        }),
    );
    renderPayment();
    fireEvent.click(screen.getByRole('radio', { name: 'Tunai di kasir' }));
    const form = screen.getByRole('button', { name: 'Buat pesanan' }).closest('form');

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(mockPlaceOrder).toHaveBeenCalledTimes(1);
    resolveOrder({ orderId: 'order-1', orderNumber: 'S-1001' });
    await screen.findByText('Pesanan S-1001 berhasil dibuat');
  });

  it('mengosongkan keranjang lalu berpindah ke placeholder pesanan saat berhasil', async () => {
    const clearCart = vi.fn();
    renderPayment({ clearCart });
    fireEvent.click(screen.getByRole('radio', { name: 'Tunai di kasir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Buat pesanan' }));

    expect(await screen.findByText('Pesanan S-1001 berhasil dibuat')).toBeInTheDocument();
    expect(clearCart).toHaveBeenCalledOnce();
  });

  it('menampilkan galat server dan mempertahankan isi keranjang', async () => {
    const clearCart = vi.fn();
    mockPlaceOrder.mockRejectedValue(new Error('Menu tidak tersedia.'));
    renderPayment({ clearCart });
    fireEvent.click(screen.getByRole('radio', { name: 'Tunai di kasir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Buat pesanan' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Menu tidak tersedia.');
    expect(screen.getByRole('link', { name: 'Kembali ke keranjang' })).toHaveAttribute(
      'href',
      '/keranjang',
    );
    expect(clearCart).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Buat pesanan' })).toBeEnabled();
  });
});
