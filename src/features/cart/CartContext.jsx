import { useMemo, useState } from 'react';

import {
  getCartTotals,
  removeItem as removeCartItem,
  updateQuantity as setItemQuantity,
} from './cartLogic.js';
import CartContext from './cartContext.js';

export function CartProvider({ children, initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const { itemCount, subtotal } = getCartTotals(items);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      updateQuantity: (key, quantity) =>
        setItems((currentItems) => setItemQuantity(currentItems, key, quantity)),
      removeItem: (key) => setItems((currentItems) => removeCartItem(currentItems, key)),
    }),
    [items, itemCount, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
