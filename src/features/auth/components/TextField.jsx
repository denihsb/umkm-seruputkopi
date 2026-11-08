export default function TextField({
  autoComplete,
  error,
  label,
  name,
  onBlur,
  onChange,
  type = 'text',
  value,
}) {
  const errorId = `${name}-error`;
  const describedBy = error ? errorId : undefined;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text" htmlFor={name}>
        {label}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={`h-12 w-full rounded-xl border bg-surface px-3 text-base text-text outline-none placeholder:text-text-muted focus:border-primary focus:outline-2 focus:outline-primary ${
          error ? 'border-danger' : 'border-border-control'
        }`}
        id={name}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        placeholder=""
        type={type}
        value={value}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-text" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
