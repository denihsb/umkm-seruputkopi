import { Link } from 'react-router-dom';
import { useState } from 'react';

import { formatRupiah } from '@/lib/format.js';
import { getMenuIllustration } from '@/lib/menuImages.js';

export default function MenuCard({ menu }) {
  const fallbackImage = getMenuIllustration(menu.name);
  const [imageSource, setImageSource] = useState(menu.imageUrl || fallbackImage);

  return (
    <Link
      className="menu-card block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary/50"
      to={`/menu/${menu.id}`}
    >
      {imageSource ? (
        <img
          alt={menu.name}
          className="aspect-[4/3] w-full object-cover"
          onError={() => {
            if (imageSource !== fallbackImage && fallbackImage) setImageSource(fallbackImage);
            else setImageSource('');
          }}
          src={imageSource}
        />
      ) : (
        <div
          aria-label={menu.name}
          className="flex aspect-[4/3] items-center justify-center bg-border text-xs text-text-muted"
          role="img"
        >
          Gambar belum tersedia
        </div>
      )}
      <div className="menu-card-copy space-y-1 p-3">
        <h2 className="line-clamp-2 text-sm font-medium leading-5 text-text">{menu.name}</h2>
        <p className="text-sm font-semibold text-primary">{formatRupiah(menu.basePrice)}</p>
      </div>
    </Link>
  );
}
