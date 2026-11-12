import { sanitizeCart } from './cartLogic.js';

export const STORAGE_KEY = 'seruput.cart.v1';
export const STORAGE_VERSION = 1;

export function clearStoredCart() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function loadCart() {
  let serialized;

  try {
    serialized = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return [];
  }

  if (!serialized) {
    clearStoredCart();
    return [];
  }

  let data;
  try {
    data = JSON.parse(serialized);
  } catch {
    clearStoredCart();
    return [];
  }

  if (
    data === null ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    data.version !== STORAGE_VERSION ||
    !Array.isArray(data.items)
  ) {
    clearStoredCart();
    return [];
  }

  return sanitizeCart(data.items);
}

export function saveCart(items) {
  try {
    if (Array.isArray(items) && items.length === 0) {
      return clearStoredCart();
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        items,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
