import type { MetadataRoute } from 'next';
import { fetchCategories, fetchListings, fetchLocations } from '@/lib/wp';
import type { TaxonomyNode } from '@/lib/wp';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const PER_PAGE = 50;
const MAX_LISTING_PAGES = 20; // cap sitemap at 1000 listings — split later if needed

type Entry = MetadataRoute.Sitemap[number];

function flattenTerms(nodes: TaxonomyNode[]): TaxonomyNode[] {
  const out: TaxonomyNode[] = [];
  (function walk(list: TaxonomyNode[]) {
    for (const node of list) {
      out.push(node);
      if (node.children?.length) walk(node.children);
    }
  })(nodes);
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: Entry[] = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/listings`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/events`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/jobs`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const [categories, locations] = await Promise.all([
    fetchCategories().catch(() => []),
    fetchLocations().catch(() => []),
  ]);

  const categoryEntries: Entry[] = flattenTerms(categories).map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const locationEntries: Entry[] = flattenTerms(locations).map((l) => ({
    url: `${SITE_URL}/location/${l.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  const listingEntries: Entry[] = [];
  for (let page = 1; page <= MAX_LISTING_PAGES; page++) {
    const batch = await fetchListings({ page, per_page: PER_PAGE }).catch(() => null);
    if (!batch || batch.items.length === 0) break;
    for (const listing of batch.items) {
      listingEntries.push({
        url: `${SITE_URL}/listing/${listing.slug}`,
        lastModified: listing.date ? new Date(listing.date) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
    if (page >= batch.totalPages) break;
  }

  return [...staticEntries, ...categoryEntries, ...locationEntries, ...listingEntries];
}
