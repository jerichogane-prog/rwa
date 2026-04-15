'use client';

import { useRouter } from 'next/navigation';
import type { TaxonomyNode } from '@/lib/wp';

interface LocationDropdownProps {
  states: TaxonomyNode[];
  activeSlug?: string;
  baseParams: Record<string, string | undefined>;
  keepCategory?: string;
}

const HOME_STATE = 'nevada';
const ALL_STATES = '__all__';

function buildHref(
  baseParams: Record<string, string | undefined>,
  override: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...baseParams, ...override })) {
    if (value !== undefined && value !== '') params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/listings?${qs}` : '/listings';
}

export function LocationDropdown({
  states,
  activeSlug,
  baseParams,
  keepCategory,
}: LocationDropdownProps) {
  const router = useRouter();
  const sorted = [...states].sort((a, b) => {
    if (a.slug === HOME_STATE) return -1;
    if (b.slug === HOME_STATE) return 1;
    return a.name.localeCompare(b.name);
  });

  // When nothing is in the URL we display Nevada in the select to mirror the
  // default applied server-side, but we leave the URL clean.
  const selected = activeSlug ?? HOME_STATE;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5">
      <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)] mb-3">
        State
      </h3>
      <div className="relative">
        <select
          aria-label="Filter by state"
          value={selected}
          onChange={(event) => {
            const value = event.target.value;
            const nextSlug = value === ALL_STATES ? undefined : value;
            router.push(
              buildHref(baseParams, {
                category: keepCategory,
                location: nextSlug,
                page: undefined,
              }),
            );
          }}
          className="w-full h-11 pl-3 pr-9 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] text-sm text-[color:var(--color-ink)] appearance-none focus:bg-[color:var(--color-surface-raised)] focus:ring-2 focus:ring-[color:var(--color-ruby)] cursor-pointer"
        >
          <option value={ALL_STATES}>All states</option>
          {sorted.map((state) => (
            <option key={state.id} value={state.slug}>
              {state.name}
              {state.slug === HOME_STATE ? ' (home)' : ''}
            </option>
          ))}
        </select>
        <ChevronDown />
      </div>
      {!activeSlug && (
        <p className="mt-2 text-[11px] text-[color:var(--color-ink-subtle)]">
          Showing Nevada by default — pick another state to broaden.
        </p>
      )}
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-ink-subtle)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
