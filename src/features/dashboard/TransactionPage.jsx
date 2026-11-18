import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OrderStatusBadge from '@/components/OrderStatusBadge.jsx';
import { formatDateTime, formatRupiah } from '@/lib/format.js';
import { orderTypeLabels, paymentMethodLabels, paymentStatusLabels } from '@/lib/labels.js';
import { listOrders } from './api.js';

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listOrders({ page, pageSize: PAGE_SIZE, keyword: search.trim(), status, fromDate, toDate })
      .then((result) => {
        if (active) {
          setOrders(result.orders);
          setTotal(result.total);
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, search, status, fromDate, toDate]);

  function updateFilter(setter, value) {
    setter(value);
    setPage(0);
  }

  return (
    <main className="admin-main">
      <div className="admin-page-heading">
        <div>
          <span className="section-kicker">ORDER MANAGEMENT</span>
          <h1>Riwayat Transaksi</h1>
          <p>Pantau pesanan dan status pembayaran pelanggan.</p>
        </div>
        <span className="total-order-chip">{total.toLocaleString('id-ID')} transaksi</span>
      </div>
      <section className="admin-panel transaction-panel">
        <div className="transaction-filters">
          <label>
            Cari nomor pesanan
            <input
              onChange={(event) => updateFilter(setSearch, event.target.value)}
              placeholder="SRP-..."
              value={search}
            />
          </label>
          <label>
            Dari tanggal
            <input
              max={toDate || undefined}
              onChange={(event) => updateFilter(setFromDate, event.target.value)}
              type="date"
              value={fromDate}
            />
          </label>
          <label>
            Sampai tanggal
            <input
              min={fromDate || undefined}
              onChange={(event) => updateFilter(setToDate, event.target.value)}
              type="date"
              value={toDate}
            />
          </label>
          <label>
            Status pesanan
            <select
              onChange={(event) => updateFilter(setStatus, event.target.value)}
              value={status}
            >
              <option value="">Semua status</option>
              <option value="received">Diterima</option>
              <option value="processing">Diproses</option>
              <option value="ready">Siap diambil</option>
              <option value="completed">Selesai</option>
            </select>
          </label>
        </div>
        {error && (
          <div className="admin-alert" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="admin-empty">Memuat transaksi...</div>
        ) : orders.length ? (
          <div className="transaction-list">
            {orders.map((order) => (
              <Link
                className="transaction-row"
                key={order.id}
                to={`/dashboard/pesanan/${order.id}`}
              >
                <div className="transaction-primary">
                  <strong>{order.orderNumber}</strong>
                  <span>
                    {order.customerName || 'Pelanggan'} · {formatDateTime(order.createdAt)}
                  </span>
                </div>
                <div className="transaction-meta">
                  <span>{orderTypeLabels[order.orderType] ?? order.orderType}</span>
                  <span>
                    {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod} ·{' '}
                    {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                  </span>
                </div>
                <div className="transaction-end">
                  <strong>{formatRupiah(order.totalAmount)}</strong>
                  <OrderStatusBadge status={order.status} />
                  <span className="row-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="admin-empty">Tidak ada transaksi yang cocok dengan filter saat ini.</div>
        )}
        <div className="pagination-row">
          <span>
            Menampilkan {orders.length ? page * PAGE_SIZE + 1 : 0}–
            {page * PAGE_SIZE + orders.length} dari {total}
          </span>
          <div>
            <button
              disabled={page === 0 || loading}
              onClick={() => setPage((value) => value - 1)}
              type="button"
            >
              Sebelumnya
            </button>
            <button
              disabled={loading || (page + 1) * PAGE_SIZE >= total}
              onClick={() => setPage((value) => value + 1)}
              type="button"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
