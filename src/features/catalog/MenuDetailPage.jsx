import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { formatRupiah } from '@/lib/format.js';

import { getMenuDetail } from './api.js';
import VariantGroup from './VariantGroup.jsx';

function MenuDetailSkeleton() {
  return (
    <main aria-label="Memuat detail menu" className="mx-auto max-w-5xl animate-pulse p-4 md:p-8">
      <div className="mb-6 h-11 w-24 rounded-md bg-border" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-[4/3] rounded-xl bg-border" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 rounded-md bg-border" />
          <div className="h-5 w-full rounded-md bg-border" />
          <div className="h-5 w-2/3 rounded-md bg-border" />
        </div>
      </div>
    </main>
  );
}

function MenuImage({ menu }) {
  if (!menu.imageUrl) {
    return (
      <div
        aria-label={`Gambar ${menu.name} belum tersedia`}
        className="flex aspect-[4/3] items-center justify-center rounded-xl bg-border text-sm text-text-muted"
        role="img"
      >
        Gambar belum tersedia
      </div>
    );
  }

  return (
    <img
      alt={menu.name}
      className="aspect-[4/3] w-full rounded-xl object-cover"
      src={menu.imageUrl}
    />
  );
}

export default function MenuDetailPage() {
  const { id } = useParams();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    setError(null);
    getMenuDetail(id)
      .then((result) => {
        if (isCurrent) setMenu(result);
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [id, retryCount]);

  if (isLoading) return <MenuDetailSkeleton />;

  if (error?.message === 'Menu tidak ditemukan.') {
    return (
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Link
          className="inline-flex min-h-11 items-center text-primary hover:text-primary-hover"
          to="/"
        >
          Kembali
        </Link>
        <div className="mt-12 text-center">
          <p className="text-lg">Menu tidak ditemukan.</p>
          <Link className="mt-4 inline-block text-primary underline" to="/">
            Kembali ke katalog
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Link
          className="inline-flex min-h-11 items-center text-primary hover:text-primary-hover"
          to="/"
        >
          Kembali
        </Link>
        <div className="mt-12 text-center">
          <p className="text-lg">Maaf, detail menu belum dapat dimuat.</p>
          <button
            className="mt-4 min-h-11 rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover"
            onClick={() => setRetryCount((count) => count + 1)}
            type="button"
          >
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <Link
        className="mb-6 inline-flex min-h-11 items-center text-primary hover:text-primary-hover"
        to="/"
      >
        Kembali
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <MenuImage menu={menu} />
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="font-serif text-3xl font-semibold text-text md:text-4xl">{menu.name}</h1>
            {menu.description && (
              <p className="text-sm leading-6 text-text-muted">{menu.description}</p>
            )}
            <p className="text-xl font-semibold text-primary">{formatRupiah(menu.basePrice)}</p>
          </div>
          {menu.variantGroups.length > 0 && (
            <div aria-label="Pilihan varian" className="space-y-6 border-t border-border pt-6">
              {menu.variantGroups.map((group) => (
                <VariantGroup group={group} key={group.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
