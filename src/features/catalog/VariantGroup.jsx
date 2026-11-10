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
    <fieldset className="space-y-3" aria-labelledby={`variant-group-${group.id}`}>
      <legend
        id={`variant-group-${group.id}`}
        className="flex w-full items-baseline justify-between gap-3"
      >
        <h2 className="font-semibold text-text">{group.name}</h2>
        <span className="text-xs font-normal text-text-muted">
          {group.isRequired ? 'Wajib dipilih' : 'Boleh dilewati'}
        </span>
      </legend>
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
            <label
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-full border px-3 py-2 text-sm text-text transition-colors focus-within:ring-2 focus-within:ring-primary ${
                isSelected(option.id)
                  ? 'border-primary bg-primary-soft'
                  : 'border-border-control bg-surface hover:border-primary'
              }`}
              key={option.id}
            >
              <input
                checked={isSelected(option.id)}
                className="sr-only"
                name={`variant-${group.id}`}
                onChange={() => handleChange(option.id)}
                type={group.selectionType === 'single' ? 'radio' : 'checkbox'}
                value={option.id}
              />
              {isSelected(option.id) && <span aria-hidden="true">✓</span>}
              {optionContent}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
