import { useId, useState } from 'react';

export default function PasswordField({
  autoComplete,
  error,
  helpText,
  label,
  name,
  onBlur,
  onChange,
  value,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const helpId = useId();
  const errorId = `${name}-error`;
  const describedBy =
    [helpText ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className={`h-12 w-full rounded-xl border bg-surface px-3 pr-14 text-base text-text outline-none placeholder:text-text-muted focus:border-primary focus:outline-2 focus:outline-primary ${
            error ? 'border-danger' : 'border-border-control'
          }`}
          id={name}
          name={name}
          onBlur={onBlur}
          onChange={onChange}
          type={isVisible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={isVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          aria-pressed={isVisible}
          className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 items-center justify-center px-3 text-xs font-medium text-primary hover:text-primary-hover"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>
      {helpText && (
        <p className="mt-1 text-xs text-text-muted" id={helpId}>
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-danger-text" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
