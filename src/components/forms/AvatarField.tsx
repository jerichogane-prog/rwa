'use client';

import { useEffect, useRef, useState } from 'react';

interface AvatarFieldProps {
  value: File | null;
  onChange(next: File | null): void;
  /** Existing avatar URL shown when no new file is selected. */
  currentUrl?: string | null;
  label?: string;
  hint?: string;
  maxBytes?: number;
  initials?: string;
}

const DEFAULT_MAX = 4 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function AvatarField({
  value,
  onChange,
  currentUrl,
  label = 'Profile picture',
  hint = 'Optional · JPEG, PNG, WebP, or GIF · up to 4MB',
  maxBytes = DEFAULT_MAX,
  initials,
}: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep a fresh object URL for the selected file and release it on swap/unmount.
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError('Unsupported image type.');
      return;
    }
    if (file.size > maxBytes) {
      setError(`Image exceeds ${Math.round(maxBytes / 1024 / 1024)}MB.`);
      return;
    }
    setError(null);
    onChange(file);
  }

  const displayUrl = preview ?? currentUrl ?? null;

  return (
    <div>
      <span className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-2">
        {label}
      </span>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[color:var(--color-surface-sunken)] border border-[color:var(--color-border)] flex items-center justify-center flex-shrink-0">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-base font-bold text-[color:var(--color-ink-subtle)]">
              {initials || '?'}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-[color:var(--color-border-strong)] text-xs font-semibold hover:border-[color:var(--color-ruby)] hover:text-[color:var(--color-ruby)] transition-colors"
          >
            {displayUrl ? 'Change photo' : 'Upload photo'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)]"
            >
              Remove selected
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-[color:var(--color-ruby-deep)]">
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-[color:var(--color-ink-subtle)]">{hint}</p>
    </div>
  );
}
