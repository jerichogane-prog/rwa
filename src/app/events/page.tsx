import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchListings } from '@/lib/wp';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { Pagination } from '@/components/listings/Pagination';
import { AdSlot } from '@/components/ads/AdSlot';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, itemListSchema } from '@/lib/seo/schema';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Events',
  description: 'Local events posted by the Ruby Want Ads community across northeastern Nevada.',
};

interface EventsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const page = Number(first(params.page) ?? 1) || 1;

  const { items, total, totalPages } = await fetchListings({
    page,
    per_page: 18,
    type: 'event',
  }).catch(() => ({ items: [], total: 0, totalPages: 0 }));

  return (
    <div className="container-page pt-10 md:pt-14 pb-16">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Events', url: '/events' },
        ])}
        id="breadcrumb-ld"
      />
      {items.length > 0 && (
        <JsonLd data={itemListSchema(items, 'Ruby Want Ads events')} id="itemlist-ld" />
      )}

      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <span className="text-[color:var(--color-ink)]">Events</span>
      </nav>

      <header className="mt-4 mb-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--color-ruby)]">
          What&apos;s on
        </p>
        <h1 className="section-title mt-1">Events around Elko</h1>
        <p className="mt-3 text-base text-[color:var(--color-ink-muted)]">
          {total.toLocaleString()} {total === 1 ? 'event' : 'events'} posted by neighbors, venues,
          and organizers.
        </p>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
          Hosting one?{' '}
          <Link
            href="/post-ad"
            className="font-semibold text-[color:var(--color-ruby)] hover:underline"
          >
            Post your event
          </Link>{' '}
          and pick the &ldquo;Event&rdquo; ad type.
        </p>
      </header>

      <AdSlot slot="listings-banner" variant="banner" className="mb-8" />
      <ListingGrid
        listings={items}
        emptyMessage="No upcoming events posted yet. Be the first to add one."
      />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseHref={`/events${page > 1 ? `?page=${page}` : ''}`}
      />
    </div>
  );
}
