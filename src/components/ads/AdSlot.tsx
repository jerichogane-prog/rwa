import { fetchAdGroup, fetchAdSlot } from '@/lib/wp';
import { AdCarousel } from './AdCarousel';

export type AdVariant = 'banner' | 'square' | 'card';

interface AdSlotProps {
  /**
   * Logical slot name on the frontend. Maps to a real Advanced Ads group via
   * SLOT_GROUP_MAP. Pass `group` to override.
   */
  slot: string;
  group?: string;
  limit?: number;
  variant?: AdVariant;
  className?: string;
}

/**
 * Maps the semantic slot names used in this app to the actual Advanced Ads
 * group slugs configured in WordPress. Edit here if the WP groups are renamed.
 */
const SLOT_GROUP_MAP: Record<string, string> = {
  'home-leaderboard': 'home-page-group',
  'home-midroll': 'home-page-group',
  'home-footer': 'home-page-group',
  'listings-banner': 'category-banner',
  'listings-sidebar': 'square-ad-group',
  'listing-sidebar': 'square-ad-group',
  'category-banner': 'category-banner',
  'square': 'square-ad-group',
};

function resolveGroup(slot: string, override?: string): string {
  if (override) return override;
  return SLOT_GROUP_MAP[slot] ?? slot;
}

export async function AdSlot({ slot, group, limit = 30, variant = 'banner', className = '' }: AdSlotProps) {
  const resolved = resolveGroup(slot, group);
  const { ads, settings } = await fetchAdGroup({ group: resolved, limit });

  if (ads.length === 0) {
    // Single-ad fallback via Advanced Ads "placement" if one is configured.
    const payload = await fetchAdSlot(slot);
    const hasAd = payload && !payload.empty && payload.html.trim().length > 0;
    if (!hasAd) {
      if (process.env.NODE_ENV !== 'production') {
        return <PlaceholderSlot slot={slot} group={resolved} variant={variant} className={className} />;
      }
      return null;
    }
    return (
      <div className={className}>
        <AdCarousel
          ads={[{ id: 0, name: slot, html: payload.html, url: null }]}
          variant={variant}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <AdCarousel
        ads={ads}
        variant={variant}
        intervalMs={settings.delay_ms || 5000}
        randomStart={settings.random}
      />
    </div>
  );
}

function PlaceholderSlot({
  slot,
  group,
  variant,
  className,
}: {
  slot: string;
  group: string;
  variant: AdVariant;
  className: string;
}) {
  const sizeClass =
    variant === 'banner'
      ? 'min-h-[120px] md:min-h-[160px]'
      : variant === 'square'
        ? 'aspect-square'
        : 'min-h-[250px]';
  return (
    <aside
      aria-label="Advertisement placeholder"
      className={`relative flex flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-sunken)] text-[color:var(--color-ink-subtle)] p-6 ${sizeClass} ${className}`}
      data-ad-slot={slot}
      data-ad-group={group}
    >
      <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">Ad slot · {slot}</span>
      <span className="text-[10px] tracking-wide opacity-70">expects WP group: {group}</span>
    </aside>
  );
}
