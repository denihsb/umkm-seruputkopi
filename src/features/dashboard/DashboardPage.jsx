import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import OrderStatusBadge from '@/components/OrderStatusBadge.jsx';
import { formatDateTime, formatRupiah } from '@/lib/format.js';
import { orderTypeLabels, paymentMethodLabels, paymentStatusLabels } from '@/lib/labels.js';

import { listOrders } from './api.js';

const PAGE_SIZE = 20;

function OrderSkeleton() {
  return (
    <div
      aria-label="Memuat transaksi"
      className="h-48 animate-pulse rounded-xl border border-border bg-surface"
    />
  );
}

function OrderCard({ order }) {
  return (
    <Link
      className="block rounded-xl border border-border bg-surface p-4 text-xs transition-colors hover:border-primary"
      to={`/dashboard/pesanan/${order.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <strong className="text-sm text-text">{order.orderNumber}</strong>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-text-muted">{formatDateTime(order.createdAt)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
        <div>
          <dt className="text-text-muted">Pelanggan</dt>
          <dd className="mt-0.5 text-text">{order.customerName || '-'}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Tipe pesanan</dt>
          <dd className="mt-0.5 text-text">
            {orderTypeLabels[order.orderType] ?? order.orderType}
          </dd>
        </div>
        <div>
          <dt className="text-text-muted">Metode bayar</dt>
          <dd className="mt-0.5 text-text">
            {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
          </dd>
        </div>
        <div>
          <dt className="text-text-muted">Status bayar</dt>
          <dd className="mt-0.5 text-text">
            {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-base font-semibold text-primary">{formatRupiah(order.totalAmount)}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);
  const pageRef = useRef(0);

  async function loadPage(page, append) {
    const requestId = ++requestIdRef.current;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');

    try {
      const result = await listOrders({ page, pageSize: PAGE_SIZE });
      if (requestId !== requestIdRef.current) return;
      setOrders((current) => (append ? [...current, ...result.orders] : result.orders));
      setTotal(result.total);
      pageRef.current = page;
    } catch (loadError) {
      if (requestId === requestIdRef.current) setError(loadError.message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  useEffect(() => {
    loadPage(0, false);
  }, []);

  const hasMore = orders.length < total;
  const showInitialError = Boolean(error) && orders.length === 0;

  return (
    <main className="min-h-screen bg-page px-4 py-8">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">Riwayat transaksi</p>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        ) : showInitialError ? (
          <div className="mt-6 rounded-xl border border-border bg-surface p-6 text-sm">
            <p role="alert">{error}</p>
            <button
              className="mt-4 min-h-11 rounded-md border border-primary px-4 font-medium text-primary hover:bg-primary-soft"
              type="button"
              onClick={() => loadPage(0, false)}
            >
              Coba lagi
            </button>
          </div>
        ) : orders.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-surface p-6 text-center text-sm text-text-muted">
            Belum ada transaksi.
          </p>
        ) : (
          <>
            <p aria-live="polite" className="mt-6 text-xs text-text-muted" role="status">
              Menampilkan {orders.length} dari {total} transaksi
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {error && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 text-sm">
                <p role="alert">{error}</p>
                <button
                  className="min-h-11 rounded-md border border-primary px-4 font-medium text-primary hover:bg-primary-soft"
                  type="button"
                  onClick={() => loadPage(pageRef.current + 1, true)}
                >
                  Coba lagi
                </button>
              </div>
            )}
            {hasMore && !error && (
              <button
                className="mt-6 min-h-11 rounded-md border border-primary px-4 text-sm font-medium text-primary hover:bg-primary-soft disabled:opacity-60"
                disabled={loadingMore}
                type="button"
                onClick={() => loadPage(pageRef.current + 1, true)}
              >
                {loadingMore ? 'Memuat...' : 'Muat lagi'}
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
