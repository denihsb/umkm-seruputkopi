import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearStoredCart,
  loadCart,
  saveCart,
  STORAGE_KEY,
  STORAGE_VERSION,
} from './cartStorage.js';

const item = {
  key: 'kopi|besar',
  menuId: 1,
  menuName: 'Kopi Susu',
  basePrice: 10000,
  unitPrice: 12000,
  quantity: 2,
  note: '',
  selectedOptions: [
    { groupId: 1, groupName: 'Ukuran', optionId: 2, optionName: 'Besar', priceDelta: 2000 },
  ],
};

describe('cartStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('menyimpan lalu memuat kembali isi keranjang', () => {
    expect(saveCart([item])).toBe(true);

    const storedData = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(storedData.version).toBe(STORAGE_VERSION);
    expect(Number.isNaN(Date.parse(storedData.savedAt))).toBe(false);
    expect(loadCart()).toEqual([item]);
  });

  it('menghapus kunci saat menyimpan keranjang kosong', () => {
    saveCart([item]);

    expect(saveCart([])).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('menghapus data dengan JSON rusak', () => {
    window.localStorage.setItem(STORAGE_KEY, '{');

    expect(loadCart()).toEqual([]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('menghapus data dengan versi yang tidak cocok', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION + 1, items: [item] }),
    );

    expect(loadCart()).toEqual([]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('menghapus data yang bukan objek', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([item]));

    expect(loadCart()).toEqual([]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('menghitung ulang harga dan membatasi quantity saat memuat', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items: [
          { ...item, unitPrice: 1, quantity: 25 },
          { ...item, key: 'kopi|regular', unitPrice: 1, quantity: 0 },
        ],
      }),
    );

    expect(loadCart()).toMatchObject([
      { key: item.key, unitPrice: 12000, quantity: 20 },
      { key: 'kopi|regular', unitPrice: 12000, quantity: 1 },
    ]);
  });

  it('menangani galat localStorage tanpa melempar', () => {
    vi.spyOn(window.Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Penyimpanan tidak tersedia');
    });
    vi.spyOn(window.Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Kuota penyimpanan penuh');
    });

    expect(loadCart()).toEqual([]);
    expect(saveCart([item])).toBe(false);
  });

  it('menghapus kunci yang tersisa dengan aman', () => {
    window.localStorage.setItem(STORAGE_KEY, 'data');

    expect(clearStoredCart()).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
