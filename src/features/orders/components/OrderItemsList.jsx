import { formatRupiah } from '@/lib/format.js';

export default function OrderItemsList({ items }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li className="flex items-start justify-between gap-4" key={item.id}>
          <div className="min-w-0">
            <p className="font-medium">
              {item.quantity} x {item.menuName}
            </p>
            {item.options.length > 0 && (
              <p className="mt-1 text-sm text-text-muted">
                {item.options.map((option) => option.optionName).join(' · ')}
              </p>
            )}
          </div>
          <span className="shrink-0">{formatRupiah(item.subtotal)}</span>
        </li>
      ))}
    </ul>
  );
}
