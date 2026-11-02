export function formatRupiah(value) {
  return `Rp${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
