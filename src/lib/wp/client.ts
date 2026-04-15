import type {
  ListingDetail,
  ListingSummary,
  ListingsQuery,
  MenuItem,
  MenuLocation,
  PaginatedResult,
  TaxonomyNode,
  WpPage,
} from './types';

const WP_REST = process.env.NEXT_PUBLIC_WP_REST;

if (!WP_REST) {
  throw new Error('NEXT_PUBLIC_WP_REST is not configured');
}

const NAMESPACE = `${WP_REST}/rwa/v1`;

interface FetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

async function wpFetch<T>(
  path: string,
  { revalidate = 60, tags }: FetchOptions = {},
): Promise<{ data: T; headers: Headers }> {
  const url = path.startsWith('http') ? path : `${NAMESPACE}${path}`;
  const res = await fetch(url, {
    next: {
      revalidate: revalidate === false ? undefined : revalidate,
      tags,
    },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`WP request failed: ${res.status} ${res.statusText} (${url})`);
  }

  const data = (await res.json()) as T;
  return { data, headers: res.headers };
}

function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'boolean') {
      search.set(key, value ? '1' : '0');
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchListings(
  query: ListingsQuery = {},
): Promise<PaginatedResult<ListingSummary>> {
  const qs = buildQueryString({ ...query });
  const { data, headers } = await wpFetch<ListingSummary[]>(`/listings${qs}`, {
    tags: ['listings'],
  });
  return {
    items: data,
    total: Number(headers.get('x-wp-total') ?? data.length),
    totalPages: Number(headers.get('x-wp-totalpages') ?? 1),
  };
}

export async function fetchListing(slug: string): Promise<ListingDetail> {
  const { data } = await wpFetch<ListingDetail>(`/listing/${encodeURIComponent(slug)}`, {
    tags: ['listings', `listing:${slug}`],
  });
  return data;
}

export async function fetchCategories(): Promise<TaxonomyNode[]> {
  const { data } = await wpFetch<TaxonomyNode[]>(`/categories`, {
    revalidate: 300,
    tags: ['categories'],
  });
  return data;
}

export async function fetchLocations(): Promise<TaxonomyNode[]> {
  const { data } = await wpFetch<TaxonomyNode[]>(`/locations`, {
    revalidate: 300,
    tags: ['locations'],
  });
  return data;
}

export async function fetchMenu(location: string): Promise<MenuItem[]> {
  try {
    const { data } = await wpFetch<MenuItem[]>(`/menu/${encodeURIComponent(location)}`, {
      revalidate: 300,
      tags: ['menus', `menu:${location}`],
    });
    return data;
  } catch {
    return [];
  }
}

export async function fetchMenuBySlug(slug: string): Promise<MenuItem[]> {
  try {
    const { data } = await wpFetch<MenuItem[]>(`/menu-by-slug/${encodeURIComponent(slug)}`, {
      revalidate: 300,
      tags: ['menus', `menu-slug:${slug}`],
    });
    return data;
  } catch {
    return [];
  }
}

export async function fetchTaxonomyTerm(
  taxonomy: 'categories' | 'locations' | 'tags',
  slug: string,
): Promise<TaxonomyNode | null> {
  const tree = await (taxonomy === 'categories'
    ? wpFetch<TaxonomyNode[]>(`/categories`, { revalidate: 300, tags: ['categories'] })
    : taxonomy === 'locations'
      ? wpFetch<TaxonomyNode[]>(`/locations`, { revalidate: 300, tags: ['locations'] })
      : wpFetch<TaxonomyNode[]>(`/tags`, { revalidate: 300, tags: ['tags'] }));

  function find(nodes: TaxonomyNode[]): TaxonomyNode | null {
    for (const node of nodes) {
      if (node.slug === slug) return node;
      if (node.children?.length) {
        const hit = find(node.children);
        if (hit) return hit;
      }
    }
    return null;
  }
  return find(tree.data);
}

export async function fetchPage(slug: string): Promise<WpPage | null> {
  if (!WP_REST) return null;
  try {
    const res = await fetch(`${WP_REST}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_embed=1`, {
      next: { revalidate: 300, tags: ['pages', `page:${slug}`] },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      id: number;
      slug: string;
      title: { rendered: string };
      content: { rendered: string };
      excerpt: { rendered: string };
      date: string;
      modified: string;
      featured_media?: number;
      yoast_head_json?: {
        title?: string;
        description?: string;
        canonical?: string;
        og_image?: Array<{ url: string }>;
      };
      _embedded?: {
        'wp:featuredmedia'?: Array<{ source_url: string }>;
      };
    }>;

    if (!Array.isArray(data) || data.length === 0) return null;
    const p = data[0];
    const yoast = p.yoast_head_json;

    return {
      id: p.id,
      slug: p.slug,
      title: p.title?.rendered ?? '',
      content: p.content?.rendered ?? '',
      excerpt: p.excerpt?.rendered ?? '',
      date: p.date,
      modified: p.modified,
      featuredImage: p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
      yoast: yoast
        ? {
            title: yoast.title,
            description: yoast.description,
            canonical: yoast.canonical,
            og_image: yoast.og_image?.[0]?.url,
          }
        : null,
    };
  } catch {
    return null;
  }
}

export async function fetchMenuLocations(): Promise<MenuLocation[]> {
  const { data } = await wpFetch<MenuLocation[]>(`/menus`, {
    revalidate: 300,
    tags: ['menus'],
  });
  return data;
}
