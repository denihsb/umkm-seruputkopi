function byId(first, second) {
  return String(first.id).localeCompare(String(second.id));
}

export function mapOrderDetail(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    orderType: row.order_type,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    notes: row.notes,
    totalAmount: row.total_amount,
    createdAt: row.created_at,
    customerName: row.customer?.full_name ?? '',
    items: [...(row.order_items ?? [])].sort(byId).map((item) => ({
      id: item.id,
      menuName: item.menu_name,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
      options: [...(item.order_item_variants ?? [])].sort(byId).map((option) => ({
        id: option.id,
        groupName: option.group_name,
        optionName: option.option_name,
        priceDelta: option.price_delta,
      })),
    })),
  };
}
