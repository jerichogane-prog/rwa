'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { ListingSummary } from '@/lib/wp';
import { decodeEntities, formatPrice, formatRelativeDate } from '@/lib/format';

type Status = 'publish' | 'draft' | 'pending';
type MyListing = ListingSummary & { post_status: Status };

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Owner-only preview for pending/draft listings.
 *
 * The public `/listing/:slug` route calls WP's `/rwa/v1/listing/:slug`
 * endpoint, which only returns `publish` posts — so pending/draft ads 404
 * there. This route fetches the owner's `/my/listings` summary and renders
 * what we have (title, excerpt, thumbnail, price, taxonomy). Full-fidelity
 * preview requires a WP plugin change to expose draft/pending details.
 */
export default function ListingPreviewPage({ params }: PreviewPageProps) {
  const { id } = use(params);
  const numericId = Number(id);
  const { user, loading: authLoading, authedFetch } = useAuth();
  const [listing, setListing] = useState<MyListing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError('Sign in to preview this listing.');
      return;
    }
    if (!Number.isFinite(numericId)) {
      setError('Invalid listing id.');
      return;
    }
    let cancelled = false;
    authedFetch<MyListing[]>('/my/listings')
      .then((list) => {
        if (cancelled) return;
        const match = list.find((l) => l.id === numericId);
        if (!match) {
          setError('Listing not found, or you do not own it.');
          return;
        }
        setListing(match);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, numericId, authedFetch]);

  if (authLoading || (!listing && !error)) {
    return (
      <div className="container-page pt-8 pb-16">
        <div className="h-8 w-48 rounded bg-[color:var(--color-surface-sunken)] animate-pulse" />
        <div className="mt-6 h-64 rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page pt-8 pb-16">
        <h1 className="text-2xl font-bold">Preview unavailable</h1>
        <p className="mt-2 text-[color:var(--color-ink-muted)]">{error}</p>
        <Link href="/account/listings" className="mt-4 inline-block text-[color:var(--color-ruby)] hover:underline">
          ← Back to My Listings
        </Link>
      </div>
    );
  }

  if (!listing) return null;

  const title = decodeEntities(listing.title);
  const excerpt = decodeEntities(listing.excerpt);
  const primaryCategory = listing.categories[0];
  const primaryLocation = listing.locations[0];
  const statusLabel = listing.post_status === 'pending' ? 'Pending review' : 'Draft';
  const statusCopy =
    listing.post_status === 'pending'
      ? 'This ad is waiting for admin review. Only you can see it until it is approved.'
      : 'This ad is saved as a draft and is not visible to anyone else yet.';

  return (
    <div className="container-page pt-8 pb-16">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/account/listings" className="hover:text-[color:var(--color-ink)]">
          My listings
        </Link>
        <span className="mx-1.5" aria-hidden>
          ›
        </span>
        <span className="text-[color:var(--color-ink)]">Preview</span>
      </nav>

      <div
        role="status"
        className="mt-4 mb-6 flex flex-wrap items-start gap-3 rounded-[var(--radius-lg)] border border-[oklch(85%_0.1_75)] bg-[oklch(97%_0.04_75)] p-4 text-sm text-[oklch(38%_0.12_60)]"
      >
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[oklch(92%_0.1_75)] text-[oklch(32%_0.14_60)]">
          {statusLabel}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[color:var(--color-ink)]">Preview mode</p>
          <p className="mt-0.5">{statusCopy}</p>
          <p className="mt-0.5 text-xs">
            Full details (description, gallery, custom fields) will appear once the ad is published.
          </p>
        </div>
      </div>

      <article>
        {listing.thumbnail && (
          <div className="relative w-full overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] aspect-[16/9]">
            <Image
              src={listing.thumbnail}
              alt={title}
              fill
              unoptimized
              className="object-cover"
              sizes="(min-width: 1024px) 960px, 100vw"
            />
          </div>
        )}

        <header className="mt-8">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-[color:var(--color-ink-subtle)]">
            {primaryCategory && <span>{decodeEntities(primaryCategory.name)}</span>}
            {primaryLocation && <span>· {decodeEntities(primaryLocation.name)}</span>}
            {listing.condition && <span>· {decodeEntities(listing.condition)}</span>}
          </div>
          <h1 className="mt-2 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-[family-name:var(--font-archivo)] font-extrabold leading-[1.05] tracking-tight">
            {title}
          </h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {listing.price > 0 && (
              <span className="text-3xl md:text-4xl font-bold text-[color:var(--color-ruby)]">
                {formatPrice(listing.price, listing.price_type)}
              </span>
            )}
            <span className="text-sm text-[color:var(--color-ink-subtle)]">Posted {formatRelativeDate(listing.date)}</span>
          </div>
        </header>

        {excerpt && (
          <p className="mt-6 text-base leading-relaxed text-[color:var(--color-ink)]">{excerpt}</p>
        )}
      </article>
    </div>
  );
}
