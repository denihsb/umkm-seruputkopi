import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CartProvider } from './CartContext.jsx';
import { loadCart, STORAGE_KEY, STORAGE_VERSION } from './cartStorage.js';
import { useCart } from './useCart.js';

const item = {
  key: '1:2',
  menuId: 1,
  menuName: 'Kopi',
  basePrice: 10000,
  unitPrice: 12000,
  quantity: 2,
  note: '',
  selectedOptions: [
    { groupId: 1, groupName: 'Ukuran', optionId: 2, optionName: 'Besar', priceDelta: 2000 },
  ],
};

function wrapper({ children }) {
  return <CartProvider initialItems={[item]}>{children}</CartProvider>;
}

function emptyWrapper({ children }) {
  return <CartProvider>{children}</CartProvider>;
}

describe('CartProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('menambah baris, menggabungkan key yang sama, membatasi 20, dan menghitung totals', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem({ ...item, key: '2:3', quantity: 3 }));
    act(() => result.current.addItem({ ...item, quantity: 30 }));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].quantity).toBe(20);
    expect(result.current).toMatchObject({ lineCount: 2, itemCount: 23, subtotal: 276000 });
  });

  it('mengubah quantity, menghapus, mengosongkan, dan hydrate isi keranjang', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.updateQuantity(item.key, 5));
    expect(result.current.items[0].quantity).toBe(5);

    act(() => result.current.removeItem(item.key));
    expect(result.current.items).toEqual([]);

    act(() => result.current.hydrate([item]));
    expect(result.current.items).toHaveLength(1);

    act(() => result.current.clearCart());
    expect(result.current.items).toEqual([]);
  });

  it('memulihkan isi tersimpan saat dipasang', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, items: [item] }),
    );

    const { result } = renderHook(() => useCart(), { wrapper: emptyWrapper });

    expect(result.current.items).toEqual([item]);
  });

  it('menyimpan setelah tambah, ubah jumlah, hapus, dan kosongkan', () => {
    const { result } = renderHook(() => useCart(), { wrapper: emptyWrapper });
    const otherItem = { ...item, key: 'teh|regular', menuName: 'Teh' };

    act(() => result.current.addItem(item));
    expect(loadCart()).toEqual([item]);

    act(() => result.current.updateQuantity(item.key, 4));
    expect(loadCart()).toMatchObject([{ key: item.key, quantity: 4 }]);

    act(() => result.current.addItem(otherItem));
    act(() => result.current.removeItem(item.key));
    expect(loadCart()).toEqual([otherItem]);

    act(() => result.current.clearCart());
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('menyinkronkan perubahan dari tab lain', () => {
    const { result } = renderHook(() => useCart(), { wrapper: emptyWrapper });
    const externalItem = { ...item, quantity: 5 };
    const externalData = JSON.stringify({ version: STORAGE_VERSION, items: [externalItem] });
    window.localStorage.setItem(STORAGE_KEY, externalData);

    act(() => {
      window.dispatchEvent(
        new window.StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: externalData,
          storageArea: window.localStorage,
        }),
      );
    });

    expect(result.current.items).toEqual([externalItem]);
  });

  it('mengosongkan keranjang jika data tersimpan rusak', () => {
    window.localStorage.setItem(STORAGE_KEY, 'bukan JSON');

    const { result } = renderHook(() => useCart(), { wrapper: emptyWrapper });

    expect(result.current.items).toEqual([]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('tidak menulis ulang isi yang sama atau membuat perulangan penyimpanan', () => {
    const serialized = JSON.stringify({ version: STORAGE_VERSION, items: [item] });
    window.localStorage.setItem(STORAGE_KEY, serialized);
    const setItemSpy = vi.spyOn(window.Storage.prototype, 'setItem');
    const { result } = renderHook(() => useCart(), { wrapper: emptyWrapper });

    expect(setItemSpy).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(
        new window.StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: serialized,
          storageArea: window.localStorage,
        }),
      );
    });
    expect(setItemSpy).not.toHaveBeenCalled();

    act(() => result.current.updateQuantity(item.key, 3));
    expect(setItemSpy).toHaveBeenCalledTimes(1);
  });
});

it('useCart di luar CartProvider melempar galat', () => {
  expect(() => renderHook(() => useCart())).toThrow('useCart harus dipakai di dalam CartProvider.');
});
