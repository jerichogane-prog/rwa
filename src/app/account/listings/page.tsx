'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { ListingSummary } from '@/lib/wp';

type Status = 'publish' | 'draft' | 'pending';
type MyListing = ListingSummary & { post_status: Status };
type Filter = 'all' | Status;

const TABS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'publish', label: 'Live' },
  { value: 'pending', label: 'Pending review' },
  { value: 'draft', label: 'Drafts' },
];

export default function MyListingsPage() {
  return (
    <AccountShell
      title="My listings"
      description="Track and manage every ad you've posted."
      actions={
        <Link
          href="/post-ad"
          className="inline-flex items-center px-4 py-2 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] transition-colors"
        >
          Post a new ad
        </Link>
      }
    >
      <ListingsPanel />
    </AccountShell>
  );
}

function ListingsPanel() {
  const { user, authedFetch } = useAuth();
  const [listings, setListings] = useState<MyListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (!user) return;
    authedFetch<MyListing[]>('/my/listings')
      .then(setListings)
      .catch((err: Error) => setError(err.message));
  }, [user, authedFetch]);

  const counts = useMemo(() => {
    const initial: Record<Filter, number> = { all: 0, publish: 0, pending: 0, draft: 0 };
    if (!listings) return initial;
    initial.all = listings.length;
    for (const l of listings) initial[l.post_status]++;
    return initial;
  }, [listings]);

  const filtered = useMemo(() => {
    if (!listings) return null;
    return filter === 'all' ? listings : listings.filter((l) => l.post_status === filter);
  }, [listings, filter]);

  return (
    <AccountSection title="Your ads" description="Pending ads are not visible to buyers until an admin approves them.">
      <div className="-mx-2 px-2 mb-5 flex flex-wrap gap-1 border-b border-[color:var(--color-border)] pb-3">
        {TABS.map((tab) => {
          const active = filter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active
                  ? 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]'
                  : 'text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ink)]'
              }`}
            >
              {tab.label}
              <span className="text-xs text-[color:var(--color-ink-subtle)]">{counts[tab.value]}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)] mb-3">
          {error}
        </p>
      )}

      {!filtered ? (
        <ul className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="h-16 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] animate-pulse"
            />
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[color:var(--color-ink-muted)]">No listings in this view.</p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-border)]">
          {filtered.map((listing) => (
            <li key={listing.id} className="flex items-center gap-4 py-3">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/listing/${listing.slug}`}
                  className="font-semibold hover:text-[color:var(--color-ruby)] line-clamp-1"
                >
                  {listing.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-ink-subtle)]">
                  <StatusBadge status={listing.post_status} />
                  <span>{new Date(listing.date).toLocaleDateString()}</span>
                </div>
              </div>
              {listing.price > 0 && (
                <span className="text-sm font-semibold text-[color:var(--color-ruby)]">
                  ${listing.price.toLocaleString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </AccountSection>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const config: Record<Status, { label: string; cls: string }> = {
    publish: { label: 'Live', cls: 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]' },
    pending: { label: 'Pending review', cls: 'bg-[oklch(95%_0.06_75)] text-[oklch(38%_0.12_60)]' },
    draft: { label: 'Draft', cls: 'bg-[color:var(--color-surface-sunken)] text-[color:var(--color-ink-muted)]' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${c.cls}`}>
      {c.label}
    </span>
  );
}
