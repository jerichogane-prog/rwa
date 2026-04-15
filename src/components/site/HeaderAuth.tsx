'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';

export function HeaderAuth() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="h-10 w-28 rounded-full bg-[color:var(--color-surface-sunken)] animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden sm:inline-flex items-center text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
        >
          Log in
        </Link>
        <Link
          href="/post-ad"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-medium hover:bg-[color:var(--color-ruby-deep)] transition-colors"
        >
          Post an ad
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account"
        className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
      >
        {user.display_name}
      </Link>
      <Link
        href="/post-ad"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-medium hover:bg-[color:var(--color-ruby-deep)] transition-colors"
      >
        Post an ad
      </Link>
      <button
        type="button"
        onClick={() => {
          void logout();
        }}
        className="hidden md:inline-flex items-center text-xs text-[color:var(--color-ink-subtle)] hover:text-[color:var(--color-ruby)]"
      >
        Log out
      </button>
    </div>
  );
}
