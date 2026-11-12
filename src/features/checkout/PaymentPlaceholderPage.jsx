import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ORDER_TYPE_LABELS = {
  take_away: 'Bawa pulang',
  dine_in: 'Makan di tempat',
};

export default function PaymentPlaceholderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutState = location.state;

  useEffect(() => {
    if (!checkoutState) {
      navigate('/checkout', { replace: true });
    }
  }, [checkoutState, navigate]);

  if (!checkoutState) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <section className="rounded-xl border border-border bg-surface p-5">
        <h1 className="font-serif text-3xl font-semibold">
          Pembayaran akan diimplementasikan di US-16
        </h1>
        <dl className="mt-6 space-y-3">
          <div>
            <dt className="text-sm text-text-muted">Tipe pesanan</dt>
            <dd>{ORDER_TYPE_LABELS[checkoutState.orderType] ?? checkoutState.orderType}</dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Catatan</dt>
            <dd>{checkoutState.notes || '-'}</dd>
          </div>
        </dl>
        <button
          className="mt-6 inline-flex h-12 items-center rounded-md bg-primary px-5 font-medium text-white hover:bg-primary-hover"
          onClick={() => navigate('/checkout')}
          type="button"
        >
          Kembali
        </button>
      </section>
    </main>
  );
}
