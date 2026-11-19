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

export async function listCustomerOrders({ page = 0, pageSize = 20 } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const userId = userData?.user?.id;
    if (!userId) throw new Error('Sesi pengguna tidak ditemukan.');

    const { data, error, count } = await supabase
      .from('orders')
      .select(
        'id, order_number, order_type, payment_method, payment_status, status, total_amount, created_at',
        { count: 'exact' },
      )
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      orders: (data ?? []).map((row) => ({
        id: row.id,
        orderNumber: row.order_number,
        orderType: row.order_type,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        status: row.status,
        totalAmount: row.total_amount,
        createdAt: row.created_at,
      })),
      total: count ?? 0,
    };
  } catch {
    throw new Error(FRIENDLY_ERROR);
  }
}
