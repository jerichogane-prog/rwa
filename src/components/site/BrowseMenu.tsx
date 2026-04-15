'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface BrowseMenuItem {
  href: string;
  label: string;
  description: string;
  icon: string;
}

const ITEMS: BrowseMenuItem[] = [
  { href: '/listings', label: 'All listings', description: 'Everything across the marketplace', icon: '◇' },
  { href: '/listings?type=sell', label: 'For sale', description: 'Stuff people are selling', icon: '$' },
  { href: '/listings?type=buy', label: 'Wanted', description: 'Buyers looking for items', icon: '?' },
  { href: '/listings?type=rentlease', label: 'For rent', description: 'Rent or lease offers', icon: '◧' },
  { href: '/listings?type=lostfound', label: 'Lost & found', description: 'Lost something? Found something?', icon: '!' },
  { href: '/jobs', label: 'Jobs', description: 'Local job openings', icon: '☷' },
  { href: '/events', label: 'Events', description: 'What\u2019s happening locally', icon: '★' },
  { href: '/help', label: 'Help & support', description: 'Guides, safety tips, and contact info', icon: '?' },
];

export function BrowseMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  return (
    <div ref={containerRef} className="hidden md:block relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-semibold transition-colors ${
          open
            ? 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]'
            : 'text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ink)]'
        }`}
      >
        <BrowseIcon />
        Browse
        <Chevron open={open} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Browse by type"
          className="absolute left-0 top-full mt-2 w-72 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] shadow-[var(--shadow-lift)] overflow-hidden z-50"
        >
          <ul className="py-1.5">
            {ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  role="menuitem"
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-[color:var(--color-surface-sunken)]"
                >
                  <span
                    aria-hidden
                    className="inline-flex w-7 h-7 mt-0.5 items-center justify-center rounded-full bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby)] text-sm font-bold flex-shrink-0"
                  >
                    {item.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[color:var(--color-ink)]">
                      {item.label}
                    </span>
                    <span className="block text-xs text-[color:var(--color-ink-muted)] mt-0.5">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BrowseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
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
