import Link from 'next/link';
import type { TaxonomyNode } from '@/lib/wp';

interface CategoryGridProps {
  categories: TaxonomyNode[];
  limit?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  vehicles: 'M5 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3 13l1.5-5A2 2 0 0 1 6.4 6.5h11.2a2 2 0 0 1 1.9 1.5L21 13m-18 0h18m-18 0v3h2m14-3v3h-2',
  'real-estate': 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z',
  property: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z',
  jobs: 'M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Zm5-3h6a1 1 0 0 1 1 1v2H8V6a1 1 0 0 1 1-1Zm-5 7h16',
  electronics: 'M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3 14h8m-4-3v3',
  services: 'M14.5 4.5l5 5-9 9H5v-5.5l9.5-8.5Zm0 0 3 3',
  furniture: 'M4 10h16v7H4zm2 7v3m12-3v3M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3',
  fashion: 'M8 4 4 8l3 3h2v9h6v-9h2l3-3-4-4-2 2h-4L8 4Z',
  pets: 'M5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-4 15c-3 0-5-2-5-4.5S9 12 12 12s5 1.5 5 5-2 4.5-5 4.5Z',
  community: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m14-8a4 4 0 0 0 4-4m-9-5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm6 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  'for-sale': 'M7 7h10v10H7zM3 3l4 4m10 10 4 4M3 21l4-4m10-10 4-4',
};

const DEFAULT_ICON = 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z';

function iconFor(slug: string): string {
  return CATEGORY_ICONS[slug] ?? CATEGORY_ICONS[slug.split('-')[0]] ?? DEFAULT_ICON;
}

function totalCount(node: TaxonomyNode): number {
  const own = node.count ?? 0;
  const kids = (node.children ?? []).reduce((sum, c) => sum + totalCount(c), 0);
  return own + kids;
}

export function CategoryGrid({ categories, limit = 8 }: CategoryGridProps) {
  const tiles = categories.slice(0, limit);
  if (tiles.length === 0) return null;

  return (
    <section className="container-page mt-16 md:mt-24">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ruby)]">
            Browse
          </p>
          <h2 className="mt-1 section-title">Shop by category</h2>
        </div>
        <Link
          href="/categories"
          className="hidden sm:inline-flex text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)]"
        >
          All categories →
        </Link>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {tiles.map((cat) => {
          const count = totalCount(cat);
          return (
            <Link
              key={cat.id}
              href={`/listings?category=${encodeURIComponent(cat.slug)}`}
              className="group relative flex flex-col gap-4 p-5 rounded-[var(--radius-lg)] bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] hover:border-[color:var(--color-ruby)]/40 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]"
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby)] group-hover:bg-[color:var(--color-ruby)] group-hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={iconFor(cat.slug)} />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">{cat.name}</h3>
                {count > 0 && (
                  <p className="mt-0.5 text-xs text-[color:var(--color-ink-subtle)]">
                    {count.toLocaleString()} {count === 1 ? 'ad' : 'ads'}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
