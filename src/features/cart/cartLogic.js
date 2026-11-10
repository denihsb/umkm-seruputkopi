export const MIN_QTY = 1;
export const MAX_QTY = 20;

const MAX_NOTE_LENGTH = 200;

export function getLineSubtotal(item) {
  return item.unitPrice * item.quantity;
}

export function getCartTotals(items) {
  return items.reduce(
    (totals, item) => ({
      lineCount: totals.lineCount + 1,
      itemCount: totals.itemCount + item.quantity,
      subtotal: totals.subtotal + getLineSubtotal(item),
    }),
    { lineCount: 0, itemCount: 0, subtotal: 0 },
  );
}

export function addItem(items, newItem) {
  const existingIndex = items.findIndex((item) => item.key === newItem.key);

  if (existingIndex === -1) {
    return [...items, { ...newItem, selectedOptions: [...newItem.selectedOptions] }];
  }

  return items.map((item, index) => {
    if (index !== existingIndex) return item;

    return {
      ...item,
      quantity: Math.min(MAX_QTY, item.quantity + newItem.quantity),
      note: newItem.note.trim() ? newItem.note : item.note,
    };
  });
}

export function updateQuantity(items, key, quantity) {
  const roundedQuantity = Math.min(MAX_QTY, Math.max(MIN_QTY, Math.round(quantity)));

  return items.map((item) => (item.key === key ? { ...item, quantity: roundedQuantity } : item));
}

export function updateNote(items, key, note) {
  const updatedNote = note.trim().slice(0, MAX_NOTE_LENGTH);

  return items.map((item) => (item.key === key ? { ...item, note: updatedNote } : item));
}

export function removeItem(items, key) {
  return items.filter((item) => item.key !== key);
}

export function clearCart() {
  return [];
}

function isValidSelectedOption(option) {
  return (
    option !== null &&
    typeof option === 'object' &&
    Number.isInteger(option.groupId) &&
    typeof option.groupName === 'string' &&
    Number.isInteger(option.optionId) &&
    typeof option.optionName === 'string' &&
    Number.isInteger(option.priceDelta) &&
    option.priceDelta >= 0
  );
}

export function isValidCartItem(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof item.key === 'string' &&
    item.key.trim().length > 0 &&
    Number.isInteger(item.menuId) &&
    typeof item.menuName === 'string' &&
    Number.isInteger(item.basePrice) &&
    item.basePrice >= 0 &&
    Number.isInteger(item.unitPrice) &&
    item.unitPrice >= 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity >= MIN_QTY &&
    item.quantity <= MAX_QTY &&
    typeof item.note === 'string' &&
    Array.isArray(item.selectedOptions) &&
    item.selectedOptions.every(isValidSelectedOption)
  );
}

export function sanitizeCart(rawItems) {
  if (!Array.isArray(rawItems)) return [];

  return rawItems.reduce((items, rawItem) => {
    if (
      !isValidCartItem({
        ...rawItem,
        quantity: MIN_QTY,
      }) ||
      !Number.isInteger(rawItem.quantity)
    ) {
      return items;
    }

    const selectedOptions = rawItem.selectedOptions.map((option) => ({ ...option }));
    const unitPrice =
      rawItem.basePrice + selectedOptions.reduce((total, option) => total + option.priceDelta, 0);
    const sanitizedItem = {
      ...rawItem,
      unitPrice,
      quantity: Math.min(MAX_QTY, Math.max(MIN_QTY, rawItem.quantity)),
      selectedOptions,
    };
    const existingIndex = items.findIndex((item) => item.key === sanitizedItem.key);

    if (existingIndex === -1) return [...items, sanitizedItem];

    return items.map((item, index) =>
      index === existingIndex
        ? { ...item, quantity: Math.min(MAX_QTY, item.quantity + sanitizedItem.quantity) }
        : item,
    );
  }, []);
}
