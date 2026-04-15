import Link from 'next/link';
import type { TaxonomyNode } from '@/lib/wp';

interface StateBarProps {
  /** Top-level location terms (states). */
  states: TaxonomyNode[];
  activeSlug?: string;
  baseParams: Record<string, string | undefined>;
}

const HOME_STATE = 'nevada';

function buildHref(base: Record<string, string | undefined>, override: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...base, ...override })) {
    if (value !== undefined && value !== '') params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/listings?${qs}` : '/listings';
}

export function StateBar({ states, activeSlug, baseParams }: StateBarProps) {
  if (states.length === 0) return null;

  // Pull Nevada to the front, keep alphabetical order otherwise.
  const sorted = [...states].sort((a, b) => {
    if (a.slug === HOME_STATE) return -1;
    if (b.slug === HOME_STATE) return 1;
    return a.name.localeCompare(b.name);
  });

  const effectiveActive = activeSlug ?? HOME_STATE;

  return (
    <nav aria-label="Filter by state" className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)]">
          State
        </span>
        {!activeSlug && (
          <span className="text-[10px] tracking-wider uppercase text-[color:var(--color-ruby)] font-semibold">
            · Showing Nevada by default
          </span>
        )}
      </div>
      <ul className="flex flex-wrap gap-1.5">
        <li>
          <Link
            href={buildHref(baseParams, { location: undefined, page: undefined })}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !activeSlug
                ? 'border border-transparent bg-[color:var(--color-ink)] text-white'
                : 'border border-[color:var(--color-border)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-ruby)] hover:text-[color:var(--color-ruby)]'
            }`}
          >
            All states
          </Link>
        </li>
        {sorted.map((state) => {
          const isActive = effectiveActive === state.slug;
          const isHome = state.slug === HOME_STATE && !activeSlug;
          return (
            <li key={state.id}>
              <Link
                href={buildHref(baseParams, { location: state.slug, page: undefined })}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[color:var(--color-ruby)] text-white'
                    : 'border border-[color:var(--color-border)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-ruby)] hover:text-[color:var(--color-ruby)]'
                }`}
              >
                {state.name}
                {isHome && <span aria-hidden>★</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
