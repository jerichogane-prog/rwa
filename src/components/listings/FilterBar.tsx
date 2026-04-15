import Link from 'next/link';
import type { TaxonomyNode } from '@/lib/wp';
import { SearchForm } from '@/components/search/SearchForm';
import { flattenTaxonomy } from '@/lib/taxonomy';

interface FilterBarProps {
  categories: TaxonomyNode[];
  locations: TaxonomyNode[];
  activeFilters: ActiveFilters;
}

export interface ActiveFilters {
  search?: string;
  category?: string;
  location?: string;
  featured?: boolean;
}

export function FilterBar({ categories, locations, activeFilters }: FilterBarProps) {
  const chips: { label: string; clearHref: string }[] = [];
  const buildClearHref = (omit: keyof ActiveFilters) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(activeFilters)) {
      if (key === omit || value === undefined || value === '' || value === false) continue;
      params.set(key, typeof value === 'boolean' ? '1' : String(value));
    }
    const qs = params.toString();
    return qs ? `/listings?${qs}` : '/listings';
  };

  if (activeFilters.search) {
    chips.push({ label: `“${activeFilters.search}”`, clearHref: buildClearHref('search') });
  }
  if (activeFilters.category) {
    const name = flattenTaxonomy(categories).find((c) => c.value === activeFilters.category)?.label;
    chips.push({ label: `Category: ${name ?? activeFilters.category}`, clearHref: buildClearHref('category') });
  }
  if (activeFilters.location) {
    const name = flattenTaxonomy(locations).find((c) => c.value === activeFilters.location)?.label;
    chips.push({ label: `Location: ${name ?? activeFilters.location}`, clearHref: buildClearHref('location') });
  }
  if (activeFilters.featured) {
    chips.push({ label: 'Featured only', clearHref: buildClearHref('featured') });
  }

  return (
    <div className="space-y-4">
      <SearchForm
        categories={flattenTaxonomy(categories)}
        locations={flattenTaxonomy(locations)}
        variant="inline"
      />
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[color:var(--color-ink-subtle)]">
            Filters:
          </span>
          {chips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.clearHref}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color:var(--color-surface-sunken)] text-xs font-medium text-[color:var(--color-ink)] hover:bg-[color:var(--color-ruby-soft)] hover:text-[color:var(--color-ruby-deep)]"
            >
              {chip.label}
              <span aria-hidden className="text-[color:var(--color-ink-subtle)]">
                ×
              </span>
            </Link>
          ))}
          <Link
            href="/listings"
            className="text-xs font-medium text-[color:var(--color-ruby)] hover:underline ml-1"
          >
            Clear all
          </Link>
        </div>
      )}
    </div>
  );
}
