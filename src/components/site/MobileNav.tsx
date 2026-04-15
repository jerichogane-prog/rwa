'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { MenuItem } from '@/lib/wp';

interface MobileNavProps {
  items: MenuItem[];
}

function normalizeUrl(url: string): string {
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL;
  if (!wpUrl || !url) return url || '/';
  try {
    const parsed = new URL(url);
    const wp = new URL(wpUrl);
    if (parsed.hostname === wp.hostname) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    // non-URL strings fall through
  }
  return url;
}

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
        className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface-sunken)] transition-colors"
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
            className="lg:hidden fixed top-20 md:top-24 left-0 right-0 z-40 mx-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] shadow-[var(--shadow-lift)] p-3"
          >
            <ul className="flex flex-col">
              <li>
                <Link
                  href="/listings"
                  className="block px-3 py-3 rounded-[var(--radius-md)] text-sm font-medium text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface-sunken)]"
                >
                  Browse listings
                </Link>
              </li>
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={normalizeUrl(item.url)}
                    target={item.target || undefined}
                    className="block px-3 py-3 rounded-[var(--radius-md)] text-sm font-medium text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ink)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
