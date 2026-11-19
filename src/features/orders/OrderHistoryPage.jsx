import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import OrderStatusBadge from '@/components/OrderStatusBadge.jsx';
import { formatDateTime, formatRupiah } from '@/lib/format.js';

import { listCustomerOrders } from './api.js';

const PAGE_SIZE = 20;

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    listCustomerOrders({ page, pageSize: PAGE_SIZE })
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
  }, [page]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <header className="mb-6">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          Pesanan saya
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold">Riwayat Pesanan</h1>
      </header>

      {error && (
        <div className="mb-4 rounded-md bg-danger-soft p-4 text-danger-text" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-text-muted">
          Memuat riwayat pesanan...
        </div>
      ) : orders.length ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition hover:border-border-control"
              key={order.id}
              to={`/pesanan/${order.id}`}
            >
              <div>
                <strong className="block text-ink">{order.orderNumber}</strong>
                <span className="mt-1 block text-sm text-text-muted">
                  {formatDateTime(order.createdAt)}
                </span>
                <div className="mt-2">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
              <div className="text-right">
                <strong className="block text-primary">{formatRupiah(order.totalAmount)}</strong>
                <span className="mt-2 block text-sm text-primary">Detail {'\u2192'}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <section className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-text-muted">Belum ada pesanan.</p>
          <Link className="mt-4 inline-block font-medium text-primary underline" to="/">
            Jelajahi menu
          </Link>
        </section>
      )}

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            className="min-h-11 rounded-md border border-border-control px-4 disabled:opacity-50"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            type="button"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-text-muted">
            {page + 1} / {pageCount}
          </span>
          <button
            className="min-h-11 rounded-md border border-border-control px-4 disabled:opacity-50"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            Berikutnya
          </button>
        </div>
      )}
    </main>
  );
}
