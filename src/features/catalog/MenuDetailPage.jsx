import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import QuantityStepper from '@/components/QuantityStepper.jsx';
import Toast from '@/components/Toast.jsx';
import { formatRupiah } from '@/lib/format.js';
import { useCart } from '@/features/cart/useCart.js';

import { getMenuDetail } from './api.js';
import {
  buildCartItem,
  calcUnitPrice,
  getInitialSelection,
  getMissingRequiredGroups,
  isGroupVisible,
  toggleOption,
} from './pricing.js';
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

export default function MenuDetailPage({ onAdd }) {
  const { id } = useParams();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [selection, setSelection] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    setError(null);
    getMenuDetail(id)
      .then((result) => {
        if (isCurrent) {
          setMenu(result);
          setSelection(getInitialSelection(result.variantGroups));
          setQuantity(1);
        }
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

  const visibleGroups = menu.variantGroups.filter((group) =>
    isGroupVisible(group, menu.variantGroups, selection),
  );
  const unitPrice = calcUnitPrice(menu.basePrice, menu.variantGroups, selection);
  const missingRequiredGroups = getMissingRequiredGroups(menu.variantGroups, selection);
  const canAdd = missingRequiredGroups.length === 0;
  function handleAdd() {
    const item = buildCartItem(menu, menu.variantGroups, selection, quantity);
    (onAdd ?? addItem)(item);
    setQuantity(1);
    setShowToast(true);
  }

  return (
    <main className="mx-auto max-w-5xl p-4 pb-32 md:p-8 md:pb-8">
      <Link
        className="mb-6 inline-flex min-h-11 items-center text-primary hover:text-primary-hover"
        to="/"
      >
        Kembali
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <MenuImage menu={menu} />
        <div className="flex min-w-0 flex-col gap-6 md:min-h-[32rem]">
          <div className="space-y-3">
            <h1 className="font-serif text-3xl font-semibold text-text md:text-4xl">{menu.name}</h1>
            {menu.description && (
              <p className="text-sm leading-6 text-text-muted">{menu.description}</p>
            )}
            <p className="text-xl font-semibold text-primary">{formatRupiah(unitPrice)}</p>
          </div>
          {menu.variantGroups.length > 0 && (
            <div aria-label="Pilihan varian" className="space-y-6 border-t border-border pt-6">
              {visibleGroups.map((group) => (
                <VariantGroup
                  group={group}
                  key={group.id}
                  onChange={(nextIds) =>
                    setSelection((currentSelection) => {
                      const previousIds = currentSelection[group.id] ?? [];
                      const changedId =
                        nextIds.find((optionId) => !previousIds.includes(optionId)) ??
                        previousIds.find((optionId) => !nextIds.includes(optionId));
                      return toggleOption(
                        menu.variantGroups,
                        currentSelection,
                        group.id,
                        changedId,
                      );
                    })
                  }
                  selectedIds={selection[group.id] ?? []}
                />
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-text">Jumlah</span>
            <QuantityStepper onChange={setQuantity} value={quantity} />
          </div>
          <AddBar
            canAdd={canAdd}
            className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur md:static md:mt-auto md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
            missingRequiredGroups={missingRequiredGroups}
            onAdd={handleAdd}
            totalPrice={unitPrice * quantity}
          />
        </div>
      </div>
      {showToast && <Toast onClose={() => setShowToast(false)} />}
    </main>
  );
}

function AddBar({ canAdd, className, missingRequiredGroups, onAdd, totalPrice }) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      {!canAdd && (
        <p role="status" className="text-sm text-danger-text">
          Pilih {missingRequiredGroups[0]}
        </p>
      )}
      <button
        className="min-h-11 w-full rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canAdd}
        onClick={onAdd}
        type="button"
      >
        Tambah · <span aria-live="polite">{formatRupiah(totalPrice)}</span>
      </button>
    </div>
  );
}
