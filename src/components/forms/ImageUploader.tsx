'use client';

import { useCallback, useId, useRef, useState } from 'react';

export interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageUploaderProps {
  value: PendingImage[];
  onChange(next: PendingImage[]): void;
  max?: number;
  maxBytes?: number;
}

const DEFAULT_MAX = 8;
const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUploader({
  value,
  onChange,
  max = DEFAULT_MAX,
  maxBytes = DEFAULT_MAX_BYTES,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const accepted: PendingImage[] = [];
      const messages: string[] = [];
      const capacity = max - value.length;
      const incoming = Array.from(files).slice(0, capacity);

      for (const file of incoming) {
        if (!ACCEPTED.includes(file.type)) {
          messages.push(`${file.name}: unsupported type`);
          continue;
        }
        if (file.size > maxBytes) {
          messages.push(`${file.name}: exceeds ${Math.round(maxBytes / 1024 / 1024)}MB`);
          continue;
        }
        accepted.push({
          id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }

      if (files.length > capacity) {
        messages.push(`Only ${max} images allowed — extras ignored.`);
      }

      setError(messages.length ? messages.join(' · ') : null);
      if (accepted.length) {
        onChange([...value, ...accepted]);
      }
    },
    [max, maxBytes, onChange, value],
  );

  const remove = (id: string) => {
    const target = value.find((img) => img.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(value.filter((img) => img.id !== id));
  };

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-1">
        Photos
        <span className="ml-2 font-normal normal-case tracking-normal text-[color:var(--color-ink-subtle)]">
          up to {max}, 8MB each
        </span>
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`rounded-[var(--radius-md)] border-2 border-dashed p-6 text-center transition-colors ${
          dragActive
            ? 'border-[color:var(--color-ruby)] bg-[color:var(--color-ruby-soft)]'
            : 'border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-sunken)]'
        }`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={ACCEPTED.join(',')}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          Drag &amp; drop or{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-[color:var(--color-ruby)] hover:underline"
          >
            choose files
          </button>
        </p>
        <p className="mt-1 text-xs text-[color:var(--color-ink-subtle)]">
          JPEG, PNG, WebP, or GIF
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-[color:var(--color-ruby-deep)]">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((img, i) => (
            <li key={img.id} className="relative group aspect-square">
              <img
                src={img.previewUrl}
                alt=""
                className="w-full h-full object-cover rounded-[var(--radius-sm)]"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-[color:var(--color-ruby)] text-white rounded-full">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(img.id)}
                aria-label={`Remove ${img.file.name}`}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
