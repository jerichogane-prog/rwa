'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '@/lib/wp';

interface GalleryProps {
  images: GalleryImage[];
  fallbackTitle: string;
  fallbackImage: string | null;
}

export function Gallery({ images, fallbackTitle, fallbackImage }: GalleryProps) {
  const all = images.length > 0
    ? images
    : fallbackImage
      ? [{ id: 0, url: fallbackImage, thumb: fallbackImage, srcset: null, alt: fallbackTitle, width: null, height: null } satisfies GalleryImage]
      : [];
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    // Restore focus to whatever opened the lightbox.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  if (all.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] flex items-center justify-center text-[color:var(--color-ink-subtle)] text-sm uppercase tracking-wider">
        No image available
      </div>
    );
  }

  const safeIndex = Math.min(active, all.length - 1);
  const current = all[safeIndex];

  return (
    <div>
      <button
        type="button"
        ref={triggerRef}
        onClick={openLightbox}
        aria-label={`Open image ${safeIndex + 1} of ${all.length} fullscreen`}
        className="relative block w-full aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] cursor-zoom-in group"
      >
        <Image
          src={current.url}
          alt={current.alt || fallbackTitle}
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          priority
          className="object-cover transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
        />
        <span
          aria-hidden
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
        >
          <ExpandIcon />
          Zoom
        </span>
      </button>
      {all.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 md:grid-cols-6 gap-2">
          {all.map((img, i) => (
            <li key={img.id || i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                onDoubleClick={() => {
                  setActive(i);
                  openLightbox();
                }}
                aria-label={`View image ${i + 1}`}
                aria-current={i === safeIndex}
                className={`relative block w-full aspect-square overflow-hidden rounded-[var(--radius-sm)] transition-[box-shadow,outline] ${
                  i === safeIndex
                    ? 'outline outline-2 outline-[color:var(--color-ruby)]'
                    : 'outline outline-1 outline-[color:var(--color-border)] hover:outline-[color:var(--color-border-strong)]'
                }`}
              >
                <Image
                  src={img.thumb || img.url}
                  alt={img.alt || ''}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {lightboxOpen && (
        <Lightbox
          images={all}
          index={safeIndex}
          onChange={setActive}
          onClose={closeLightbox}
          fallbackTitle={fallbackTitle}
        />
      )}
    </div>
  );
}

interface LightboxProps {
  images: GalleryImage[];
  index: number;
  onChange(next: number): void;
  onClose(): void;
  fallbackTitle: string;
}

function Lightbox({ images, index, onChange, onClose, fallbackTitle }: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const total = images.length;

  const goNext = useCallback(() => onChange((index + 1) % total), [index, total, onChange]);
  const goPrev = useCallback(() => onChange((index - 1 + total) % total), [index, total, onChange]);

  // Lock body scroll while open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Move focus to the close button so keyboard users land in the dialog.
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Keyboard nav.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev]);

  const current = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer — ${index + 1} of ${total}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm rwa-lightbox-fade"
      onClick={(event) => {
        // Click on the backdrop (outside the image / controls) closes.
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
        const delta = endX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < 40) return;
        if (delta < 0) goNext();
        else goPrev();
      }}
    >
      {/* Counter */}
      <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold tracking-wider uppercase tabular-nums select-none">
        {index + 1} / {total}
      </span>

      {/* Close */}
      <button
        type="button"
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute top-4 right-4 w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
      >
        <CloseIcon />
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous image"
          className="hidden sm:inline-flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
        >
          <ArrowIcon direction="left" />
        </button>
      )}

      {/* Image — plain <img> so object-contain just works without next/image sizing math. */}
      <img
        key={current.id || index}
        src={current.url}
        alt={current.alt || fallbackTitle}
        className="max-w-[92vw] max-h-[88vh] object-contain rounded-[var(--radius-md)] shadow-2xl rwa-lightbox-zoom select-none"
        draggable={false}
      />

      {/* Next */}
      {total > 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label="Next image"
          className="hidden sm:inline-flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
        >
          <ArrowIcon direction="right" />
        </button>
      )}

      {/* Mobile controls — bottom row */}
      {total > 1 && (
        <div className="sm:hidden absolute inset-x-0 bottom-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      )}
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  const d = direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
