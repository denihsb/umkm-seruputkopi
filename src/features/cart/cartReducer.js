import {
  addItem,
  clearCart as clearCartItems,
  removeItem as removeCartItem,
  sanitizeCart,
  updateNote as updateCartNote,
  updateQuantity as updateCartQuantity,
} from './cartLogic.js';

export function cartReducer(items, action) {
  switch (action.type) {
    case 'add':
      return addItem(items, action.item);
    case 'updateQuantity':
      return updateCartQuantity(items, action.key, action.quantity);
    case 'updateNote':
      return updateCartNote(items, action.key, action.note);
    case 'remove':
      return removeCartItem(items, action.key);
    case 'clear':
      return clearCartItems(items);
    case 'hydrate':
      return sanitizeCart(action.items);
    default:
      return items;
  }
}
