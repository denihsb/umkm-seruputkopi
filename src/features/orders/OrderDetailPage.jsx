import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import OrderStatusBadge from '@/components/OrderStatusBadge.jsx';
import Toast from '@/components/Toast.jsx';
import { formatDateTime, formatRupiah } from '@/lib/format.js';
import {
  orderStatusLabels,
  orderTypeLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from '@/lib/labels.js';
import { updateOrderStatus } from '@/features/dashboard/api.js';

import { getOrderDetail } from './api.js';
import OrderItemsList from './components/OrderItemsList.jsx';
import { getNextActionLabel, getNextStatus } from './statusFlow.js';

const NOT_FOUND_MESSAGE = 'Pesanan tidak ditemukan.';
const FRIENDLY_ERROR_MESSAGE = 'Gagal memuat pesanan. Silakan coba lagi.';

function PageFrame({ children, onToastDismiss, toastMessage }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <Link
        className="inline-flex min-h-11 items-center rounded-md px-2 font-medium text-primary hover:bg-primary-soft"
        to="/dashboard"
      >
        Kembali ke dashboard
      </Link>
      {children}
      <Toast message={toastMessage} onDismiss={onToastDismiss} />
    </main>
  );
}

function LoadingState({ onToastDismiss, toastMessage }) {
  return (
    <PageFrame onToastDismiss={onToastDismiss} toastMessage={toastMessage}>
      <section
        aria-label="Memuat detail pesanan"
        className="mt-4 animate-pulse rounded-xl border border-border bg-surface p-5 sm:p-8"
      >
        <div className="h-8 w-2/3 rounded bg-border" />
        <div className="mt-4 h-5 w-1/3 rounded bg-border" />
        <div className="mt-8 h-28 rounded bg-border" />
        <div className="mt-6 h-36 rounded bg-border" />
      </section>
    </PageFrame>
  );
}

function MessageState({ action, children, onToastDismiss, toastMessage }) {
  return (
    <PageFrame onToastDismiss={onToastDismiss} toastMessage={toastMessage}>
      <section className="mt-4 rounded-xl border border-border bg-surface p-6 text-center">
        <p role="alert">{children}</p>
        {action}
      </section>
    </PageFrame>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [state, setState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [statusError, setStatusError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const statusUpdateInFlightRef = useRef(false);
  const dismissToast = useCallback(() => setToastMessage(''), []);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setState('loading');
      try {
        const detail = await getOrderDetail(id);
        if (active) {
          setOrder(detail);
          setErrorMessage('');
          setState('ready');
        }
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : FRIENDLY_ERROR_MESSAGE;
          setErrorMessage(message || FRIENDLY_ERROR_MESSAGE);
          setState(message === NOT_FOUND_MESSAGE ? 'not-found' : 'error');
        }
      }
    }

    loadOrder();
    return () => {
      active = false;
    };
  }, [attempt, id]);

  async function handleStatusUpdate() {
    if (statusUpdateInFlightRef.current) return;

    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    statusUpdateInFlightRef.current = true;
    setIsUpdatingStatus(true);
    setStatusError('');

    try {
      await updateOrderStatus(order.id, order.status, nextStatus);
      setToastMessage(`Status diubah menjadi ${orderStatusLabels[nextStatus]}`);
      setState('loading');
      setAttempt((currentAttempt) => currentAttempt + 1);
    } catch (error) {
      setStatusError(
        error instanceof Error && error.message
          ? error.message
          : 'Gagal mengubah status. Periksa koneksi internet kamu.',
      );
    } finally {
      statusUpdateInFlightRef.current = false;
      setIsUpdatingStatus(false);
    }
  }

  if (state === 'loading') {
    return <LoadingState onToastDismiss={dismissToast} toastMessage={toastMessage} />;
  }

  if (state === 'not-found') {
    return (
      <MessageState onToastDismiss={dismissToast} toastMessage={toastMessage}>
        {NOT_FOUND_MESSAGE}
      </MessageState>
    );
  }

  if (state === 'error') {
    return (
      <MessageState
        action={
          <button
            className="mt-5 min-h-11 rounded-md bg-primary px-5 font-medium text-white hover:bg-primary-hover"
            onClick={() => {
              setState('loading');
              setAttempt((currentAttempt) => currentAttempt + 1);
            }}
            type="button"
          >
            Coba lagi
          </button>
        }
        onToastDismiss={dismissToast}
        toastMessage={toastMessage}
      >
        {errorMessage}
      </MessageState>
    );
  }

  const notes = order.notes?.trim();
  const actionLabel = getNextActionLabel(order.status);
  return (
    <PageFrame onToastDismiss={dismissToast} toastMessage={toastMessage}>
      <article className="mt-4 space-y-4">
        <header className="rounded-xl border border-border bg-surface p-5 sm:p-8">
          <h1 className="break-words font-serif text-2xl font-semibold sm:text-3xl">
            {order.orderNumber}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <time className="text-sm text-text-muted" dateTime={order.createdAt}>
              {formatDateTime(order.createdAt)}
            </time>
          </div>
        </header>

        <section
          aria-labelledby="order-information-heading"
          className="rounded-xl border border-border bg-surface p-5 sm:p-8"
        >
          <h2 className="font-serif text-xl font-semibold" id="order-information-heading">
            Informasi pesanan
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-sm text-text-muted">Nama pelanggan</dt>
              <dd className="break-words font-medium">{order.customerName}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-sm text-text-muted">Tipe pesanan</dt>
              <dd className="break-words">{orderTypeLabels[order.orderType] ?? order.orderType}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-sm text-text-muted">Metode bayar</dt>
              <dd className="break-words">
                {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-sm text-text-muted">Status bayar</dt>
              <dd className="break-words">
                {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
              </dd>
            </div>
          </dl>
        </section>

        {notes && (
          <section
            aria-labelledby="barista-notes-heading"
            className="rounded-xl border border-primary/20 bg-primary-soft p-5 sm:p-6"
          >
            <h2 className="font-semibold" id="barista-notes-heading">
              Catatan untuk barista
            </h2>
            <p className="mt-2 break-words">{notes}</p>
          </section>
        )}

        <section
          aria-labelledby="order-items-heading"
          className="rounded-xl border border-border bg-surface p-5 sm:p-8"
        >
          <h2 className="font-serif text-xl font-semibold" id="order-items-heading">
            Rincian pesanan
          </h2>
          <div className="mt-5">
            <OrderItemsList items={order.items} />
          </div>
          <div className="mt-5 flex justify-between gap-4 border-t border-border pt-4 text-lg font-semibold">
            <span>Total</span>
            <span className="shrink-0">{formatRupiah(order.totalAmount)}</span>
          </div>
        </section>

        <section
          aria-label="Area tombol status pesanan"
          className="min-h-20 rounded-xl border border-dashed border-border-control bg-surface/60 p-5"
        >
          {statusError && (
            <p className="mb-3 text-sm text-danger-text" role="alert">
              {statusError}
            </p>
          )}
          {order.status === 'completed' ? (
            <p className="text-center font-medium text-text-muted">Pesanan selesai</p>
          ) : (
            actionLabel && (
              <button
                className="min-h-12 w-full rounded-md bg-primary px-5 font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isUpdatingStatus}
                onClick={handleStatusUpdate}
                type="button"
              >
                {isUpdatingStatus ? 'Memproses...' : actionLabel}
              </button>
            )
          )}
        </section>
      </article>
    </PageFrame>
  );
}
