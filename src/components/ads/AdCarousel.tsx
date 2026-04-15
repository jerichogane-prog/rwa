'use client';

import { useEffect, useRef, useState } from 'react';
import type { AdItem } from '@/lib/wp';

interface AdCarouselProps {
  ads: AdItem[];
  intervalMs?: number;
  variant?: 'banner' | 'square' | 'card';
  ariaLabel?: string;
  /** When true, start on a random slide so each page load shows a different ad first. */
  randomStart?: boolean;
}

export function AdCarousel({
  ads,
  intervalMs = 5000,
  variant = 'banner',
  ariaLabel = 'Sponsored advertisements',
  randomStart = false,
}: AdCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);

  // Pick a random starting slide on the client only — doing this in the initial
  // useState would cause an SSR/CSR hydration mismatch.
  useEffect(() => {
    if (randomStart && ads.length > 1) {
      setIndex(Math.floor(Math.random() * ads.length));
    }
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [ads.length, intervalMs]);

  if (ads.length === 0) return null;

  const isSquare = variant === 'square';
  const viewportClass = isSquare
    ? 'aspect-square'
    : variant === 'card'
      ? 'min-h-[240px]'
      : 'min-h-[120px] md:min-h-[160px]';

  const shellClass =
    variant === 'banner'
      ? 'rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] p-4 md:p-5'
      : variant === 'square'
        ? 'rounded-[var(--radius-lg)] bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] p-3'
        : 'rounded-[var(--radius-lg)] bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] p-5';

  return (
    <aside
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={`relative ${shellClass}`}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current;
        if (Math.abs(delta) > 40) {
          const next = delta < 0 ? index + 1 : index - 1;
          setIndex(((next % ads.length) + ads.length) % ads.length);
        }
        touchStart.current = null;
      }}
    >
      <div className={`relative ${viewportClass} overflow-hidden`}>
        <div
          className="absolute inset-0 flex transition-transform duration-[600ms] ease-[var(--ease-out-expo)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="flex-shrink-0 w-full h-full flex items-center justify-center [&_img]:max-w-full [&_img]:h-auto [&_img]:object-contain"
              aria-roledescription="slide"
            >
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: ad.html }}
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
