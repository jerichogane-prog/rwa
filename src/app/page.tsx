import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { fetchCategories, fetchListings, fetchLocations } from '@/lib/wp';
import { ListingCard } from '@/components/listings/ListingCard';
import { SearchForm } from '@/components/search/SearchForm';
import { AdSlot } from '@/components/ads/AdSlot';
import { CategoryGrid } from '@/components/categories/CategoryGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { websiteSchema } from '@/lib/seo/schema';
import { flattenTaxonomy } from '@/lib/taxonomy';

export const revalidate = 60;

async function Hero() {
  const [categories, locations] = await Promise.all([
    fetchCategories().catch(() => []),
    fetchLocations().catch(() => []),
  ]);

  return (
    <section className="container-page pt-10 md:pt-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--color-ruby)]">
            Northeastern Nevada · Elko &amp; beyond
          </p>
          <h1 className="hero-display mt-5">
            Buy, sell &amp;<br />
            <span className="text-[color:var(--color-ruby)]">discover locally.</span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-ink-muted)] max-w-lg">
            Thousands of ads posted every day across vehicles, property, jobs, and everything in between — straight from your community.
          </p>

          <div className="mt-8">
            <SearchForm
              categories={flattenTaxonomy(categories)}
              locations={flattenTaxonomy(locations)}
            />
            <p className="mt-3 text-xs text-[color:var(--color-ink-subtle)]">
              Popular:{' '}
              <Link href="/listings?category=vehicles" className="hover:text-[color:var(--color-ruby)]">
                Vehicles
              </Link>
              {' · '}
              <Link href="/listings?category=real-estate" className="hover:text-[color:var(--color-ruby)]">
                Real estate
              </Link>
              {' · '}
              <Link href="/listings?category=jobs" className="hover:text-[color:var(--color-ruby)]">
                Jobs
              </Link>
              {' · '}
              <Link href="/listings?featured=1" className="hover:text-[color:var(--color-ruby)]">
                Featured
              </Link>
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] lg:aspect-[5/6] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lift)]">
            <Image
              src="/brand/elko.jpg"
              alt="Hilton Centennial Tower, downtown Elko, Nevada"
              fill
              priority
              sizes="(min-width: 1024px) 540px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-ink)]/65 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase opacity-80">
                Hilton Centennial Tower
              </p>
              <p className="mt-1 text-sm opacity-95">Downtown Elko, Nevada</p>
            </div>
          </div>

          <div className="hidden lg:block absolute -top-4 -left-4 w-24 h-24 rounded-full bg-[color:var(--color-ruby-soft)] -z-10" aria-hidden />
          <div className="hidden lg:block absolute -bottom-6 -right-6 w-32 h-32 rounded-[var(--radius-xl)] bg-[color:var(--color-ruby)]/10 -z-10" aria-hidden />
        </div>
      </div>
    </section>
  );
}

async function FeaturedSection() {
  const featured = await fetchListings({ featured: true, per_page: 4 }).catch(() => ({
    items: [],
    total: 0,
    totalPages: 0,
  }));

  if (featured.items.length === 0) return null;

  const hero = featured.items[0];
  const rest = featured.items.slice(1, 4);

  return (
    <section className="container-page mt-16 md:mt-24">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ruby)]">
            Featured
          </p>
          <h2 className="mt-1 section-title">Handpicked this week</h2>
        </div>
        <Link
          href="/listings?featured=1"
          className="hidden sm:inline-flex text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)]"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
        {hero && (
          <div className="lg:col-span-2 lg:row-span-2">
            <ListingCard listing={hero} variant="feature" />
          </div>
        )}
        {rest.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}

async function CategoriesSection() {
  const categories = await fetchCategories().catch(() => []);
  return <CategoryGrid categories={categories} limit={8} />;
}

async function LatestSection() {
  const latest = await fetchListings({ per_page: 8 }).catch(() => ({
    items: [],
    total: 0,
    totalPages: 0,
  }));

  return (
    <section className="container-page mt-16 md:mt-24">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)]">
            Fresh today
          </p>
          <h2 className="mt-1 section-title">Latest listings</h2>
        </div>
        <Link
          href="/listings"
          className="text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)]"
        >
          Browse all →
        </Link>
      </div>

      {latest.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-12 text-center">
      <h3 className="text-xl font-medium">No listings yet</h3>
      <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
        Once the WordPress backend has ads, they&apos;ll show up here.
      </p>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <section className="container-page mt-16">
      <div className="h-8 w-48 bg-[color:var(--color-surface-sunken)] rounded-md mb-6 animate-pulse" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema()} id="website-ld" />

      <div className="container-page pt-4 md:pt-6">
        <Suspense fallback={null}>
          <AdSlot slot="home-top" variant="banner" />
        </Suspense>
      </div>

      <Hero />

      <div className="container-page mt-12 md:mt-16">
        <Suspense fallback={null}>
          <AdSlot slot="home-leaderboard" variant="banner" />
        </Suspense>
      </div>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <CategoriesSection />
      </Suspense>

      <div className="container-page mt-16 md:mt-20">
        <Suspense fallback={null}>
          <AdSlot slot="home-midroll" variant="banner" />
        </Suspense>
      </div>

      <Suspense fallback={<SectionSkeleton />}>
        <LatestSection />
      </Suspense>

      <div className="container-page mt-16 md:mt-20 mb-8">
        <Suspense fallback={null}>
          <AdSlot slot="home-footer" variant="banner" />
        </Suspense>
      </div>
    </>
  );
}
