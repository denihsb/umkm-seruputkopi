import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { formatRupiah } from '@/lib/format.js';
import { validateCheckoutForm } from '@/lib/validators.js';

import { formatOptionsSummary } from '../cart/summary.js';
import { useCart } from '../cart/useCart.js';
import { useAuth } from '../auth/useAuth.js';

export default function CheckoutPage() {
  const { profile } = useAuth();
  const { items, itemCount, subtotal } = useCart();
  const navigate = useNavigate();
  const orderTypeRef = useRef(null);
  const notesRef = useRef(null);
  const [orderType, setOrderType] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({ orderType: '', notes: '' });

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateCheckoutForm({ orderType, notes });
    setErrors(nextErrors);

    const firstInvalidField = nextErrors.orderType
      ? orderTypeRef.current
      : nextErrors.notes
        ? notesRef.current
        : null;
    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    navigate('/checkout/pembayaran', { state: { orderType, notes: notes.trim() } });
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <section className="mx-auto max-w-lg rounded-xl border border-border bg-surface px-6 py-10 text-center">
          <h1 className="font-serif text-3xl font-semibold">Keranjang kosong</h1>
          <Link
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 font-medium text-white hover:bg-primary-hover"
            to="/"
          >
            Lihat menu
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Link
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline"
        to="/keranjang"
      >
        Kembali
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Checkout</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
        <form
          className="rounded-xl border border-border bg-surface p-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="font-serif text-xl font-semibold">Detail pesanan</h2>
          <p className="mt-3 text-sm text-text-muted">Pesanan atas nama {profile?.full_name}</p>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium">Tipe pesanan</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {[
                ['take_away', 'Bawa pulang'],
                ['dine_in', 'Makan di tempat'],
              ].map(([value, label]) => (
                <label
                  className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-md border px-3 ${
                    orderType === value ? 'border-primary bg-primary-soft' : 'border-border-control'
                  }`}
                  key={value}
                >
                  <input
                    checked={orderType === value}
                    name="orderType"
                    onChange={(event) => {
                      setOrderType(event.target.value);
                      setErrors((current) => ({ ...current, orderType: '' }));
                    }}
                    ref={value === 'take_away' ? orderTypeRef : undefined}
                    type="radio"
                    value={value}
                  />
                  {label}
                </label>
              ))}
            </div>
            {errors.orderType && (
              <p className="mt-2 text-sm text-danger-text" role="alert">
                {errors.orderType}
              </p>
            )}
          </fieldset>

          <div className="mt-6">
            <label className="text-sm font-medium" htmlFor="checkout-notes">
              Catatan untuk barista (opsional)
            </label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-border-control bg-surface p-3"
              id="checkout-notes"
              onChange={(event) => {
                setNotes(event.target.value);
                setErrors((current) => ({ ...current, notes: '' }));
              }}
              placeholder="Contoh: jangan terlalu manis"
              ref={notesRef}
              value={notes}
            />
            <p className="mt-1 text-right text-sm text-text-muted">{notes.length}/200</p>
            {errors.notes && (
              <p className="text-sm text-danger-text" role="alert">
                {errors.notes}
              </p>
            )}
          </div>

          <button
            className="mt-6 h-12 w-full rounded-md bg-primary px-4 font-medium text-white hover:bg-primary-hover"
            type="submit"
          >
            Lanjut ke pembayaran
          </button>
        </form>

        <aside
          aria-label="Ringkasan pesanan"
          className="rounded-xl border border-border bg-surface p-5"
        >
          <h2 className="font-serif text-xl font-semibold">Ringkasan</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const optionsSummary = formatOptionsSummary(item.selectedOptions);
              return (
                <div className="text-sm" key={item.key}>
                  <div className="flex justify-between gap-3">
                    <span>{item.menuName}</span>
                    <span>{item.quantity}x</span>
                  </div>
                  {optionsSummary && <p className="mt-1 text-text-muted">{optionsSummary}</p>}
                </div>
              );
            })}
            <div className="flex justify-between gap-3 border-t border-border pt-3 text-sm">
              <span>Total item</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex justify-between gap-3 font-semibold">
              <span>Total</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
