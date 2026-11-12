import { useState } from 'react';
import { Link } from 'react-router-dom';

import Toast from '@/components/Toast.jsx';
import { formatRupiah } from '@/lib/format.js';

import { MAX_QTY, MIN_QTY, getLineSubtotal } from './cartLogic.js';
import QuantityStepper from './components/QuantityStepper.jsx';
import { formatOptionsSummary } from './summary.js';
import { useCart } from './useCart.js';

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const [toastVersion, setToastVersion] = useState(0);

  function handleRemove(key) {
    removeItem(key);
    setToastVersion((version) => version + 1);
  }

  if (items.length === 0) {
    return (
      <>
        <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
          <section className="mx-auto max-w-lg rounded-xl border border-border bg-surface px-6 py-10 text-center">
            <h1 className="font-serif text-3xl font-semibold">Keranjang kosong</h1>
            <p className="mt-3 text-sm text-text-muted">Pilih menu favoritmu untuk Seruput ya.</p>
            <Link
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 font-medium text-white hover:bg-primary-hover"
              to="/"
            >
              Lihat menu
            </Link>
          </section>
        </main>
        <Toast
          key={toastVersion}
          message={toastVersion > 0 ? 'Item dihapus dari keranjang' : ''}
          onDismiss={() => setToastVersion(0)}
        />
      </>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold">Keranjang</h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Periksa lagi pesananmu sebelum lanjut ke pembayaran.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
        <section aria-label="Daftar item keranjang" className="space-y-4">
          {items.map((item) => {
            const optionsSummary = formatOptionsSummary(item.selectedOptions);

            return (
              <article
                className="rounded-xl border border-border bg-surface p-4 sm:p-5"
                key={item.key}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold">{item.menuName}</h2>
                    {optionsSummary && (
                      <p className="mt-1 text-sm text-text-muted">{optionsSummary}</p>
                    )}
                  </div>
                  <button
                    aria-label={`Hapus ${item.menuName} dari keranjang`}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-md px-3 text-sm font-medium text-danger-text hover:bg-danger-soft"
                    onClick={() => handleRemove(item.key)}
                    type="button"
                  >
                    Hapus
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
                  <div className="space-y-1 text-sm">
                    <p className="text-text-muted">Harga satuan: {formatRupiah(item.unitPrice)}</p>
                    <p className="font-semibold">Subtotal: {formatRupiah(getLineSubtotal(item))}</p>
                  </div>
                  <QuantityStepper
                    label={item.menuName}
                    max={MAX_QTY}
                    min={MIN_QTY}
                    onChange={(quantity) => updateQuantity(item.key, quantity)}
                    quantity={item.quantity}
                  />
                </div>
              </article>
            );
          })}
          <Link
            className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline hover:text-primary-hover"
            to="/"
          >
            Tambah menu lainnya
          </Link>
        </section>

        <aside
          aria-label="Ringkasan keranjang"
          className="rounded-xl border border-border bg-surface p-5"
        >
          <h2 className="font-serif text-xl font-semibold">Ringkasan</h2>
          <div aria-atomic="true" aria-live="polite" className="mt-4 space-y-3">
            <div className="flex justify-between gap-3 text-sm">
              <span>Total item</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-border pt-3 font-semibold">
              <span>Total</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
          </div>
          <Link
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-4 font-medium text-white hover:bg-primary-hover"
            to="/checkout"
          >
            Checkout
          </Link>
        </aside>
      </div>
      <Toast
        key={toastVersion}
        message={toastVersion > 0 ? 'Item dihapus dari keranjang' : ''}
        onDismiss={() => setToastVersion(0)}
      />
    </main>
  );
}
