import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listOrders, mapOrderRow } from './api.js';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: mockFrom },
}));

function mockQuery(result) {
  const query = {
    select: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => Promise.resolve(result)),
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
});
