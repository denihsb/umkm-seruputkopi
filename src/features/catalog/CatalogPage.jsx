import { useEffect, useState } from 'react';

import MenuCard from './components/MenuCard.jsx';
import { listCategories, listMenus } from './api.js';

function MenuSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse overflow-hidden rounded-xl border border-border"
    >
      <div className="aspect-[4/3] bg-border" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 rounded bg-border" />
        <div className="h-4 w-1/2 rounded bg-border" />
      </div>
    </div>
  );
}

function MenuGridSkeleton() {
  return (
    <div
      aria-label="Memuat daftar menu"
      className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
      role="status"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <MenuSkeleton key={index} />
      ))}
    </div>
  );
}

export default function CatalogPage() {
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);
  const [menusError, setMenusError] = useState(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isMenusLoading, setIsMenusLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsCategoriesLoading(true);
    setCategoriesError(null);
    listCategories()
      .then((result) => {
        if (isCurrent) setCategories(result);
      })
      .catch((error) => {
        if (isCurrent) setCategoriesError(error);
      })
      .finally(() => {
        if (isCurrent) setIsCategoriesLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  useEffect(() => {
    let isCurrent = true;

    setIsMenusLoading(true);
    setMenusError(null);
    listMenus(selectedCategoryId === null ? undefined : { categoryId: selectedCategoryId })
      .then((result) => {
        if (isCurrent) setMenus(result);
      })
      .catch((error) => {
        if (isCurrent) setMenusError(error);
      })
      .finally(() => {
        if (isCurrent) setIsMenusLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [retryCount, selectedCategoryId]);

  const isLoading = isCategoriesLoading || isMenusLoading;
  const hasError = categoriesError || menusError;

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <h1 className="font-serif text-2xl font-semibold text-text md:text-3xl">Menu Seruput</h1>

      <div aria-label="Kategori menu" className="flex flex-wrap gap-2" role="group">
        {[{ id: null, name: 'Semua' }, ...categories].map((category) => {
          const isSelected = selectedCategoryId === category.id;

          return (
            <button
              aria-pressed={isSelected}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors ${
                isSelected
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-border bg-surface text-text-muted hover:border-primary'
              }`}
              key={category.id ?? 'all'}
              onClick={() => setSelectedCategoryId(category.id)}
              type="button"
            >
              {isSelected && (
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="m3.5 8 3 3 6-6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              )}
              {category.name}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <MenuGridSkeleton />
      ) : hasError ? (
        <div className="py-10 text-center">
          <p className="text-sm text-text-muted">
            Maaf, daftar menu belum dapat dimuat. Silakan coba lagi.
          </p>
          <button
            className="mt-4 min-h-11 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            onClick={() => setRetryCount((count) => count + 1)}
            type="button"
          >
            Coba lagi
          </button>
        </div>
      ) : menus.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-muted">Belum ada menu di kategori ini.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {menus.map((menu) => (
            <MenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      )}
    </main>
  );
}
