import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Toast({ message, onDismiss, onClose }) {
  const dismiss = onDismiss ?? onClose;
  const isCartAddition = message === undefined;

  useEffect(() => {
    if (typeof dismiss !== 'function') return undefined;

    const timeoutId = window.setTimeout(dismiss, 4000);
    return () => window.clearTimeout(timeoutId);
  }, [dismiss]);

  if (!isCartAddition && !message) return null;

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 flex items-center justify-between gap-3 rounded-lg bg-text px-4 py-3 text-sm text-white shadow-lg md:inset-x-auto md:right-4 md:w-auto"
      role="status"
    >
      <span>{isCartAddition ? 'Ditambahkan ke keranjang' : message}</span>
      {isCartAddition ? (
        <div className="flex items-center gap-2">
          <Link className="font-medium underline" to="/keranjang">
            Lihat keranjang
          </Link>
          <button
            aria-label="Tutup notifikasi"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-lg hover:bg-white/10"
            onClick={dismiss}
            type="button"
          >
            &times;
          </button>
        </div>
      ) : (
        <button
          aria-label="Tutup notifikasi"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-lg hover:bg-white/10"
          onClick={dismiss}
          type="button"
        >
          &times;
        </button>
      )}
    </div>
  );
}
