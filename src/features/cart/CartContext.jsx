import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { getCartTotals, sanitizeCart } from './cartLogic.js';
import { CartContext } from './cartContext.js';
import { cartReducer } from './cartReducer.js';
import { loadCart, saveCart, STORAGE_KEY } from './cartStorage.js';

function initializeCart({ initialItems }) {
  const storedItems = loadCart();
  return initialItems === undefined ? storedItems : sanitizeCart(initialItems);
}

function haveSameItems(firstItems, secondItems) {
  return JSON.stringify(firstItems) === JSON.stringify(secondItems);
}

export function CartProvider({ children, initialItems }) {
  const [items, dispatch] = useReducer(cartReducer, { initialItems }, initializeCart);
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

  useEffect(() => {
    const storedItems = loadCart();
    if (!haveSameItems(storedItems, items)) {
      saveCart(items);
    }
  }, [items]);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== STORAGE_KEY) return;

      const storedItems = loadCart();
      if (!haveSameItems(storedItems, items)) {
        hydrate(storedItems);
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [hydrate, items]);

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
