'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { ListingSummary } from '@/lib/wp';

type Status = 'publish' | 'draft' | 'pending';
type MyListing = ListingSummary & { post_status: Status };

interface OwnerStatusBannerProps {
  sellerId: number | null;
  listingId: number;
}

export function OwnerStatusBanner({ sellerId, listingId }: OwnerStatusBannerProps) {
  const { user, authedFetch } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    if (!user || (sellerId !== null && sellerId !== user.id)) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    authedFetch<MyListing[]>('/my/listings')
      .then((list) => {
        if (cancelled) return;
        const match = list.find((l) => l.id === listingId);
        setStatus(match?.post_status ?? null);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user, sellerId, listingId, authedFetch]);

  if (!user || !status || status === 'publish') return null;

  const label = status === 'pending' ? 'Pending verification' : 'Draft';
  const copy =
    status === 'pending'
      ? 'This ad is waiting for admin review. Only you can see it until it\u2019s approved.'
      : 'This ad is saved as a draft and is not visible to anyone else yet.';

  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-start gap-3 rounded-[var(--radius-lg)] border border-[oklch(85%_0.1_75)] bg-[oklch(97%_0.04_75)] p-4 text-sm text-[oklch(38%_0.12_60)]"
    >
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[oklch(92%_0.1_75)] text-[oklch(32%_0.14_60)]">
        {label}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[color:var(--color-ink)]">You&rsquo;re viewing your own listing.</p>
        <p className="mt-0.5">{copy}</p>
      </div>
      <Link
        href="/account/listings"
        className="text-sm font-semibold text-[color:var(--color-ruby)] hover:underline self-center"
      >
        Manage →
      </Link>
    </div>
  );
}
