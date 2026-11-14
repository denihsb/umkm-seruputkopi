import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRpc } = vi.hoisted(() => ({ mockRpc: vi.fn() }));

vi.mock('@/lib/supabaseClient.js', () => ({
  supabase: { rpc: mockRpc },
}));

import { buildOrderPayload, placeOrder } from './orderService.js';

const item = {
  menuId: 12,
  quantity: 2,
  unitPrice: 27000,
  selectedOptions: [{ optionId: 4 }, { optionId: 7 }],
};

describe('orderService', () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it('membangun payload tanpa harga, dengan opsi terpilih dan catatan null saat kosong', () => {
    const payload = buildOrderPayload({
      items: [item],
      orderType: 'take_away',
      paymentMethod: 'cash',
      notes: '  ',
    });

    expect(payload).toEqual({
      p_order_type: 'take_away',
      p_payment_method: 'cash',
      p_notes: null,
      p_items: [{ menu_id: 12, quantity: 2, option_ids: [4, 7] }],
    });
    expect(JSON.stringify(payload)).not.toContain('price');
  });

  it('memanggil RPC dan memetakan data pesanan', async () => {
    mockRpc.mockResolvedValue({
      data: { order_id: 'order-1', order_number: 'S-1001', total_amount: 54000 },
      error: null,
    });

    await expect(
      placeOrder({
        items: [item],
        orderType: 'take_away',
        paymentMethod: 'cash',
        notes: '',
      }),
    ).resolves.toEqual({
      orderId: 'order-1',
      orderNumber: 'S-1001',
      totalAmount: 54000,
    });
    expect(mockRpc).toHaveBeenCalledWith(
      'create_order',
      expect.objectContaining({ p_payment_method: 'cash' }),
    );
  });

  it('mempertahankan pesan galat berbahasa Indonesia dari server', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'Menu tidak tersedia.' },
    });

    await expect(
      placeOrder({
        items: [item],
        orderType: 'take_away',
        paymentMethod: 'cash',
        notes: '',
      }),
    ).rejects.toThrow('Menu tidak tersedia.');
  });

  it('mengubah galat jaringan menjadi pesan umum', async () => {
    mockRpc.mockRejectedValue(new Error('Failed to fetch'));

    await expect(
      placeOrder({
        items: [item],
        orderType: 'take_away',
        paymentMethod: 'cash',
        notes: '',
      }),
    ).rejects.toThrow('Pesanan gagal dibuat. Periksa koneksi internet kamu dan coba lagi.');
  });
});
