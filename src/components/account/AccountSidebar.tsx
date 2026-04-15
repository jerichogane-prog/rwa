'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUnreadMessages } from '@/lib/auth/useUnreadMessages';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const ICONS = {
  overview: (
    <path d="M3 12 12 4l9 8M5 10v10h4v-6h6v6h4V10" />
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </>
  ),
  listings: (
    <>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </>
  ),
  messages: (
    <path d="M4 5h16v11H8l-4 4V5Z" />
  ),
  favorites: (
    <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21Z" />
  ),
  notifications: (
    <>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  security: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
} as const;

const NAV: NavItem[] = [
  { href: '/account', label: 'Overview', icon: ICONS.overview },
  { href: '/account/profile', label: 'Profile', icon: ICONS.profile },
  { href: '/account/listings', label: 'My listings', icon: ICONS.listings },
  { href: '/account/messages', label: 'Messages', icon: ICONS.messages },
  { href: '/account/favorites', label: 'Favorites', icon: ICONS.favorites },
  { href: '/account/notifications', label: 'Notifications', icon: ICONS.notifications },
  { href: '/account/security', label: 'Security', icon: ICONS.security },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { count: unread } = useUnreadMessages();
  return (
    <nav aria-label="Account navigation" className="lg:sticky lg:top-28 lg:self-start">
      <ul className="grid gap-1 lg:gap-0.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-2">
        {NAV.map((item) => {
          const active = item.href === '/account'
            ? pathname === '/account'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badge =
            item.badge ?? (item.href === '/account/messages' && unread > 0 ? String(unread) : undefined);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]'
                    : 'text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ink)]'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {item.icon}
                </svg>
                <span className="truncate">{item.label}</span>
                {badge && (
                  <span
                    className={`ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold tracking-wider ${
                      active
                        ? 'bg-[color:var(--color-ruby)] text-white'
                        : 'bg-[color:var(--color-ruby)] text-white'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
