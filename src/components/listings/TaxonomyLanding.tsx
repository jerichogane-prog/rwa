import Link from 'next/link';
import type { ListingSummary, TaxonomyNode } from '@/lib/wp';
import { ListingGrid } from './ListingGrid';
import { Pagination } from './Pagination';

interface TaxonomyLandingProps {
  kind: 'category' | 'location' | 'tag';
  term: TaxonomyNode;
  listings: ListingSummary[];
  currentPage: number;
  totalPages: number;
  total: number;
  baseHref: string;
}

const KIND_META: Record<TaxonomyLandingProps['kind'], { label: string; plural: string; listingsParam: string }> = {
  category: { label: 'Category', plural: 'Categories', listingsParam: 'category' },
  location: { label: 'Location', plural: 'Locations', listingsParam: 'location' },
  tag: { label: 'Tag', plural: 'Tags', listingsParam: 'tag' },
};

export function TaxonomyLanding({ kind, term, listings, currentPage, totalPages, total, baseHref }: TaxonomyLandingProps) {
  const meta = KIND_META[kind];
  const children = term.children ?? [];

  return (
    <div className="container-page pt-10 md:pt-14 pb-16">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <Link href="/listings" className="hover:text-[color:var(--color-ink)]">
          Listings
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <span className="text-[color:var(--color-ink)]">{term.name}</span>
      </nav>

      <header className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--color-ruby)]">
            {meta.label}
          </p>
          <h1 className="section-title mt-1">{term.name}</h1>
          <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
            {total.toLocaleString()} {total === 1 ? 'listing' : 'listings'}
          </p>
          {term.description && (
            <p className="mt-3 text-sm max-w-2xl text-[color:var(--color-ink-muted)]">
              {term.description}
            </p>
          )}
        </div>
        <Link
          href={`/listings?${meta.listingsParam}=${encodeURIComponent(term.slug)}`}
          className="text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)]"
        >
          Full filter view →
        </Link>
      </header>

      {children.length > 0 && (
        <section className="mb-10">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[color:var(--color-ink-subtle)] mb-3">
            Browse sub-{meta.plural.toLowerCase()}
          </p>
          <ul className="flex flex-wrap gap-2">
            {children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/${kind}/${child.slug}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] text-sm hover:border-[color:var(--color-ruby)]/40 hover:text-[color:var(--color-ruby)] transition-colors"
                >
                  {child.name}
                  {child.count !== undefined && child.count > 0 && (
                    <span className="text-xs text-[color:var(--color-ink-subtle)]">
                      {child.count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ListingGrid listings={listings} />
      <Pagination currentPage={currentPage} totalPages={totalPages} baseHref={baseHref} />
    </div>
  );
}
