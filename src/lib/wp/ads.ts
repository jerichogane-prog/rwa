const WP_REST = process.env.NEXT_PUBLIC_WP_REST;
const NAMESPACE = WP_REST ? `${WP_REST}/rwa/v1` : '';

export interface AdSlotPayload {
  slot: string;
  html: string;
  empty: boolean;
}

export interface AdItem {
  id: number;
  name: string;
  html: string;
  url: string | null;
}

export interface AdGroupSettings {
  type: 'slider' | 'default' | 'ordered' | 'grid' | string;
  delay_ms: number;
  random: boolean;
  ad_count: number;
}

export interface AdGroupResponse {
  group: string | null;
  settings: AdGroupSettings;
  ads: AdItem[];
}

export async function fetchAdSlot(slot: string): Promise<AdSlotPayload | null> {
  if (!NAMESPACE) return null;
  try {
    const res = await fetch(`${NAMESPACE}/ads/${encodeURIComponent(slot)}`, {
      next: { revalidate: 300, tags: ['ads', `ad:${slot}`] },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as AdSlotPayload;
  } catch {
    return null;
  }
}

const EMPTY_GROUP: AdGroupResponse = {
  group: null,
  settings: { type: 'default', delay_ms: 5000, random: false, ad_count: 1 },
  ads: [],
};

export async function fetchAdGroup(options: { group?: string; limit?: number } = {}): Promise<AdGroupResponse> {
  if (!NAMESPACE) return EMPTY_GROUP;
  const params = new URLSearchParams();
  if (options.group) params.set('group', options.group);
  if (options.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  try {
    const res = await fetch(`${NAMESPACE}/ads/list${qs ? `?${qs}` : ''}`, {
      // Cache for one minute so rotation feels lively without hammering WP.
      next: { revalidate: 60, tags: ['ads', options.group ? `ad-group:${options.group}` : 'ad-list'] },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return EMPTY_GROUP;
    const body = (await res.json()) as AdGroupResponse | AdItem[];
    // Backwards-compat: older endpoint returned a bare array.
    if (Array.isArray(body)) {
      return { ...EMPTY_GROUP, ads: body };
    }
    return body;
  } catch {
    return EMPTY_GROUP;
  }
}

/** Legacy alias — returns just the ad array. Prefer fetchAdGroup for new callers. */
export async function fetchAdList(options: { group?: string; limit?: number } = {}): Promise<AdItem[]> {
  return (await fetchAdGroup(options)).ads;
}
