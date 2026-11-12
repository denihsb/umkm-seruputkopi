import { useEffect } from 'react';

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;

    const timeoutId = window.setTimeout(onDismiss, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg bg-text px-4 py-3 text-center text-sm text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
