import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-10">
      <section className="w-full rounded-xl border border-border bg-surface p-8 text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft font-serif text-2xl text-primary"
        >
          404
        </span>
        <h1 className="mt-5 font-serif text-3xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-text-muted">
          Tautan yang kamu buka tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 font-medium text-white"
          to="/"
        >
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
