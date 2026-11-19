import { supabase } from '@/lib/supabaseClient.js';

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function toLocalDateKey(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getDashboardOverview(period = '7days') {
  const now = new Date();
  let startDate = null;
  if (period === 'today') startDate = startOfDay(now);
  if (period === '7days') {
    startDate = startOfDay(now);
    startDate.setDate(startDate.getDate() - 6);
  }

  let orderQuery = supabase
    .from('orders')
    .select(
      'id, order_number, total_amount, payment_status, status, created_at, customer:profiles(full_name)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });
  let itemsQuery = supabase
    .from('order_items')
    .select('menu_name, quantity, subtotal, orders!inner(created_at)');
  const chartStart = startOfDay(now);
  chartStart.setDate(chartStart.getDate() - 6);
  const chartOrdersQuery = supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', chartStart.toISOString())
    .order('created_at', { ascending: false });
  if (startDate) {
    const since = startDate.toISOString();
    orderQuery = orderQuery.gte('created_at', since);
    itemsQuery = itemsQuery.gte('orders.created_at', since);
  }

  const [
    { data: orders, error: ordersError, count },
    { data: items, error: itemsError },
    { data: chartOrders, error: chartError },
  ] = await Promise.all([
    orderQuery.limit(5000),
    itemsQuery.limit(10000),
    chartOrdersQuery.limit(5000),
  ]);
  if (ordersError || itemsError || chartError)
    throw new Error('Data dashboard belum dapat dimuat. Periksa koneksi atau akses akun pemilik.');

  const safeOrders = orders ?? [];
  const safeItems = items ?? [];
  const safeChartOrders = chartOrders ?? [];
  const revenue = safeOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const unpaid = safeOrders
    .filter((order) => order.payment_status === 'pending')
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const productMap = new Map();
  for (const item of safeItems) {
    const current = productMap.get(item.menu_name) ?? {
      name: item.menu_name,
      quantity: 0,
      revenue: 0,
    };
    current.quantity += Number(item.quantity || 0);
    current.revenue += Number(item.subtotal || 0);
    productMap.set(item.menu_name, current);
  }

  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const day = startOfDay(now);
    day.setDate(day.getDate() - (6 - index));
    const key = toLocalDateKey(day);
    const dayOrders = safeChartOrders.filter((order) => toLocalDateKey(order.created_at) === key);
    return {
      label: day.toLocaleDateString('id-ID', { weekday: 'short' }),
      date: key,
      revenue: dayOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
    };
  });

  return {
    totalOrders: count ?? safeOrders.length,
    revenue,
    average: safeOrders.length ? Math.round(revenue / safeOrders.length) : 0,
    unpaid,
    recentOrders: safeOrders.slice(0, 5).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer?.full_name ?? 'Pelanggan',
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
    })),
    topProducts: [...productMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 3),
    chartDays,
    periodLabel:
      period === 'today' ? 'Hari ini' : period === 'all' ? 'Semua waktu' : '7 hari terakhir',
  };
}
