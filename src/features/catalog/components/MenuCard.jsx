import { Link } from 'react-router-dom';

import { formatRupiah } from '@/lib/format.js';

export default function MenuCard({ menu }) {
  return (
    <Link
      className="block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary/50"
      to={`/menu/${menu.id}`}
    >
      {menu.imageUrl ? (
        <img alt={menu.name} className="aspect-[4/3] w-full object-cover" src={menu.imageUrl} />
      ) : (
        <div
          aria-label={menu.name}
          className="flex aspect-[4/3] items-center justify-center bg-border text-xs text-text-muted"
          role="img"
        >
          Gambar belum tersedia
        </div>
      )}
      <div className="space-y-1 p-3">
        <h2 className="line-clamp-2 text-sm font-medium leading-5 text-text">{menu.name}</h2>
        <p className="text-sm font-semibold text-primary">{formatRupiah(menu.basePrice)}</p>
      </div>
    </Link>
  );
}
