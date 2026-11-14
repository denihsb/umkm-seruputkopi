import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { formatRupiah } from '@/lib/format.js';

import { useCart } from '../cart/useCart.js';
import { placeOrder } from './orderService.js';

const ORDER_TYPE_LABELS = {
  take_away: 'Bawa pulang',
  dine_in: 'Makan di tempat',
};

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Tunai di kasir' },
  { value: 'qris_sim', label: 'QRIS (simulasi)' },
];

function QrIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="h-36 w-36 rounded-md border border-border bg-white p-2"
      fill="none"
      viewBox="0 0 128 128"
    >
      <path d="M8 8h36v36H8zM84 8h36v36H84zM8 84h36v36H8z" fill="#2b2118" />
      <path d="M16 16h20v20H16zM92 16h20v20H92zM16 92h20v20H16z" fill="white" />
      <path
        d="M56 8h12v12H56zM56 32h12v12H56zM48 56h12v12H48zM72 52h12v12H72zM96 56h12v12H96zM56 76h12v12H56zM72 72h12v12H72zM88 80h12v12H88zM48 96h12v12H48zM68 100h12v12H68zM88 104h12v12H88zM108 88h12v20h-12z"
        fill="#2b2118"
      />
    </svg>
  );
}

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const checkoutState = location.state;
  const firstPaymentMethodRef = useRef(null);
  const inFlightRef = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!checkoutState) {
      navigate('/checkout', { replace: true });
    }
  }, [checkoutState, navigate]);

  if (!checkoutState) return null;
  if (items.length === 0) {
    return <NavigateToCart />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (inFlightRef.current) return;

    if (!paymentMethod) {
      setErrorMessage('Pilih metode pembayaran.');
      firstPaymentMethodRef.current?.focus();
      return;
    }

    inFlightRef.current = true;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const { orderId, orderNumber } = await placeOrder({
        items,
        orderType: checkoutState.orderType,
        paymentMethod,
        notes: checkoutState.notes,
      });
      clearCart();
      navigate(`/pesanan/${orderId}`, { replace: true, state: { orderNumber } });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  const isUnavailableMenuError = /menu tidak tersedia/i.test(errorMessage);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Link
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline"
        to="/checkout"
      >
        Kembali
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Pembayaran</h1>

      <div className="mt-6 grid gap-6">
        <section
          aria-label="Ringkasan pesanan"
          className="rounded-xl border border-border bg-surface p-5"
        >
          <h2 className="font-serif text-xl font-semibold">Ringkasan</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-text-muted">Tipe pesanan</dt>
              <dd>{ORDER_TYPE_LABELS[checkoutState.orderType] ?? checkoutState.orderType}</dd>
            </div>
            {checkoutState.notes && (
              <div>
                <dt className="text-sm text-text-muted">Catatan</dt>
                <dd>{checkoutState.notes}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-border pt-3 font-semibold">
              <dt>Total</dt>
              <dd>{formatRupiah(subtotal)}</dd>
            </div>
          </dl>
        </section>

        <form className="rounded-xl border border-border bg-surface p-5" onSubmit={handleSubmit}>
          <fieldset>
            <legend className="text-sm font-medium">Metode pembayaran</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PAYMENT_METHODS.map(({ value, label }, index) => {
                const isSelected = paymentMethod === value;
                return (
                  <label
                    className={`flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 ${
                      isSelected
                        ? 'border-primary bg-primary-soft'
                        : 'border-border-control bg-surface'
                    }`}
                    key={value}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        checked={isSelected}
                        name="paymentMethod"
                        onChange={() => {
                          setPaymentMethod(value);
                          setErrorMessage('');
                        }}
                        ref={index === 0 ? firstPaymentMethodRef : undefined}
                        type="radio"
                        value={value}
                      />
                      {label}
                    </span>
                    {isSelected && (
                      <span aria-hidden="true" className="font-semibold text-primary">
                        ✓
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {paymentMethod === 'cash' && (
            <p className="mt-5 text-sm text-text-muted">Bayar di kasir saat mengambil pesanan.</p>
          )}

          {paymentMethod === 'qris_sim' && (
            <section
              aria-label="QRIS simulasi"
              className="mt-5 flex flex-col items-center gap-3 rounded-lg border border-border p-4 text-center"
            >
              <QrIllustration />
              <p className="font-semibold">{formatRupiah(subtotal)}</p>
              <p className="text-sm text-text-muted">QRIS simulasi, bukan pembayaran sungguhan.</p>
            </section>
          )}

          {errorMessage && (
            <div className="mt-5 text-sm text-danger-text" role="alert">
              <p>{errorMessage}</p>
              {isUnavailableMenuError && (
                <Link className="mt-2 inline-flex font-medium underline" to="/keranjang">
                  Kembali ke keranjang
                </Link>
              )}
            </div>
          )}

          <button
            className="mt-6 h-12 w-full rounded-md bg-primary px-4 font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? 'Memproses...'
              : paymentMethod === 'qris_sim'
                ? 'Saya sudah bayar'
                : 'Buat pesanan'}
          </button>
        </form>
      </div>
    </main>
  );
}

function NavigateToCart() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/keranjang', { replace: true });
  }, [navigate]);

  return null;
}
