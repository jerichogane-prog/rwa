'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { MenuItem } from '@/lib/wp';
import { normalizeMenuUrl as normalizeUrl } from './normalizeMenuUrl';

interface MobileNavProps {
  items: MenuItem[];
}

const BROWSE_LINKS = [
  { href: '/listings', label: 'All listings' },
  { href: '/listings?type=sell', label: 'For sale' },
  { href: '/listings?type=buy', label: 'Wanted' },
  { href: '/listings?type=rentlease', label: 'For rent' },
  { href: '/listings?type=lostfound', label: 'Lost & found' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/events', label: 'Events' },
  { href: '/help', label: 'Help & support' },
];

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface-sunken)] transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5" aria-hidden>
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-30 bg-[color:var(--color-ink)]/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav
            id="mobile-nav-panel"
            aria-label="Mobile navigation"
            className="lg:hidden fixed top-16 md:top-20 left-0 right-0 z-40 mx-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] shadow-[var(--shadow-lift)] p-3 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <ul className="flex flex-col">
              <li>
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)]">
                  Browse
                </p>
              </li>
              {BROWSE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface-sunken)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {items.length > 0 && (
                <>
                  <li>
                    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)]">
                      Menu
                    </p>
                  </li>
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={normalizeUrl(item.url)}
                        target={item.target || undefined}
                        className="block px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ink)]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
