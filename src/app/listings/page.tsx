import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchCategories, fetchListings, fetchLocations, AD_TYPE_LABELS } from '@/lib/wp';
import type { AdType, ListingsQuery } from '@/lib/wp';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { Pagination } from '@/components/listings/Pagination';
import { ListingsSidebar } from '@/components/listings/ListingsSidebar';
import { AdSlot } from '@/components/ads/AdSlot';
import { SortMenu } from '@/components/listings/SortMenu';
import { DEFAULT_SORT, resolveSort } from '@/components/listings/sort';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, itemListSchema } from '@/lib/seo/schema';
import type { ActiveFilters } from '@/components/listings/FilterBar';

const VALID_TYPES: AdType[] = ['sell', 'buy', 'rentlease', 'lostfound', 'job', 'event'];

function asType(value: string | undefined): AdType | undefined {
  return value && (VALID_TYPES as string[]).includes(value) ? (value as AdType) : undefined;
}

const TYPE_BLURBS: Record<AdType, string> = {
  sell: 'Items local sellers are listing right now.',
  buy: 'Buyers in the area looking for specific items — got one to spare?',
  rentlease: 'Rentals and leases across northeastern Nevada.',
  lostfound: 'Lost something or spotted a stray? Browse the latest reports.',
  job: 'Open positions from local employers.',
  event: 'What\u2019s happening around Elko and beyond.',
};

function typeBlurb(type: AdType): string {
  return TYPE_BLURBS[type];
}

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
  const type = asType(first(params.type));
  const location = first(params.location);
  const bits = [
    type && AD_TYPE_LABELS[type].toLowerCase(),
    search && `“${search}”`,
    category && `in ${category}`,
  ].filter(Boolean);
  const suffix = bits.length ? ` · ${bits.join(' ')}` : '';
  const description = search
    ? `Search Ruby Want Ads for “${search}” across Elko and northeastern Nevada classifieds.`
    : type
      ? `Browse ${AD_TYPE_LABELS[type].toLowerCase()} listings on Ruby Want Ads — Elko, Nevada classifieds.`
      : 'Browse every active classified listing across northeastern Nevada — Elko, Spring Creek, Wells, and beyond.';

  // Filtered listing URLs canonicalize to the base /listings page to avoid
  // duplicate-content competition across every filter combination. The one
  // exception is the category facet, which has its own dedicated URL.
  const canonical = category
    ? `/category/${category}`
    : location
      ? `/listings?location=${location}`
      : '/listings';

  return {
    title: `Browse listings${suffix}`,
    description,
    alternates: { canonical },
  };
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const page = toNumber(first(params.page)) ?? 1;
  const search = first(params.search);
  const category = first(params.category);
  const type = asType(first(params.type));
  const explicitLocation = first(params.location);
  const featured = toBool(first(params.featured));
  const minPrice = toNumber(first(params.min_price));
  const maxPrice = toNumber(first(params.max_price));
  const sortValue = first(params.sort) ?? DEFAULT_SORT;
  const sort = resolveSort(sortValue);

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
      type,
      featured,
      min_price: minPrice,
      max_price: maxPrice,
      orderby: sort.orderby as ListingsQuery['orderby'],
      order: sort.order,
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
    type,
    min_price: minPrice,
    max_price: maxPrice,
  })) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  if (featured) query.set('featured', '1');
  const baseHref = query.toString() ? `/listings?${query.toString()}` : '/listings';

  const heading = type ? AD_TYPE_LABELS[type] : 'Browse listings';
  const subheading = type
    ? typeBlurb(type)
    : 'Every active classified across northeastern Nevada.';

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
          {type && (
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--color-ruby)]">
              Listing type
            </p>
          )}
          <h1 className="section-title mt-1">{heading}</h1>
          <p className="mt-2 text-sm text-[color:var(--color-ink-muted)] max-w-xl">
            {total.toLocaleString()} {total === 1 ? 'listing' : 'listings'}
            {activeFilters.search ? ` matching “${activeFilters.search}”` : ''} · {subheading}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <SortMenu
            active={sort.value}
            pathname="/listings"
            baseParams={{
              search,
              category,
              location: explicitLocation,
              type,
              min_price: minPrice !== undefined ? String(minPrice) : undefined,
              max_price: maxPrice !== undefined ? String(maxPrice) : undefined,
              featured: featured ? '1' : undefined,
            }}
          />
          {(activeFilters.search || activeFilters.category || activeFilters.location || activeFilters.featured || type) && (
            <Link
              href="/listings"
              className="text-sm font-medium text-[color:var(--color-ruby)] hover:underline"
            >
              Clear all filters
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ListingsSidebar
          categories={categories}
          locations={locations}
          activeFilters={activeFilters}
          activeType={type}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />

        <div className="min-w-0">
          <AdSlot slot="listings-banner" variant="banner" className="mb-8" />
          <ListingGrid listings={items} />
          <Pagination currentPage={page} totalPages={totalPages} baseHref={baseHref} />
        </div>
      </div>
    </div>
  );
}
