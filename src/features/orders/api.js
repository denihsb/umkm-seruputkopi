import { supabase } from '@/lib/supabaseClient.js';

import { mapOrderDetail } from './mappers.js';

const NOT_FOUND_ERROR = 'Pesanan tidak ditemukan.';
const FRIENDLY_ERROR = 'Gagal memuat pesanan. Periksa koneksi internet kamu.';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getOrderDetail(id) {
  if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
    throw new Error(NOT_FOUND_ERROR);
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, order_number, order_type, payment_method, payment_status, status, notes, total_amount, created_at, customer:profiles(full_name), order_items(id, menu_name, unit_price, quantity, subtotal, order_item_variants(id, group_name, option_name, price_delta))',
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(NOT_FOUND_ERROR);

    return mapOrderDetail(data);
  } catch (error) {
    if (error instanceof Error && error.message === NOT_FOUND_ERROR) {
      throw error;
    }
    throw new Error(FRIENDLY_ERROR);
  }
}
