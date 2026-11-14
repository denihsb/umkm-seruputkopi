import { Link, useLocation } from 'react-router-dom';

export default function ConfirmationPlaceholder() {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-8">
      <section className="rounded-xl border border-border bg-surface p-6 text-center">
        {/* US-17 will replace this temporary confirmation page. */}
        <h1 className="font-serif text-3xl font-semibold">
          {orderNumber ? `Pesanan ${orderNumber} berhasil dibuat` : 'Pesanan berhasil dibuat'}
        </h1>
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
