import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchListings } from '@/lib/wp';
import type { ListingsQuery } from '@/lib/wp';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { Pagination } from '@/components/listings/Pagination';
import { AdSlot } from '@/components/ads/AdSlot';
import { SortMenu, DEFAULT_SORT, resolveSort } from '@/components/listings/SortMenu';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, itemListSchema } from '@/lib/seo/schema';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Jobs in Elko, Nevada',
  description:
    'Browse local job openings in Elko and northeastern Nevada — positions posted by Ruby Mountain-area employers across every industry.',
  alternates: { canonical: '/jobs' },
  openGraph: {
    title: 'Jobs in Elko, Nevada · Ruby Want Ads',
    description: 'Local job openings posted by Elko-area employers.',
    type: 'website',
  },
};

interface JobsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const page = Number(first(params.page) ?? 1) || 1;
  const sort = resolveSort(first(params.sort) ?? DEFAULT_SORT);

  const { items, total, totalPages } = await fetchListings({
    page,
    per_page: 18,
    type: 'job',
    orderby: sort.orderby as ListingsQuery['orderby'],
    order: sort.order,
  }).catch(() => ({ items: [], total: 0, totalPages: 0 }));

  return (
    <div className="container-page pt-10 md:pt-14 pb-16">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Jobs', url: '/jobs' },
        ])}
        id="breadcrumb-ld"
      />
      {items.length > 0 && (
        <JsonLd data={itemListSchema(items, 'Ruby Want Ads jobs')} id="itemlist-ld" />
      )}

      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <span className="text-[color:var(--color-ink)]">Jobs</span>
      </nav>

      <header className="mt-4 mb-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--color-ruby)]">
          Hiring locally
        </p>
        <h1 className="section-title mt-1">Open positions in the Ruby Mountains</h1>
        <p className="mt-3 text-base text-[color:var(--color-ink-muted)]">
          {total.toLocaleString()} {total === 1 ? 'position' : 'positions'} posted by Elko-area
          employers.
        </p>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
          Hiring?{' '}
          <Link
            href="/post-ad"
            className="font-semibold text-[color:var(--color-ruby)] hover:underline"
          >
            Post a job
          </Link>{' '}
          and pick the &ldquo;Job&rdquo; ad type.
        </p>
      </header>

      <div className="mb-4 flex justify-end">
        <SortMenu active={sort.value} pathname="/jobs" baseParams={{}} />
      </div>
      <AdSlot slot="listings-banner" variant="banner" className="mb-8" />
      <ListingGrid
        listings={items}
        emptyMessage="No open positions right now. Check back soon."
      />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseHref={`/jobs${page > 1 ? `?page=${page}` : ''}`}
      />
    </div>
  );
}
