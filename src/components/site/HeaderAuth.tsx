'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { PostAdButton } from './PostAdButton';

export function HeaderAuth() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:block h-9 w-20 rounded-full bg-[color:var(--color-surface-sunken)] animate-pulse" />
        <div className="h-10 w-28 rounded-full bg-[color:var(--color-surface-sunken)] animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/login"
          className="hidden sm:inline-flex items-center px-3 h-9 rounded-full text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface-sunken)] transition-colors"
        >
          Log in
        </Link>
        <PostAdButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <PostAdButton />
      <UserMenu
        displayName={user.display_name}
        email={user.email}
        avatar={user.avatar}
        onLogout={() => {
          void logout();
        }}
      />
    </div>
  );
}

interface UserMenuProps {
  displayName: string;
  email: string;
  avatar: string;
  onLogout(): void;
}

function UserMenu({ displayName, email, avatar, onLogout }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('') || displayName.slice(0, 2).toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`inline-flex items-center gap-2 h-10 pl-1 pr-3 rounded-full border transition-colors ${
          open
            ? 'border-[color:var(--color-ruby)] bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]'
            : 'border-[color:var(--color-border)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-ink)]'
        }`}
      >
        <Avatar avatar={avatar} initials={initials} />
        <span className="hidden md:inline text-sm font-semibold max-w-[10ch] truncate">
          {displayName}
        </span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] shadow-[var(--shadow-lift)] overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-[color:var(--color-border)]">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-[color:var(--color-ink-subtle)] truncate">{email}</p>
          </div>
          <ul className="py-1.5">
            {ACCOUNT_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface-sunken)]"
                >
                  <span className="text-base" aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-[color:var(--color-border)] py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onLogout();
                router.push('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ruby)]"
            >
              <span aria-hidden>↩</span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const ACCOUNT_LINKS = [
  { href: '/account', label: 'Overview', icon: '◆' },
  { href: '/account/listings', label: 'My listings', icon: '☰' },
  { href: '/account/messages', label: 'Messages', icon: '✉' },
  { href: '/account/favorites', label: 'Favorites', icon: '♥' },
  { href: '/account/profile', label: 'Profile', icon: '☺' },
  { href: '/account/security', label: 'Security', icon: '⚙' },
];

function Avatar({ avatar, initials }: { avatar: string; initials: string }) {
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt=""
        width={32}
        height={32}
        unoptimized
        className="w-8 h-8 rounded-full"
      />
    );
  }
  return (
    <span className="inline-flex w-8 h-8 rounded-full items-center justify-center bg-[color:var(--color-ruby)] text-white text-xs font-bold">
      {initials}
    </span>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
