import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listOrders, mapOrderRow, updateOrderStatus } from './api.js';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: mockFrom },
}));

function mockQuery(result) {
  const query = {
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    select: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  };
  return query;
}

describe('dashboard api', () => {
  beforeEach(() => mockFrom.mockReset());

  it('memetakan baris pesanan ke camelCase', () => {
    expect(
      mapOrderRow({
        id: 'order-1',
        order_number: 'SRP-001',
        order_type: 'dine_in',
        payment_method: 'cash',
        payment_status: 'paid',
        status: 'completed',
        total_amount: 27000,
        created_at: '2026-11-14T06:45:00Z',
        customer: { full_name: 'Deni' },
      }),
    ).toEqual({
      id: 'order-1',
      orderNumber: 'SRP-001',
      orderType: 'dine_in',
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      status: 'completed',
      totalAmount: 27000,
      createdAt: '2026-11-14T06:45:00Z',
      customerName: 'Deni',
    });
  });

  it('mengambil halaman transaksi terbaru beserta jumlah total', async () => {
    const query = mockQuery({ data: [], count: 25, error: null });
    mockFrom.mockReturnValue(query);

    await expect(listOrders({ page: 1, pageSize: 20 })).resolves.toEqual({
      orders: [],
      total: 25,
    });
    expect(query.range).toHaveBeenCalledWith(20, 39);
  });

  it('memperbarui status hanya jika status saat ini masih cocok', async () => {
    const row = { id: 'order-1', status: 'processing', payment_status: 'pending' };
    const query = mockQuery({ data: row, error: null });
    mockFrom.mockReturnValue(query);

    await expect(updateOrderStatus('order-1', 'received', 'processing')).resolves.toEqual(row);

    expect(mockFrom).toHaveBeenCalledWith('orders');
    expect(query.update).toHaveBeenCalledWith({ status: 'processing' });
    expect(query.eq).toHaveBeenNthCalledWith(1, 'id', 'order-1');
    expect(query.eq).toHaveBeenNthCalledWith(2, 'status', 'received');
    expect(query.select).toHaveBeenCalledWith('id, status, payment_status');
  });

  it('melaporkan status yang sudah berubah jika tidak ada baris diperbarui', async () => {
    mockFrom.mockReturnValue(mockQuery({ data: null, error: null }));

    await expect(updateOrderStatus('order-1', 'received', 'processing')).rejects.toThrow(
      'Status pesanan sudah berubah. Muat ulang halaman.',
    );
  });

  it('mempertahankan pesan penolakan dari database dan merapikan galat lain', async () => {
    mockFrom.mockReturnValue(
      mockQuery({
        data: null,
        error: { message: 'Status pesanan tidak dapat diubah dari selesai.' },
      }),
    );
    await expect(updateOrderStatus('order-1', 'completed', 'ready')).rejects.toThrow(
      'Status pesanan tidak dapat diubah dari selesai.',
    );

    mockFrom.mockReturnValue(mockQuery({ data: null, error: { message: 'Network error' } }));
    await expect(updateOrderStatus('order-1', 'received', 'processing')).rejects.toThrow(
      'Gagal mengubah status. Periksa koneksi internet kamu.',
    );
  });
});
