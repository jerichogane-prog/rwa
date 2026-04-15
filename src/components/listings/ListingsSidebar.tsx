import Link from 'next/link';
import type { AdType, TaxonomyNode } from '@/lib/wp';
import { SearchForm } from '@/components/search/SearchForm';
import { AdSlot } from '@/components/ads/AdSlot';
import { flattenTaxonomy } from '@/lib/taxonomy';
import type { ActiveFilters } from './FilterBar';
import { LocationDropdown } from './LocationDropdown';
import { AdTypeFilter } from './AdTypeFilter';

interface ListingsSidebarProps {
  categories: TaxonomyNode[];
  locations: TaxonomyNode[];
  activeFilters: ActiveFilters;
  activeType?: AdType;
  minPrice?: number;
  maxPrice?: number;
}

function buildHref(base: Record<string, string | undefined>, override: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...base, ...override })) {
    if (value !== undefined && value !== '') params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/listings?${qs}` : '/listings';
}

function countNodes(nodes: TaxonomyNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children ?? []), 0);
}

export function ListingsSidebar({
  categories,
  locations,
  activeFilters,
  activeType,
  minPrice,
  maxPrice,
}: ListingsSidebarProps) {
  const baseParams: Record<string, string | undefined> = {
    search: activeFilters.search,
    featured: activeFilters.featured ? '1' : undefined,
    type: activeType,
    min_price: minPrice !== undefined ? String(minPrice) : undefined,
    max_price: maxPrice !== undefined ? String(maxPrice) : undefined,
  };

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5">
        <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)] mb-3">
          Search
        </h3>
        <SearchForm
          categories={flattenTaxonomy(categories)}
          locations={flattenTaxonomy(locations)}
          variant="inline"
        />
      </div>

      <AdTypeFilter
        activeType={activeType}
        baseParams={{
          ...baseParams,
          type: undefined,
          category: activeFilters.category,
          location: activeFilters.location,
        }}
      />

      <FilterSection
        heading="Categories"
        terms={categories}
        activeSlug={activeFilters.category}
        paramName="category"
        baseParams={baseParams}
        keepKey="location"
        keepValue={activeFilters.location}
        maxVisible={countNodes(categories) > 20 ? 10 : undefined}
      />

      <LocationDropdown
        states={locations}
        activeSlug={activeFilters.location}
        baseParams={baseParams}
        keepCategory={activeFilters.category}
      />

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5">
        <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)] mb-3">
          Show only
        </h3>
        <Link
          href={buildHref(baseParams, {
            category: activeFilters.category,
            location: activeFilters.location,
            featured: activeFilters.featured ? undefined : '1',
          })}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeFilters.featured
              ? 'bg-[color:var(--color-ruby)] text-white border-[color:var(--color-ruby)]'
              : 'border-[color:var(--color-border-strong)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-ruby)] hover:text-[color:var(--color-ruby)]'
          }`}
        >
          <span aria-hidden>★</span> Featured only
        </Link>
      </div>

      <AdSlot slot="listings-sidebar" variant="square" />
    </aside>
  );
}

interface FilterSectionProps {
  heading: string;
  terms: TaxonomyNode[];
  activeSlug?: string;
  paramName: 'category' | 'location';
  baseParams: Record<string, string | undefined>;
  keepKey: 'category' | 'location';
  keepValue?: string;
  maxVisible?: number;
}

function FilterSection({
  heading,
  terms,
  activeSlug,
  paramName,
  baseParams,
  keepKey,
  keepValue,
  maxVisible,
}: FilterSectionProps) {
  if (terms.length === 0) return null;

  const flat: Array<{ slug: string; label: string; depth: number; count?: number }> = [];
  (function walk(nodes: TaxonomyNode[], depth: number) {
    for (const node of nodes) {
      flat.push({ slug: node.slug, label: node.name, depth, count: node.count });
      if (node.children?.length) walk(node.children, depth + 1);
    }
  })(terms, 0);

  const visible = maxVisible ? flat.slice(0, maxVisible) : flat;
  const hidden = maxVisible ? flat.length - visible.length : 0;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5">
      <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)] mb-3">
        {heading}
      </h3>
      <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
        <li>
          <Link
            href={buildHref(baseParams, { [paramName]: undefined, [keepKey]: keepValue })}
            className={`block text-sm px-2 py-1 rounded-[var(--radius-sm)] ${
              !activeSlug
                ? 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)] font-semibold'
                : 'text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ink)]'
            }`}
          >
            All {heading.toLowerCase()}
          </Link>
        </li>
        {visible.map((term) => (
          <li key={`${paramName}-${term.slug}`}>
            <Link
              href={buildHref(baseParams, {
                [paramName]: term.slug,
                [keepKey]: keepValue,
              })}
              className={`flex items-center justify-between gap-2 text-sm px-2 py-1 rounded-[var(--radius-sm)] ${
                activeSlug === term.slug
                  ? 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)] font-semibold'
                  : 'text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ink)]'
              }`}
              style={{ paddingLeft: `${0.5 + term.depth * 0.75}rem` }}
            >
              <span className="truncate">{term.label}</span>
              {term.count !== undefined && term.count > 0 && (
                <span className="text-xs text-[color:var(--color-ink-subtle)] whitespace-nowrap">
                  {term.count}
                </span>
              )}
            </Link>
          </li>
        ))}
        {hidden > 0 && (
          <li className="pt-1 text-xs text-[color:var(--color-ink-subtle)]">
            +{hidden} more — use search to narrow
          </li>
        )}
      </ul>
    </div>
  );
}
