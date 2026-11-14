import { useRegisterSW } from 'virtual:pwa-register/react';

import Toast from './Toast.jsx';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <>
      {needRefresh && (
        <div
          className="fixed inset-x-4 bottom-[env(safe-area-inset-bottom)] z-30 rounded-lg bg-primary p-4 text-white shadow-lg"
          role="status"
        >
          <p className="font-medium">Versi baru tersedia</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              className="min-h-11 rounded-md px-4 font-medium hover:bg-white/10"
              onClick={() => setNeedRefresh(false)}
              type="button"
            >
              Nanti
            </button>
            <button
              className="min-h-11 rounded-md bg-white px-4 font-medium text-primary hover:bg-primary-soft"
              onClick={() => updateServiceWorker(true)}
              type="button"
            >
              Muat ulang
            </button>
          </div>
        </div>
      )}
      {offlineReady && (
        <Toast message="Siap dipakai offline" onClose={() => setOfflineReady(false)} />
      )}
    </>
  );
}
