import { supabase } from '@/lib/supabaseClient';

const FRIENDLY_ERROR = 'Gagal memuat transaksi. Periksa koneksi internet kamu.';
const STATUS_CHANGED_ERROR = 'Status pesanan sudah berubah. Muat ulang halaman.';
const STATUS_REJECTION_PREFIX = 'Status pesanan tidak dapat diubah';
const UPDATE_FRIENDLY_ERROR = 'Gagal mengubah status. Periksa koneksi internet kamu.';

export function mapOrderRow(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    orderType: row.order_type,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    totalAmount: row.total_amount,
    createdAt: row.created_at,
    customerName: row.customer?.full_name ?? '',
  };
}

export async function listOrders({ page = 0, pageSize = 20 } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, error, count } = await supabase
      .from('orders')
      .select(
        'id, order_number, order_type, payment_method, payment_status, status, total_amount, created_at, customer:profiles(full_name)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { orders: (data ?? []).map(mapOrderRow), total: count ?? 0 };
  } catch {
    throw new Error(FRIENDLY_ERROR);
  }
}

export async function updateOrderStatus(id, currentStatus, nextStatus) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', id)
      .eq('status', currentStatus)
      .select('id, status, payment_status')
      .maybeSingle();

    if (error) {
      if (error.message?.startsWith(STATUS_REJECTION_PREFIX)) {
        throw new Error(error.message);
      }
      throw error;
    }

    if (!data) {
      throw new Error(STATUS_CHANGED_ERROR);
    }

    return data;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === STATUS_CHANGED_ERROR || error.message.startsWith(STATUS_REJECTION_PREFIX))
    ) {
      throw error;
    }
    throw new Error(UPDATE_FRIENDLY_ERROR);
  }
}
