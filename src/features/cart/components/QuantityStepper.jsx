export default function QuantityStepper({ label, max, min, onChange, quantity }) {
  return (
    <div
      aria-label={`Kontrol jumlah ${label}`}
      className="inline-flex items-center gap-3"
      role="group"
    >
      <button
        aria-label={`Kurangi jumlah ${label}`}
        className="min-h-11 min-w-11 rounded-md border border-border-control text-lg text-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
        disabled={quantity <= min}
        onClick={() => onChange(quantity - 1)}
        type="button"
      >
        −
      </button>
      <output aria-label={`Jumlah ${label}`} className="min-w-6 text-center font-medium">
        {quantity}
      </output>
      <button
        aria-label={`Tambah jumlah ${label}`}
        className="min-h-11 min-w-11 rounded-md border border-border-control text-lg text-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
        type="button"
      >
        +
      </button>
    </div>
  );
}
