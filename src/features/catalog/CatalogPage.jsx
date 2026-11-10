import { useEffect, useRef, useState } from 'react';

import useDebouncedValue from '@/hooks/useDebouncedValue.js';
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
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebouncedValue(searchValue);
  const searchInputRef = useRef(null);
  const menuRequestIdRef = useRef(0);

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
    const requestId = menuRequestIdRef.current + 1;
    menuRequestIdRef.current = requestId;
    const keyword = debouncedSearchValue.trim();
    const params = {};

    if (selectedCategoryId !== null) params.categoryId = selectedCategoryId;
    if (keyword) params.keyword = keyword;

    setIsMenusLoading(true);
    setMenusError(null);
    listMenus(params)
      .then((result) => {
        if (isCurrent && menuRequestIdRef.current === requestId) setMenus(result);
      })
      .catch((error) => {
        if (isCurrent && menuRequestIdRef.current === requestId) setMenusError(error);
      })
      .finally(() => {
        if (isCurrent && menuRequestIdRef.current === requestId) setIsMenusLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearchValue, retryCount, selectedCategoryId]);

  const hasError = categoriesError || menusError;
  const activeKeyword = debouncedSearchValue.trim();

  function clearSearch() {
    setSearchValue('');
    searchInputRef.current?.focus();
  }

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <h1 className="font-serif text-2xl font-semibold text-text md:text-3xl">Menu Seruput</h1>

      <form className="relative" onSubmit={(event) => event.preventDefault()} role="search">
        <label className="sr-only" htmlFor="menu-search">
          Cari menu
        </label>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
        <input
          className="h-12 w-full rounded-md border border-border-control bg-surface pl-12 pr-14 text-base text-text placeholder:text-text-muted"
          id="menu-search"
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Cari menu"
          ref={searchInputRef}
          type="search"
          value={searchValue}
        />
        {searchValue && (
          <button
            aria-label="Hapus pencarian"
            className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:bg-primary-soft hover:text-text"
            onClick={clearSearch}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path
                d="m7 7 10 10M17 7 7 17"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        )}
      </form>

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

      {activeKeyword && !hasError && (
        <div aria-live="polite" className="-mb-2 text-xs text-text-muted" role="status">
          {menus.length} menu ditemukan
        </div>
      )}

      {isMenusLoading || isCategoriesLoading ? (
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
        activeKeyword ? (
          <div className="py-10 text-center">
            <p className="text-sm text-text-muted">
              Menu &quot;{activeKeyword}&quot; tidak ditemukan.
            </p>
            <button
              className="mt-4 min-h-11 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary-soft"
              onClick={clearSearch}
              type="button"
            >
              Hapus pencarian
            </button>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-text-muted">
            Belum ada menu di kategori ini.
          </p>
        )
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
