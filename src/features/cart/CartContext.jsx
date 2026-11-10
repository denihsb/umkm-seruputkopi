import { useCallback, useMemo, useReducer } from 'react';

import { getCartTotals, sanitizeCart } from './cartLogic.js';
import { CartContext } from './cartContext.js';
import { cartReducer } from './cartReducer.js';

export function CartProvider({ children, initialItems = [] }) {
  const [items, dispatch] = useReducer(cartReducer, initialItems, sanitizeCart);
  const totals = useMemo(() => getCartTotals(items), [items]);

  const addItemToCart = useCallback((item) => {
    dispatch({ type: 'add', item });
  }, []);
  const updateQuantity = useCallback((key, quantity) => {
    dispatch({ type: 'updateQuantity', key, quantity });
  }, []);
  const updateNote = useCallback((key, note) => {
    dispatch({ type: 'updateNote', key, note });
  }, []);
  const removeItem = useCallback((key) => {
    dispatch({ type: 'remove', key });
  }, []);
  const clearCart = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);
  const hydrate = useCallback((nextItems) => {
    dispatch({ type: 'hydrate', items: nextItems });
  }, []);

  const value = useMemo(
    () => ({
      items,
      lineCount: totals.lineCount,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      addItem: addItemToCart,
      updateQuantity,
      updateNote,
      removeItem,
      clearCart,
      hydrate,
    }),
    [addItemToCart, clearCart, hydrate, items, removeItem, totals, updateNote, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
