'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { ListingSummary } from '@/lib/wp';

type MyListing = ListingSummary & { post_status: 'publish' | 'draft' | 'pending' };

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, authedFetch } = useAuth();
  const [listings, setListings] = useState<MyListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    authedFetch<MyListing[]>('/my/listings')
      .then(setListings)
      .catch((err: Error) => setError(err.message));
  }, [user, authedFetch]);

  if (loading || !user) {
    return (
      <div className="container-page py-16">
        <div className="h-6 w-40 bg-[color:var(--color-surface-sunken)] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container-page pt-10 md:pt-14 pb-16">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <span className="text-[color:var(--color-ink)]">Account</span>
      </nav>

      <header className="mt-4 mb-8 flex flex-wrap items-center gap-5">
        {user.avatar && (
          <Image
            src={user.avatar}
            alt=""
            width={64}
            height={64}
            unoptimized
            className="w-16 h-16 rounded-full"
          />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="section-title" style={{ fontSize: '2.25rem' }}>
            Welcome, {user.display_name}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
            {user.email} · Member since{' '}
            {new Date(user.member_since).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/post-ad"
            className="inline-flex items-center px-4 py-2 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)]"
          >
            Post a new ad
          </Link>
          <button
            type="button"
            onClick={() => {
              void logout().then(() => router.push('/'));
            }}
            className="text-sm text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)]"
          >
            Log out
          </button>
        </div>
      </header>

      <section>
        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Your listings</h2>
        {error && (
          <p role="alert" className="mt-3 text-sm text-[color:var(--color-ruby-deep)]">
            {error}
          </p>
        )}
        {!listings ? (
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <p className="mt-4 text-sm text-[color:var(--color-ink-muted)]">
            You haven&apos;t posted any listings yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[color:var(--color-border)] rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)]">
            {listings.map((listing) => (
              <li key={listing.id} className="flex items-center gap-4 p-4">
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
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: MyListing['post_status'] }) {
  const config: Record<MyListing['post_status'], { label: string; cls: string }> = {
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
