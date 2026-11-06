import { formatRupiah } from '@/lib/format.js';

export default function VariantGroup({ group, selectedIds = [], onChange }) {
  const isSelected = (optionId) => selectedIds.includes(optionId);

  const handleChange = (optionId) => {
    if (!onChange) return;

    if (group.selectionType === 'single') {
      onChange([optionId]);
      return;
    }

    onChange(
      isSelected(optionId)
        ? selectedIds.filter((selectedId) => selectedId !== optionId)
        : [...selectedIds, optionId],
    );
  };

  return (
    <section aria-labelledby={`variant-group-${group.id}`} className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={`variant-group-${group.id}`} className="font-semibold text-text">
          {group.name}
        </h2>
        <span className="text-xs text-text-muted">
          {group.isRequired ? 'Wajib dipilih' : 'Boleh dilewati'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.options.map((option) => {
          const optionContent = (
            <>
              <span>{option.name}</span>
              {option.priceDelta > 0 && (
                <span className="text-accent-text">+{formatRupiah(option.priceDelta)}</span>
              )}
            </>
          );

          if (!onChange) {
            return (
              <div
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-2 text-sm text-text-muted"
                key={option.id}
              >
                {optionContent}
              </div>
            );
          }

          return (
            <button
              aria-pressed={isSelected(option.id)}
              className="inline-flex items-center gap-1 rounded-full border border-border-control bg-surface px-3 py-2 text-sm text-text transition-colors hover:border-primary"
              key={option.id}
              onClick={() => handleChange(option.id)}
              type="button"
            >
              {optionContent}
            </button>
          );
        })}
      </div>
    </section>
  );
}
