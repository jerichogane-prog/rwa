'use client';

import { useEffect, useState } from 'react';

interface ViewCounterProps {
  listingId: number;
  initialCount: number;
}

const REST = `${process.env.NEXT_PUBLIC_WP_REST}/rwa/v1`;

export function ViewCounter({ listingId, initialCount }: ViewCounterProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    // Fire and forget — the WP side dedups per-IP so rapid remounts are free.
    fetch(`${REST}/listing/${listingId}/view`, { method: 'POST' })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { views: number } | null) => {
        if (body && typeof body.views === 'number') setCount(body.views);
      })
      .catch(() => {
        // Non-critical — the metric just won't tick this visit.
      });
  }, [listingId]);

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-ink-subtle)]">
      <EyeIcon />
      {count.toLocaleString()} {count === 1 ? 'view' : 'views'}
    </span>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
