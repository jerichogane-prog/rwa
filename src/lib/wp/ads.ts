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

export async function fetchAdList(options: { group?: string; limit?: number } = {}): Promise<AdItem[]> {
  if (!NAMESPACE) return [];
  const params = new URLSearchParams();
  if (options.group) params.set('group', options.group);
  if (options.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  try {
    const res = await fetch(`${NAMESPACE}/ads/list${qs ? `?${qs}` : ''}`, {
      next: { revalidate: 300, tags: ['ads', options.group ? `ad-group:${options.group}` : 'ad-list'] },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    return (await res.json()) as AdItem[];
  } catch {
    return [];
  }
}
