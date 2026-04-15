import type { ListingDetail, ListingSummary } from '@/lib/wp';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Ruby Want Ads';

export interface BreadcrumbCrumb {
  name: string;
  url: string;
}

export function breadcrumbSchema(crumbs: BreadcrumbCrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url.startsWith('http') ? c.url : `${SITE_URL}${c.url}`,
    })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/listings?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    description:
      'Free local classifieds for northeastern Nevada. Buy, sell, rent, hire, and discover around Elko.',
    telephone: '+1-775-777-1196',
    email: 'info@global1media.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '975 5th Street, 2nd Floor',
      addressLocality: 'Elko',
      addressRegion: 'NV',
      postalCode: '89801',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Northeastern Nevada',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Global 1 Media',
      url: 'https://global1media.com',
    },
  };
}

export function listingProductSchema(listing: ListingDetail) {
  const images = listing.gallery.length > 0
    ? listing.gallery.map((g) => g.url)
    : listing.thumbnail
      ? [listing.thumbnail]
      : [];

  const offers = listing.price > 0
    ? {
        '@type': 'Offer',
        price: listing.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        itemCondition: conditionToSchema(listing.condition),
        url: `${SITE_URL}/listing/${listing.slug}`,
        seller: listing.seller
          ? { '@type': 'Person', name: listing.seller.display_name }
          : undefined,
      }
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.excerpt || stripHtml(listing.content).slice(0, 500),
    image: images,
    url: `${SITE_URL}/listing/${listing.slug}`,
    ...(offers ? { offers } : {}),
    ...(listing.categories[0] ? { category: listing.categories[0].name } : {}),
  };
}

export function itemListSchema(items: ListingSummary[], listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/listing/${item.slug}`,
      name: item.title,
    })),
  };
}

function conditionToSchema(condition?: string): string | undefined {
  if (!condition) return undefined;
  const normalized = condition.toLowerCase();
  if (normalized.includes('new')) return 'https://schema.org/NewCondition';
  if (normalized.includes('refurb')) return 'https://schema.org/RefurbishedCondition';
  if (normalized.includes('damag')) return 'https://schema.org/DamagedCondition';
  return 'https://schema.org/UsedCondition';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
