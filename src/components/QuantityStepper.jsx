export default function QuantityStepper({ value, onChange, min = 1, max = 20 }) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-full border border-border-control bg-surface">
      <button
        aria-label="Kurangi jumlah"
        className="min-h-11 min-w-11 rounded-full text-lg text-text disabled:cursor-not-allowed disabled:opacity-40"
        disabled={value <= min}
        onClick={decrease}
        type="button"
      >
        -
      </button>
      <span aria-live="polite" className="min-w-8 text-center font-medium text-text">
        {value}
      </span>
      <button
        aria-label="Tambah jumlah"
        className="min-h-11 min-w-11 rounded-full text-lg text-text disabled:cursor-not-allowed disabled:opacity-40"
        disabled={value >= max}
        onClick={increase}
        type="button"
      >
        +
      </button>
    </div>
  );
}
