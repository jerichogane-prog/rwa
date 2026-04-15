import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchListings, fetchTaxonomyTerm } from '@/lib/wp';
import { TaxonomyLanding } from '@/components/listings/TaxonomyLanding';

export const revalidate = 120;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = await fetchTaxonomyTerm('categories', slug);
  if (!term) return { title: 'Category not found' };
  return {
    title: term.name,
    description: term.description || `Browse ${term.name} listings on Ruby Want Ads.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const pageNum = Number(firstParam(sp.page)) || 1;

  const term = await fetchTaxonomyTerm('categories', slug);
  if (!term) notFound();

  const { items, total, totalPages } = await fetchListings({
    category: slug,
    page: pageNum,
    per_page: 20,
  }).catch(() => ({ items: [], total: 0, totalPages: 0 }));

  return (
    <TaxonomyLanding
      kind="category"
      term={term}
      listings={items}
      currentPage={pageNum}
      totalPages={totalPages}
      total={total}
      baseHref={`/category/${slug}`}
    />
  );
}
