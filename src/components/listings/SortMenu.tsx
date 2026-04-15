'use client';

import { useRouter } from 'next/navigation';
import { DEFAULT_SORT, SORT_OPTIONS } from './sort';

export { DEFAULT_SORT, SORT_OPTIONS, resolveSort } from './sort';
export type { SortOption } from './sort';

interface SortMenuProps {
  active: string;
  /** All existing query params to preserve when switching sort. */
  baseParams: Record<string, string | undefined>;
  /** Base path (e.g. /listings, /events, /jobs). */
  pathname?: string;
}

export function SortMenu({ active, baseParams, pathname = '/listings' }: SortMenuProps) {
  const router = useRouter();
  return (
    <div className="inline-flex items-center gap-2">
      <label
        htmlFor="sort-by"
        className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)]"
      >
        Sort
      </label>
      <div className="relative">
        <select
          id="sort-by"
          value={active}
          onChange={(event) => {
            const next = event.target.value;
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(baseParams)) {
              if (value !== undefined && value !== '') params.set(key, value);
            }
            if (next !== DEFAULT_SORT) params.set('sort', next);
            else params.delete('sort');
            params.delete('page');
            const qs = params.toString();
            router.push(qs ? `${pathname}?${qs}` : pathname);
          }}
          className="h-9 pl-3 pr-8 rounded-full bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] text-sm font-medium appearance-none focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[color:var(--color-ink-subtle)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
