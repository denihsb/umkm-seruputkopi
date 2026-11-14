import { supabase } from '@/lib/supabaseClient.js';

const GENERIC_ORDER_ERROR = 'Pesanan gagal dibuat. Periksa koneksi internet kamu dan coba lagi.';

export function buildOrderPayload({ items, orderType, paymentMethod, notes }) {
  return {
    p_order_type: orderType,
    p_payment_method: paymentMethod,
    p_notes: notes?.trim() || null,
    p_items: items.map((item) => ({
      menu_id: item.menuId,
      quantity: item.quantity,
      option_ids: item.selectedOptions.map((option) => option.optionId),
    })),
  };
}

function isIndonesianMessage(message) {
  return /\b(tidak|belum|sudah|tersedia|pesanan|menu|jumlah|pilih|wajib|harus|gagal|melebihi|valid)\b/i.test(
    message,
  );
}

export async function placeOrder(params) {
  try {
    const { data, error } = await supabase.rpc('create_order', buildOrderPayload(params));

    if (error) {
      if (typeof error.message === 'string' && isIndonesianMessage(error.message)) {
        throw new Error(error.message);
      }
      throw new Error(GENERIC_ORDER_ERROR);
    }

    if (!data) {
      throw new Error(GENERIC_ORDER_ERROR);
    }

    return {
      orderId: data.order_id,
      orderNumber: data.order_number,
      totalAmount: data.total_amount,
    };
  } catch (error) {
    if (error instanceof Error && isIndonesianMessage(error.message)) {
      throw error;
    }
    throw new Error(GENERIC_ORDER_ERROR);
  }
}
