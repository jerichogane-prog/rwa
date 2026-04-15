'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdItem } from '@/lib/wp';

interface AdCarouselProps {
  ads: AdItem[];
  intervalMs?: number;
  variant?: 'banner' | 'square' | 'card';
  ariaLabel?: string;
}

export function AdCarousel({
  ads,
  intervalMs = 5000,
  variant = 'banner',
  ariaLabel = 'Sponsored advertisements',
}: AdCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (ads.length === 0) return;
      setIndex(((next % ads.length) + ads.length) % ads.length);
    },
    [ads.length],
  );

  useEffect(() => {
    if (ads.length <= 1 || paused) return;
    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [ads.length, intervalMs, paused]);

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
      className={`group/ads relative ${shellClass}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current;
        if (Math.abs(delta) > 40) {
          goTo(delta < 0 ? index + 1 : index - 1);
        }
        touchStart.current = null;
      }}
    >
      <span className="absolute top-2 right-3 z-10 text-[10px] font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)]">
        Ad {ads.length > 1 ? `· ${index + 1}/${ads.length}` : ''}
      </span>

      <div className={`relative ${viewportClass} overflow-hidden`}>
        <div
          className="absolute inset-0 flex transition-transform duration-[500ms] ease-[var(--ease-out-expo)]"
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

        {ads.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous ad"
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[color:var(--color-surface-raised)]/80 backdrop-blur-sm border border-[color:var(--color-border)] flex items-center justify-center text-sm opacity-0 group-hover/ads:opacity-100 focus:opacity-100 transition-opacity"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next ad"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[color:var(--color-surface-raised)]/80 backdrop-blur-sm border border-[color:var(--color-border)] flex items-center justify-center text-sm opacity-0 group-hover/ads:opacity-100 focus:opacity-100 transition-opacity"
            >
              ›
            </button>
          </>
        )}
      </div>

      {ads.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {ads.map((ad, i) => (
            <button
              key={ad.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ad ${i + 1}: ${ad.name}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-[var(--duration-normal)] ${
                i === index
                  ? 'w-6 bg-[color:var(--color-ruby)]'
                  : 'w-1.5 bg-[color:var(--color-border-strong)] hover:bg-[color:var(--color-ink-subtle)]'
              }`}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
