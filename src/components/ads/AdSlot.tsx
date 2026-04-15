import { fetchAdList, fetchAdSlot } from '@/lib/wp';
import { AdCarousel } from './AdCarousel';

interface AdSlotProps {
  slot: string;
  group?: string;
  limit?: number;
  variant?: 'banner' | 'square' | 'card';
  className?: string;
}

export async function AdSlot({ slot, group, limit = 10, variant = 'banner', className = '' }: AdSlotProps) {
  // Primary path: list of rendered ads that the client slides through.
  const ads = await fetchAdList({ group: group ?? slot, limit });

  if (ads.length === 0) {
    // Single-ad fallback via Advanced Ads placement (legacy).
    const payload = await fetchAdSlot(slot);
    const hasAd = payload && !payload.empty && payload.html.trim().length > 0;
    if (!hasAd) {
      if (process.env.NODE_ENV !== 'production') {
        return <PlaceholderSlot slot={slot} variant={variant} className={className} />;
      }
      return null;
    }
    return (
      <AdCarousel
        ads={[{ id: 0, name: slot, html: payload.html, url: null }]}
        variant={variant}
      />
    );
  }

  return (
    <div className={className}>
      <AdCarousel ads={ads} variant={variant} />
    </div>
  );
}

function PlaceholderSlot({
  slot,
  variant,
  className,
}: Required<Pick<AdSlotProps, 'slot' | 'variant' | 'className'>>) {
  const sizeClass =
    variant === 'banner'
      ? 'min-h-[120px] md:min-h-[160px]'
      : variant === 'square'
        ? 'aspect-square'
        : 'min-h-[250px]';
  return (
    <aside
      aria-label="Advertisement placeholder"
      className={`relative flex items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-sunken)] text-[color:var(--color-ink-subtle)] ${sizeClass} ${className}`}
      data-ad-slot={slot}
    >
      <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">
        Ad slot · {slot}
      </span>
    </aside>
  );
}
