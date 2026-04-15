'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { ListingCard } from '@/components/listings/ListingCard';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { ListingSummary } from '@/lib/wp';

export default function FavoritesPage() {
  return (
    <AccountShell title="Favorites" description="Listings you've saved to come back to.">
      <FavoritesPanel />
    </AccountShell>
  );
}

function FavoritesPanel() {
  const { user, authedFetch } = useAuth();
  const [items, setItems] = useState<ListingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    authedFetch<ListingSummary[]>('/my/favorites')
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }, [user, authedFetch]);

  if (!items) {
    return (
      <AccountSection title="Saved listings">
        {error ? (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">{error}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] animate-pulse"
              />
            ))}
          </div>
        )}
      </AccountSection>
    );
  }

  if (items.length === 0) {
    return (
      <AccountSection title="Saved listings">
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          Nothing saved yet. Tap the heart on any listing to bookmark it. Your saves show up here
          and follow you across devices.{' '}
          <Link
            href="/listings"
            className="font-semibold text-[color:var(--color-ruby)] hover:underline"
          >
            Browse listings →
          </Link>
        </p>
      </AccountSection>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[color:var(--color-ink-muted)]">
        {items.length} saved listing{items.length === 1 ? '' : 's'}.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
