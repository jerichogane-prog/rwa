import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchListings, fetchTaxonomyTerm } from '@/lib/wp';
import { TaxonomyLanding } from '@/components/listings/TaxonomyLanding';

export const revalidate = 120;

interface LocationPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = await fetchTaxonomyTerm('locations', slug);
  if (!term) return { title: 'Location not found' };
  return {
    title: `Listings in ${term.name}`,
    description: term.description || `Browse classified listings in ${term.name} on Ruby Want Ads.`,
  };
}

export default async function LocationPage({ params, searchParams }: LocationPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const pageNum = Number(firstParam(sp.page)) || 1;

  const term = await fetchTaxonomyTerm('locations', slug);
  if (!term) notFound();

  const { items, total, totalPages } = await fetchListings({
    location: slug,
    page: pageNum,
    per_page: 20,
  }).catch(() => ({ items: [], total: 0, totalPages: 0 }));

  return (
    <TaxonomyLanding
      kind="location"
      term={term}
      listings={items}
      currentPage={pageNum}
      totalPages={totalPages}
      total={total}
      baseHref={`/location/${slug}`}
    />
  );
}
