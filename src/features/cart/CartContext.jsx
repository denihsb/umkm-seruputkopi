import { useCallback, useMemo, useState } from 'react';

import {
  addItem as addCartItem,
  clearCart as emptyCart,
  getCartTotals,
  removeItem as removeCartItem,
  sanitizeCart,
  updateNote as setCartNote,
  updateQuantity as setCartQuantity,
} from './cartLogic.js';
import CartContext from './cartContext.js';

export function CartProvider({ children, initialItems = [] }) {
  const [items, setItems] = useState(() => sanitizeCart(initialItems));
  const totals = useMemo(() => getCartTotals(items), [items]);

  const addItem = useCallback((item) => {
    setItems((currentItems) => addCartItem(currentItems, item));
  }, []);
  const updateQuantity = useCallback((key, quantity) => {
    setItems((currentItems) => setCartQuantity(currentItems, key, quantity));
  }, []);
  const updateNote = useCallback((key, note) => {
    setItems((currentItems) => setCartNote(currentItems, key, note));
  }, []);
  const removeItem = useCallback((key) => {
    setItems((currentItems) => removeCartItem(currentItems, key));
  }, []);
  const clearCart = useCallback(() => {
    setItems(emptyCart);
  }, []);
  const hydrate = useCallback((nextItems) => {
    setItems(sanitizeCart(nextItems));
  }, []);

  const value = useMemo(
    () => ({
      items,
      lineCount: totals.lineCount,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      addItem,
      updateQuantity,
      updateNote,
      removeItem,
      clearCart,
      hydrate,
    }),
    [addItem, clearCart, hydrate, items, removeItem, totals, updateNote, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
