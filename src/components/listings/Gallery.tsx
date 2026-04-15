'use client';

import Image from 'next/image';
import { useState } from 'react';
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

  if (all.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] flex items-center justify-center text-[color:var(--color-ink-subtle)] text-sm uppercase tracking-wider">
        No image available
      </div>
    );
  }

  const current = all[Math.min(active, all.length - 1)];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)]">
        <Image
          src={current.url}
          alt={current.alt || fallbackTitle}
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          priority
          className="object-cover"
        />
      </div>
      {all.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 md:grid-cols-6 gap-2">
          {all.map((img, i) => (
            <li key={img.id || i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === active}
                className={`relative block w-full aspect-square overflow-hidden rounded-[var(--radius-sm)] transition-[box-shadow,outline] ${
                  i === active
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
    </div>
  );
}
