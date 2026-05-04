'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { ListingSummary } from '@/lib/wp';
import { ListingCard } from './ListingCard';

type Status = 'publish' | 'draft' | 'pending';
type MyListing = ListingSummary & { post_status: Status };

export function YourListingsRail() {
  const { user, authedFetch } = useAuth();
  const [listings, setListings] = useState<MyListing[] | null>(null);

  useEffect(() => {
    if (!user) {
      setListings(null);
      return;
    }
    let cancelled = false;
    authedFetch<MyListing[]>('/my/listings')
      .then((data) => {
        if (!cancelled) setListings(data);
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authedFetch]);

  if (!user || !listings || listings.length === 0) return null;

  const pending = listings.filter((l) => l.post_status !== 'publish');
  const visible = pending.length > 0 ? pending : listings.slice(0, 3);
  if (visible.length === 0) return null;

  return (
    <section
      aria-labelledby="your-listings-heading"
      className="mb-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[color:var(--color-ruby)]">
            Your listings
          </p>
          <h2 id="your-listings-heading" className="text-lg font-semibold mt-0.5">
            {pending.length > 0
              ? `${pending.length} ${pending.length === 1 ? 'ad' : 'ads'} awaiting review`
              : 'Your recent posts'}
          </h2>
          <p className="text-sm text-[color:var(--color-ink-muted)] mt-1">
            {pending.length > 0
              ? 'Only you can see these until an admin approves them.'
              : 'These are visible to everyone.'}
          </p>
        </div>
        <Link
          href="/account/listings"
          className="text-sm font-medium text-[color:var(--color-ruby)] hover:underline"
        >
          Manage all →
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.slice(0, 3).map((listing) => {
          const isDraft = listing.post_status !== 'publish';
          // Pending/draft listings aren't reachable on the public detail
          // route, so the wrapper routes to the account listings manager
          // instead of 404-ing. Render the card without its own <Link> so
          // we don't produce nested <a> elements.
          return isDraft ? (
            <Link
              key={listing.id}
              href="/account/listings"
              className="relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ruby)] rounded-[var(--radius-lg)]"
            >
              <span className="absolute top-2 left-2 z-10 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[oklch(95%_0.06_75)] text-[oklch(38%_0.12_60)] shadow-sm">
                {listing.post_status === 'pending' ? 'Pending review' : 'Draft'}
              </span>
              <ListingCard listing={listing} noLink />
            </Link>
          ) : (
            <ListingCard key={listing.id} listing={listing} />
          );
        })}
      </div>
    </section>
  );
}
