import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CartProvider } from './CartContext.jsx';
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

describe('CartProvider', () => {
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
});

it('useCart di luar CartProvider melempar galat', () => {
  expect(() => renderHook(() => useCart())).toThrow('useCart harus dipakai di dalam CartProvider.');
});
