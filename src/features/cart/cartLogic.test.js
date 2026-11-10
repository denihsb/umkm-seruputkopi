import { describe, expect, it } from 'vitest';

import {
  addItem,
  clearCart,
  getCartTotals,
  getLineSubtotal,
  isValidCartItem,
  removeItem,
  sanitizeCart,
  updateNote,
  updateQuantity,
} from './cartLogic.js';

const createItem = (overrides = {}) => ({
  key: 'kopi|panas',
  menuId: 1,
  menuName: 'Kopi',
  basePrice: 25000,
  unitPrice: 27000,
  quantity: 2,
  note: '',
  selectedOptions: [
    {
      groupId: 1,
      groupName: 'Suhu',
      optionId: 2,
      optionName: 'Panas',
      priceDelta: 2000,
    },
  ],
  ...overrides,
});

describe('getLineSubtotal', () => {
  it('mengalikan harga satuan dengan quantity', () => {
    expect(getLineSubtotal(createItem())).toBe(54000);
  });
});

describe('getCartTotals', () => {
  it('menghitung subtotal, jumlah item, dan jumlah baris', () => {
    expect(
      getCartTotals([
        createItem({ unitPrice: 27000, quantity: 2 }),
        createItem({ key: 'teh', unitPrice: 15000, quantity: 1 }),
      ]),
    ).toEqual({ lineCount: 2, itemCount: 3, subtotal: 69000 });
  });

  it('mengembalikan total nol untuk keranjang kosong', () => {
    expect(getCartTotals([])).toEqual({ lineCount: 0, itemCount: 0, subtotal: 0 });
  });
});

describe('addItem', () => {
  it('menambahkan baris baru di akhir tanpa mengubah array asli', () => {
    const items = [createItem()];
    const newItem = createItem({ key: 'teh', menuName: 'Teh', selectedOptions: [] });
    const result = addItem(items, newItem);

    expect(result).toHaveLength(2);
    expect(result[1]).toEqual(newItem);
    expect(result).not.toBe(items);
    expect(items).toHaveLength(1);
  });

  it('menggabungkan quantity untuk key yang sama dan mempertahankan note lama bila note baru kosong', () => {
    const items = [createItem({ quantity: 2, note: 'Less ice' })];
    const result = addItem(items, createItem({ quantity: 3, note: '  ', selectedOptions: [] }));

    expect(result).toEqual([createItem({ quantity: 5, note: 'Less ice' })]);
    expect(items[0].quantity).toBe(2);
  });

  it('mengganti note lama dengan note baru yang tidak kosong', () => {
    const result = addItem([createItem({ note: 'Less ice' })], createItem({ note: 'Extra hot' }));

    expect(result[0].note).toBe('Extra hot');
  });

  it('membatasi quantity gabungan ke 20', () => {
    const result = addItem([createItem({ quantity: 18 })], createItem({ quantity: 5 }));

    expect(result[0].quantity).toBe(20);
  });

  it('menyimpan key berbeda sebagai baris terpisah', () => {
    const result = addItem([createItem()], createItem({ key: 'teh', selectedOptions: [] }));

    expect(result).toHaveLength(2);
  });
});

describe('updateQuantity', () => {
  it('membatasi quantity ke batas bawah dan atas serta membulatkan nilai desimal', () => {
    const items = [createItem()];

    expect(updateQuantity(items, items[0].key, 0)[0].quantity).toBe(1);
    expect(updateQuantity(items, items[0].key, 25)[0].quantity).toBe(20);
    expect(updateQuantity(items, items[0].key, 3.6)[0].quantity).toBe(4);
    expect(items[0].quantity).toBe(2);
  });

  it('membiarkan isi array tidak berubah jika key tidak ditemukan', () => {
    const items = [createItem()];

    expect(updateQuantity(items, 'not-found', 4)).toEqual(items);
  });
});

describe('updateNote', () => {
  it('memangkas spasi ujung dan membatasi note sampai 200 karakter', () => {
    const items = [createItem()];
    const trimmed = updateNote(items, items[0].key, '  Less sugar  ');
    const limited = updateNote(items, items[0].key, 'x'.repeat(250));

    expect(trimmed[0].note).toBe('Less sugar');
    expect(limited[0].note).toHaveLength(200);
    expect(items[0].note).toBe('');
  });
});

describe('removeItem and clearCart', () => {
  it('menghapus baris dengan key yang diminta', () => {
    expect(removeItem([createItem(), createItem({ key: 'teh' })], 'kopi|panas')).toEqual([
      createItem({ key: 'teh' }),
    ]);
  });

  it('mengembalikan array kosong', () => {
    expect(clearCart()).toEqual([]);
  });
});

describe('isValidCartItem', () => {
  it('menerima item yang sesuai kontrak', () => {
    expect(isValidCartItem(createItem())).toBe(true);
  });

  it.each([
    [
      'field menuName hilang',
      (item) => {
        const invalidItem = { ...item };
        delete invalidItem.menuName;
        return invalidItem;
      },
    ],
    ['quantity di bawah rentang', (item) => ({ ...item, quantity: 0 })],
    ['quantity di atas rentang', (item) => ({ ...item, quantity: 21 })],
    ['basePrice negatif', (item) => ({ ...item, basePrice: -1 })],
    ['unitPrice negatif', (item) => ({ ...item, unitPrice: -1 })],
    [
      'opsi tidak lengkap',
      (item) => ({ ...item, selectedOptions: [{ groupId: 1, groupName: 'Suhu' }] }),
    ],
  ])('menolak %s', (_description, makeInvalid) => {
    expect(isValidCartItem(makeInvalid(createItem()))).toBe(false);
  });
});

describe('sanitizeCart', () => {
  it('mengembalikan array kosong jika input bukan array', () => {
    expect(sanitizeCart(null)).toEqual([]);
  });

  it('membuang baris rusak', () => {
    expect(sanitizeCart([createItem(), { key: 'rusak' }])).toHaveLength(1);
  });

  it('menghitung ulang unitPrice dari basePrice dan pilihan', () => {
    expect(sanitizeCart([createItem({ unitPrice: 999999 })])[0].unitPrice).toBe(27000);
  });

  it('menggabungkan key ganda dan membatasi quantity hingga 20', () => {
    const result = sanitizeCart([
      createItem({ quantity: 18 }),
      createItem({ quantity: 5, unitPrice: 999999 }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(20);
  });

  it('membatasi quantity pulih ke batas bawah yang sah', () => {
    expect(sanitizeCart([createItem({ quantity: 0 })])[0].quantity).toBe(1);
  });
});
