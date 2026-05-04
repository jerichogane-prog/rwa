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
  /** True while files are being POSTed to the server. */
  uploading?: boolean;
  /** 0–100 percent. Drives the progress bar when uploading. */
  progress?: number;
}

const DEFAULT_MAX = 8;
const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUploader({
  value,
  onChange,
  max = DEFAULT_MAX,
  maxBytes = DEFAULT_MAX_BYTES,
  uploading = false,
  progress = 0,
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
        <>
          {uploading && (
            <div
              className="mt-4"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Uploading photos"
            >
              <div className="flex items-center justify-between text-xs text-[color:var(--color-ink-muted)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Spinner />
                  Uploading {value.length} photo{value.length === 1 ? '' : 's'}…
                </span>
                <span suppressHydrationWarning className="tabular-nums font-semibold">
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[color:var(--color-surface-sunken)] overflow-hidden">
                <div
                  className="h-full bg-[color:var(--color-ruby)] transition-[width] duration-300 ease-[var(--ease-out-expo)] rwa-progress-shimmer"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <ul className={`mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3 ${uploading ? 'pointer-events-none' : ''}`}>
            {value.map((img, i) => (
              <li key={img.id} className="relative group aspect-square">
                <img
                  src={img.previewUrl}
                  alt=""
                  className={`w-full h-full object-cover rounded-[var(--radius-sm)] transition-[filter,opacity] duration-300 ${
                    uploading ? 'brightness-75 saturate-75' : ''
                  }`}
                />

                {uploading && (
                  <div className="absolute inset-0 rounded-[var(--radius-sm)] flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
                    <Spinner light />
                  </div>
                )}

                {i === 0 && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-[color:var(--color-ruby)] text-white rounded-full">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  aria-label={`Remove ${img.file.name}`}
                  disabled={uploading}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:hidden"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

    </div>
  );
}

function Spinner({ light = false }: { light?: boolean }) {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={light ? 'rgba(255,255,255,0.35)' : 'currentColor'}
        strokeOpacity={light ? 1 : 0.25}
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke={light ? '#fff' : 'currentColor'}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
