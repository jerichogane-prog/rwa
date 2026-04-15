'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { PostAdButton } from '@/components/site/PostAdButton';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { ListingSummary } from '@/lib/wp';

type MyListing = ListingSummary & { post_status: 'publish' | 'draft' | 'pending' };

export default function AccountOverviewPage() {
  return (
    <AccountShell
      title="Account overview"
      description="A quick snapshot of your activity on Ruby Want Ads."
      actions={<PostAdButton label="Post a new ad" />}
    >
      <Overview />
    </AccountShell>
  );
}

function Overview() {
  const { user, authedFetch } = useAuth();
  const [listings, setListings] = useState<MyListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    authedFetch<MyListing[]>('/my/listings')
      .then(setListings)
      .catch((err: Error) => setError(err.message));
  }, [user, authedFetch]);

  const stats = useStats(listings);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Live listings" value={stats.live} accent="ruby" />
        <StatCard label="Pending review" value={stats.pending} accent="warm" />
        <StatCard label="Drafts" value={stats.draft} accent="muted" />
      </div>

      <AccountSection
        title="Recent listings"
        description="Your three most recently posted ads."
      >
        {error && (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">
            {error}
          </p>
        )}
        {!listings ? (
          <ul className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="h-14 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] animate-pulse"
              />
            ))}
          </ul>
        ) : listings.length === 0 ? (
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            You haven&apos;t posted any listings yet.{' '}
            <Link href="/post-ad" className="font-semibold text-[color:var(--color-ruby)] hover:underline">
              Post your first ad
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-border)]">
            {listings.slice(0, 3).map((listing) => (
              <li key={listing.id} className="py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/listing/${listing.slug}`}
                    className="font-semibold hover:text-[color:var(--color-ruby)] line-clamp-1"
                  >
                    {listing.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-[color:var(--color-ink-subtle)]">
                    {new Date(listing.date).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={listing.post_status} />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <Link
            href="/account/listings"
            className="text-sm font-medium text-[color:var(--color-ruby)] hover:underline"
          >
            Manage all listings →
          </Link>
        </div>
      </AccountSection>

      <AccountSection title="Quick actions">
        <ul className="grid gap-2 sm:grid-cols-2">
          {QUICK_ACTIONS.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] hover:border-[color:var(--color-ruby)]/40 hover:bg-[color:var(--color-surface-sunken)] transition-colors"
              >
                <span>
                  <span className="block text-sm font-semibold">{a.title}</span>
                  <span className="block text-xs text-[color:var(--color-ink-muted)]">{a.subtitle}</span>
                </span>
                <span className="text-[color:var(--color-ink-subtle)]" aria-hidden>›</span>
              </Link>
            </li>
          ))}
        </ul>
      </AccountSection>
    </div>
  );
}

const QUICK_ACTIONS = [
  { href: '/account/profile', title: 'Update your profile', subtitle: 'Display name, contact info, bio' },
  { href: '/account/security', title: 'Change password', subtitle: 'Keep your account secure' },
  { href: '/account/notifications', title: 'Notification preferences', subtitle: 'Choose what you hear about' },
  { href: '/post-ad', title: 'Post a new ad', subtitle: 'Reach buyers across the region' },
];

function useStats(listings: MyListing[] | null) {
  if (!listings) return { live: '—', pending: '—', draft: '—' };
  let live = 0;
  let pending = 0;
  let draft = 0;
  for (const l of listings) {
    if (l.post_status === 'publish') live++;
    else if (l.post_status === 'pending') pending++;
    else if (l.post_status === 'draft') draft++;
  }
  return { live: String(live), pending: String(pending), draft: String(draft) };
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: 'ruby' | 'warm' | 'muted' }) {
  const accentCls =
    accent === 'ruby'
      ? 'text-[color:var(--color-ruby)]'
      : accent === 'warm'
        ? 'text-[oklch(45%_0.13_60)]'
        : 'text-[color:var(--color-ink-muted)]';
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5">
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)]">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-[family-name:var(--font-archivo)] font-extrabold ${accentCls}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: MyListing['post_status'] }) {
  const config: Record<MyListing['post_status'], { label: string; cls: string }> = {
    publish: { label: 'Live', cls: 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]' },
    pending: { label: 'Pending', cls: 'bg-[oklch(95%_0.06_75)] text-[oklch(38%_0.12_60)]' },
    draft: { label: 'Draft', cls: 'bg-[color:var(--color-surface-sunken)] text-[color:var(--color-ink-muted)]' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${c.cls}`}>
      {c.label}
    </span>
  );
}
