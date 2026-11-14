export function formatRupiah(value) {
  return `Rp${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function formatDateTime(iso) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}
