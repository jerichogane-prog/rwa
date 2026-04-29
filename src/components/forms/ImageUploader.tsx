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
  uploading?: boolean;
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
    if (uploading) return;
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
          if (uploading) return;
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          if (uploading) return;
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`rounded-[var(--radius-md)] border-2 border-dashed p-6 text-center transition-colors ${
          dragActive
            ? 'border-[color:var(--color-ruby)] bg-[color:var(--color-ruby-soft)]'
            : 'border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-sunken)]'
        } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={ACCEPTED.join(',')}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <UploadCloudIcon />
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
          Drag &amp; drop or{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="font-semibold text-[color:var(--color-ruby)] hover:underline disabled:no-underline disabled:opacity-60"
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

      {uploading && value.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-ruby)]/20 bg-[color:var(--color-ruby-soft)] px-3 py-2"
        >
          <Spinner />
          <span className="text-xs font-semibold text-[color:var(--color-ruby-deep)] uploader-status-pulse">
            Uploading {value.length} photo{value.length === 1 ? '' : 's'}…
          </span>
          <span className="text-[11px] text-[color:var(--color-ink-muted)]">
            Please don’t close this tab.
          </span>
        </div>
      )}

      {value.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((img, i) => (
            <li
              key={img.id}
              className="uploader-thumb-enter relative group aspect-square overflow-hidden rounded-[var(--radius-sm)]"
            >
              <img
                src={img.previewUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              {i === 0 && !uploading && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-[color:var(--color-ruby)] text-white rounded-full">
                  Cover
                </span>
              )}
              {!uploading && (
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  aria-label={`Remove ${img.file.name}`}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  ×
                </button>
              )}
              {uploading && <ThumbUploadingOverlay />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UploadCloudIcon() {
  return (
    <span aria-hidden className="inline-flex uploader-icon-float">
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[color:var(--color-ink-subtle)]"
      >
        <path d="M16 16l-4-4-4 4" />
        <path d="M12 12v9" />
        <path d="M20.4 14.6A5 5 0 0 0 18 5.5a7 7 0 0 0-13.2 2.4A4.5 4.5 0 0 0 6 17h2" />
      </svg>
    </span>
  );
}

function Spinner() {
  return (
    <span aria-hidden className="inline-flex">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="uploader-spin">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="3"
          className="text-[color:var(--color-ruby)]"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-[color:var(--color-ruby)]"
        />
      </svg>
    </span>
  );
}

function ThumbUploadingOverlay() {
  return (
    <>
      <div className="uploader-shimmer-track" aria-hidden />
      <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-2 text-white">
        <Spinner />
        <span className="text-[10px] font-semibold tracking-wider uppercase">Uploading</span>
      </div>
      <div
        className="absolute left-2 right-2 bottom-2 h-1 rounded-full bg-white/25 overflow-hidden"
        aria-hidden
      >
        <div className="uploader-bar-fill h-full rounded-full bg-white" />
      </div>
    </>
  );
}
