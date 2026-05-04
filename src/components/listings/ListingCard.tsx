import Image from 'next/image';
import Link from 'next/link';
import type { AdType, ListingSummary } from '@/lib/wp';
import { AD_TYPE_LABELS } from '@/lib/wp';
import { decodeEntities, formatPrice, formatRelativeDate } from '@/lib/format';
import { FavoriteButton } from './FavoriteButton';

const TYPE_TONE: Record<AdType, string> = {
  sell: 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]',
  buy: 'bg-[oklch(94%_0.05_240)] text-[oklch(35%_0.14_250)]',
  rentlease: 'bg-[oklch(95%_0.06_150)] text-[oklch(35%_0.14_150)]',
  lostfound: 'bg-[oklch(95%_0.06_75)] text-[oklch(38%_0.12_60)]',
  job: 'bg-[oklch(94%_0.04_280)] text-[oklch(35%_0.14_280)]',
  event: 'bg-[oklch(94%_0.05_320)] text-[oklch(35%_0.16_330)]',
};

interface ListingCardProps {
  listing: ListingSummary;
  variant?: 'default' | 'feature';
  priority?: boolean;
  /** When true, render the wrapper as a non-link <div> so the card can be
   *  embedded inside an outer <Link> without producing nested <a> elements. */
  noLink?: boolean;
}

export function ListingCard({ listing, variant = 'default', priority = false, noLink = false }: ListingCardProps) {
  const isFeature = variant === 'feature';
  const category = listing.categories[0]?.name ? decodeEntities(listing.categories[0].name) : undefined;
  const location = listing.locations[0]?.name ? decodeEntities(listing.locations[0].name) : undefined;
  const title = decodeEntities(listing.title);
  const excerpt = listing.excerpt ? decodeEntities(listing.excerpt) : '';

  const wrapperClassName =
    'group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)] hover:shadow-[var(--shadow-lift)] transition-[box-shadow,transform,border-color] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5';

  const inner = (
    <>
      <div
        className={`relative w-full bg-[color:var(--color-surface-sunken)] overflow-hidden ${
          isFeature ? 'aspect-[16/10]' : 'aspect-[4/3]'
        }`}
      >
        {listing.thumbnail ? (
          <Image
            src={listing.thumbnail}
            alt={title}
            fill
            priority={priority}
            sizes={isFeature ? '(min-width: 1024px) 640px, 100vw' : '(min-width: 768px) 320px, 100vw'}
            className="object-cover transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[color:var(--color-ink-subtle)] text-xs uppercase tracking-wider">
            No image
          </div>
        )}

        {listing.featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[color:var(--color-ruby)] text-white text-[10px] font-semibold tracking-[0.14em] uppercase shadow-[var(--shadow-card)]">
            <span aria-hidden>★</span> Featured
          </span>
        )}
        <FavoriteButton listingId={listing.id} />
      </div>

      <div className="flex-1 flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 flex-wrap">
          {listing.ad_type && listing.ad_type in AD_TYPE_LABELS && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${TYPE_TONE[listing.ad_type as AdType]}`}
            >
              {AD_TYPE_LABELS[listing.ad_type as AdType]}
            </span>
          )}
          {(category || location) && (
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-subtle)]">
              {category && <span>{category}</span>}
              {category && location && <span aria-hidden>·</span>}
              {location && <span>{location}</span>}
            </span>
          )}
        </div>

        <h3
          className={`font-[family-name:var(--font-archivo)] font-bold leading-[1.15] text-[color:var(--color-ink)] group-hover:text-[color:var(--color-ruby)] transition-colors ${
            isFeature ? 'text-2xl' : 'text-lg'
          }`}
        >
          {title}
        </h3>

        {isFeature && excerpt && (
          <p className="text-sm text-[color:var(--color-ink-muted)] line-clamp-2">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-baseline justify-between gap-3 pt-2">
          <span className="text-lg font-semibold text-[color:var(--color-ruby)]">
            {formatPrice(listing.price, listing.price_type)}
          </span>
          <span className="text-xs text-[color:var(--color-ink-subtle)]">
            {formatRelativeDate(listing.date)}
          </span>
        </div>
      </div>
    </>
  );

  return noLink ? (
    <div className={wrapperClassName}>{inner}</div>
  ) : (
    <Link href={`/listing/${listing.slug}`} className={wrapperClassName}>
      {inner}
    </Link>
  );
}
