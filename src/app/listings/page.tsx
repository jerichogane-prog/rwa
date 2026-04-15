import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchCategories, fetchListings, fetchLocations } from '@/lib/wp';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { Pagination } from '@/components/listings/Pagination';
import { ListingsSidebar } from '@/components/listings/ListingsSidebar';
import { StateBar } from '@/components/listings/StateBar';
import { AdSlot } from '@/components/ads/AdSlot';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, itemListSchema } from '@/lib/seo/schema';
import type { ActiveFilters } from '@/components/listings/FilterBar';

export const revalidate = 60;

interface ListingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toBool(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return value === '1' || value === 'true';
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function generateMetadata({ searchParams }: ListingsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const search = first(params.search);
  const category = first(params.category);
  const bits = [search && `“${search}”`, category && `in ${category}`].filter(Boolean);
  const suffix = bits.length ? ` · ${bits.join(' ')}` : '';
  return {
    title: `Browse listings${suffix}`,
    description: 'Browse every active classified listing across Northeastern Nevada.',
  };
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const page = toNumber(first(params.page)) ?? 1;
  const search = first(params.search);
  const category = first(params.category);
  const explicitLocation = first(params.location);
  const featured = toBool(first(params.featured));
  const minPrice = toNumber(first(params.min_price));
  const maxPrice = toNumber(first(params.max_price));

  // Default the location to Nevada (the home state) when no other state and no
  // free-text search is in play. Lets visitors land on local results without
  // hiding the rest of the country — the StateBar lets them switch.
  const DEFAULT_LOCATION = 'nevada';
  const effectiveLocation = explicitLocation ?? (search ? undefined : DEFAULT_LOCATION);

  const [{ items, total, totalPages }, categories, locations] = await Promise.all([
    fetchListings({
      page,
      per_page: 18,
      search,
      category,
      location: effectiveLocation,
      featured,
      min_price: minPrice,
      max_price: maxPrice,
    }).catch(() => ({ items: [], total: 0, totalPages: 0 })),
    fetchCategories().catch(() => []),
    fetchLocations().catch(() => []),
  ]);

  const activeFilters: ActiveFilters = {
    search,
    category,
    location: effectiveLocation,
    featured,
  };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({
    search,
    category,
    location: effectiveLocation,
    min_price: minPrice,
    max_price: maxPrice,
  })) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  if (featured) query.set('featured', '1');
  const baseHref = query.toString() ? `/listings?${query.toString()}` : '/listings';

  // The locations endpoint already returns states at the top level with cities
  // nested as children, so the array is the state list as-is.
  const states = locations;
  const stateBarParams: Record<string, string | undefined> = {
    search,
    category,
    min_price: minPrice !== undefined ? String(minPrice) : undefined,
    max_price: maxPrice !== undefined ? String(maxPrice) : undefined,
    featured: featured ? '1' : undefined,
  };

  return (
    <div className="container-page pt-10 md:pt-14 pb-16">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Listings', url: '/listings' },
        ])}
        id="breadcrumb-ld"
      />
      {items.length > 0 && (
        <JsonLd data={itemListSchema(items, 'Ruby Want Ads listings')} id="itemlist-ld" />
      )}
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <span className="text-[color:var(--color-ink)]">Listings</span>
      </nav>

      <header className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Browse listings</h1>
          <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
            {total.toLocaleString()} {total === 1 ? 'listing' : 'listings'}
            {activeFilters.search ? ` matching “${activeFilters.search}”` : ''}
          </p>
        </div>
        {(activeFilters.search || activeFilters.category || activeFilters.location || activeFilters.featured) && (
          <Link
            href="/listings"
            className="text-sm font-medium text-[color:var(--color-ruby)] hover:underline"
          >
            Clear all filters
          </Link>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ListingsSidebar
          categories={categories}
          locations={locations}
          activeFilters={activeFilters}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />

        <div className="min-w-0">
          <StateBar
            states={states}
            activeSlug={explicitLocation}
            baseParams={stateBarParams}
          />
          <AdSlot slot="listings-banner" variant="banner" className="mb-8" />
          <ListingGrid listings={items} />
          <Pagination currentPage={page} totalPages={totalPages} baseHref={baseHref} />
        </div>
      </div>
    </div>
  );
}
