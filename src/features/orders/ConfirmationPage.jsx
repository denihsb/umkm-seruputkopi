import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { formatRupiah } from '@/lib/format.js';
import {
  orderStatusLabels,
  orderTypeLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from '@/lib/labels.js';

import { getOrderDetail } from './api.js';
import OrderItemsList from './components/OrderItemsList.jsx';

const ORDER_STATUSES = ['received', 'processing', 'ready', 'completed'];

function LoadingState() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <section
        aria-label="Memuat pesanan"
        className="animate-pulse rounded-xl border border-border bg-surface p-5"
      >
        <div className="mx-auto h-8 w-2/3 rounded bg-border" />
        <div className="mx-auto mt-4 h-5 w-1/2 rounded bg-border" />
        <div className="mx-auto mt-8 h-14 w-3/4 rounded bg-border" />
        <div className="mt-8 h-24 rounded bg-border" />
      </section>
    </main>
  );
}

function MessageState({ children, action }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <section className="rounded-xl border border-border bg-surface p-6 text-center">
        <p role="alert">{children}</p>
        {action}
      </section>
    </main>
  );
}

function StatusTracker({ status }) {
  const currentIndex = Math.max(0, ORDER_STATUSES.indexOf(status));

  return (
    <section aria-label="Pelacak status" className="mt-8">
      <h2 className="font-serif text-xl font-semibold">Status pesanan</h2>
      <ol className="mt-4 grid grid-cols-4 gap-1">
        {ORDER_STATUSES.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li
              className={`flex flex-col items-center gap-2 text-center text-xs ${
                isCurrent ? 'font-semibold text-primary' : 'text-text-muted'
              }`}
              key={step}
              {...(isCurrent ? { 'aria-current': 'step' } : {})}
            >
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                  isComplete || isCurrent
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border-control'
                }`}
              >
                {isComplete ? '✓' : isCurrent ? '●' : index + 1}
              </span>
              {orderStatusLabels[step]}
            </li>
          );
        })}
      </ol>
      <p aria-live="polite" className="sr-only" role="status">
        Status pesanan: {orderStatusLabels[status] ?? status}
      </p>
    </section>
  );
}

export default function ConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [state, setState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const requestInFlightRef = useRef(false);
  const orderRef = useRef(null);
  const copyTimerRef = useRef(null);

  const loadOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (requestInFlightRef.current) return;
      requestInFlightRef.current = true;
      if (!silent) setState('loading');
      try {
        const detail = await getOrderDetail(id);
        orderRef.current = detail;
        setOrder(detail);
        setErrorMessage('');
        setState('ready');
      } catch (error) {
        if (!silent || !orderRef.current) {
          setErrorMessage(error.message);
          setState(error.message === 'Pesanan tidak ditemukan.' ? 'not-found' : 'error');
        }
      } finally {
        requestInFlightRef.current = false;
      }
    },
    [id],
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    let intervalId;
    const stopPolling = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };
    const startPolling = () => {
      if (!intervalId && document.visibilityState === 'visible') {
        intervalId = window.setInterval(() => loadOrder({ silent: true }), 30000);
      }
    };
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadOrder({ silent: true });
        startPolling();
      } else {
        stopPolling();
      }
    }

    if (!order || order.status === 'completed') {
      return undefined;
    }

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadOrder, order]);

  useEffect(
    () => () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    },
    [],
  );

  async function handleCopy() {
    if (!window.navigator.clipboard?.writeText) {
      setErrorMessage('Nomor pesanan tidak dapat disalin.');
      return;
    }
    try {
      await window.navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage('Nomor pesanan tidak dapat disalin.');
    }
  }

  if (state === 'loading') return <LoadingState />;
  if (state === 'not-found') {
    return (
      <MessageState
        action={
          <Link className="mt-5 inline-flex font-medium text-primary underline" to="/">
            Lihat menu
          </Link>
        }
      >
        Pesanan tidak ditemukan.
      </MessageState>
    );
  }
  if (state === 'error') {
    return (
      <MessageState
        action={
          <button
            className="mt-5 min-h-11 rounded-md bg-primary px-5 font-medium text-white hover:bg-primary-hover"
            onClick={() => loadOrder()}
            type="button"
          >
            Coba lagi
          </button>
        }
      >
        {errorMessage}
      </MessageState>
    );
  }

  const isCashPending = order.paymentMethod === 'cash' && order.paymentStatus !== 'paid';
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-8">
        <header className="text-center">
          <h1 className="font-serif text-3xl font-semibold">Pesanan diterima</h1>
          <p className="mt-2 text-text-muted">Tunjukkan nomor ini ke kasir.</p>
          <p
            className="mt-5 break-all font-serif text-4xl font-semibold text-primary"
            data-testid="order-number"
          >
            {order.orderNumber}
          </p>
          <button
            className="mt-4 min-h-11 rounded-md border border-primary px-4 font-medium text-primary hover:bg-primary-soft"
            onClick={handleCopy}
            type="button"
          >
            {copied ? 'Tersalin' : 'Salin nomor'}
          </button>
          {errorMessage && (
            <p className="mt-3 text-sm text-danger-text" role="alert">
              {errorMessage}
            </p>
          )}
        </header>

        <StatusTracker status={order.status} />

        <section className="mt-8 border-t border-border pt-6">
          <h2 className="font-serif text-xl font-semibold">Informasi pesanan</h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Metode pembayaran</dt>
              <dd>{paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Status bayar</dt>
              <dd>{paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}</dd>
            </div>
            {isCashPending && (
              <p className="rounded-md bg-primary-soft p-3 text-sm text-text-muted">
                Bayar di kasir saat mengambil pesanan.
              </p>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Tipe pesanan</dt>
              <dd>{orderTypeLabels[order.orderType] ?? order.orderType}</dd>
            </div>
            {order.notes && (
              <div>
                <dt className="text-text-muted">Catatan</dt>
                <dd className="mt-1">{order.notes}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="mt-8 border-t border-border pt-6">
          <h2 className="font-serif text-xl font-semibold">Pesananmu</h2>
          <div className="mt-4">
            <OrderItemsList items={order.items} />
          </div>
          <div className="mt-5 flex justify-between gap-4 border-t border-border pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatRupiah(order.totalAmount)}</span>
          </div>
        </section>

        <Link
          className="mt-8 flex min-h-12 items-center justify-center rounded-md bg-primary px-5 font-medium text-white hover:bg-primary-hover"
          to="/"
        >
          Lihat menu
        </Link>
      </section>
    </main>
  );
}
