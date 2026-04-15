'use client';

import { useState } from 'react';
import { useFavorites } from '@/lib/auth/favorites';
import { useAuth } from '@/lib/auth/AuthProvider';

interface FavoriteButtonProps {
  listingId: number;
  variant?: 'card' | 'page';
}

export function FavoriteButton({ listingId, variant = 'card' }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const [busy, setBusy] = useState(false);
  const fav = isFavorite(listingId);

  const sizeCls = variant === 'card' ? 'w-9 h-9' : 'w-11 h-11';

  if (!user) {
    return (
      <a
        href="/login"
        aria-label="Log in to save"
        className={`absolute top-3 right-3 ${sizeCls} z-10 inline-flex items-center justify-center rounded-full bg-[color:var(--color-surface-raised)]/90 backdrop-blur-sm border border-[color:var(--color-border)] text-[color:var(--color-ink-subtle)] hover:text-[color:var(--color-ruby)] transition-colors`}
        onClick={(e) => e.stopPropagation()}
      >
        <HeartIcon filled={false} />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (busy) return;
        setBusy(true);
        await toggle(listingId);
        setBusy(false);
      }}
      aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={fav}
      className={`absolute top-3 right-3 ${sizeCls} z-10 inline-flex items-center justify-center rounded-full bg-[color:var(--color-surface-raised)]/90 backdrop-blur-sm border transition-colors ${
        fav
          ? 'border-[color:var(--color-ruby)] text-[color:var(--color-ruby)]'
          : 'border-[color:var(--color-border)] text-[color:var(--color-ink-subtle)] hover:text-[color:var(--color-ruby)]'
      }`}
      disabled={busy}
    >
      <HeartIcon filled={fav} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21Z" />
    </svg>
  );
}
