export const STATUS_ORDER = ['received', 'processing', 'ready', 'completed'];

export function getNextStatus(status) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  return currentIndex < 0 ? null : (STATUS_ORDER[currentIndex + 1] ?? null);
}

export function getNextActionLabel(status) {
  const labels = {
    received: 'Proses pesanan',
    processing: 'Tandai siap',
    ready: 'Tandai selesai',
  };
  return labels[status] ?? null;
}
