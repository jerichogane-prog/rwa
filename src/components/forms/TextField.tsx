interface TextFieldProps {
  id?: string;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}

export function TextField({
  id,
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  defaultValue,
  placeholder,
  hint,
  as = 'input',
  rows,
}: TextFieldProps) {
  const fieldId = id ?? `field-${name}`;
  const baseClass =
    'w-full rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none';

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-1"
      >
        {label}
        {required && <span className="text-[color:var(--color-ruby)]"> *</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={rows ?? 4}
          className={baseClass}
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`h-11 ${baseClass}`}
        />
      )}
      {hint && <p className="mt-1 text-xs text-[color:var(--color-ink-subtle)]">{hint}</p>}
    </div>
  );
}
