import Link from 'next/link';
import type { AdType } from '@/lib/wp';

interface AdTypeFilterProps {
  activeType?: AdType;
  baseParams: Record<string, string | undefined>;
}

const OPTIONS: { value: AdType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'Any type', icon: '◇' },
  { value: 'sell', label: 'For sale', icon: '$' },
  { value: 'buy', label: 'Wanted', icon: '?' },
  { value: 'rentlease', label: 'For rent', icon: '◧' },
  { value: 'lostfound', label: 'Lost & found', icon: '!' },
  { value: 'job', label: 'Job', icon: '☷' },
  { value: 'event', label: 'Event', icon: '★' },
];

function buildHref(
  base: Record<string, string | undefined>,
  override: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...base, ...override })) {
    if (value !== undefined && value !== '') params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/listings?${qs}` : '/listings';
}

export function AdTypeFilter({ activeType, baseParams }: AdTypeFilterProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5">
      <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)] mb-3">
        Ad type
      </h3>
      <ul className="space-y-1">
        {OPTIONS.map((opt) => {
          const value = opt.value === 'all' ? undefined : opt.value;
          const isActive = (activeType ?? 'all') === opt.value;
          return (
            <li key={opt.value}>
              <Link
                href={buildHref(baseParams, { type: value, page: undefined })}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--radius-sm)] text-sm transition-colors ${
                  isActive
                    ? 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)] font-semibold'
                    : 'text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ink)]'
                }`}
              >
                <span
                  aria-hidden
                  className={`inline-flex w-5 h-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-[color:var(--color-ruby)] text-white'
                      : 'bg-[color:var(--color-surface-sunken)] text-[color:var(--color-ink-subtle)]'
                  }`}
                >
                  {opt.icon}
                </span>
                {opt.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
