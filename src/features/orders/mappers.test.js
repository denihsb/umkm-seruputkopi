import { describe, expect, it } from 'vitest';

import { mapOrderDetail } from './mappers.js';

const row = {
  id: 'order-1',
  order_number: 'S-1001',
  order_type: 'take_away',
  payment_method: 'cash',
  payment_status: 'pending',
  status: 'received',
  notes: '',
  total_amount: 30000,
  created_at: '2026-11-14T10:00:00Z',
  customer: { full_name: 'Deni' },
  order_items: [
    {
      id: 'item-2',
      menu_name: 'Kopi Susu',
      unit_price: 15000,
      quantity: 2,
      subtotal: 30000,
      order_item_variants: [
        { id: 'variant-2', group_name: 'Gula', option_name: 'Sedang', price_delta: 0 },
      ],
    },
  ],
};

describe('mapOrderDetail', () => {
  it('memetakan pesanan dengan varian dan mengurutkan item serta opsi berdasarkan id', () => {
    const result = mapOrderDetail({
      ...row,
      order_items: [
        {
          ...row.order_items[0],
          id: 'item-2',
          order_item_variants: [
            ...row.order_items[0].order_item_variants,
            { id: 'variant-1', group_name: 'Ukuran', option_name: 'Besar', price_delta: 5000 },
          ],
        },
        { ...row.order_items[0], id: 'item-1', order_item_variants: [] },
      ],
    });

    expect(result.items.map((item) => item.id)).toEqual(['item-1', 'item-2']);
    expect(result.items[1].options.map((option) => option.id)).toEqual(['variant-1', 'variant-2']);
    expect(result.customerName).toBe('Deni');
  });

  it('memetakan item tanpa varian dan nilai kosong', () => {
    const result = mapOrderDetail({
      ...row,
      customer: null,
      notes: null,
      order_items: [{ ...row.order_items[0], order_item_variants: null }],
    });

    expect(result.customerName).toBe('');
    expect(result.notes).toBeNull();
    expect(result.items[0].options).toEqual([]);
  });
});
