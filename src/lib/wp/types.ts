export interface WpTerm {
  id: number;
  name: string;
  slug: string;
}

export type AdType = 'sell' | 'buy' | 'rentlease' | 'lostfound' | 'job' | 'event';

export const AD_TYPE_LABELS: Record<AdType, string> = {
  sell: 'For sale',
  buy: 'Wanted',
  rentlease: 'For rent',
  lostfound: 'Lost & found',
  job: 'Job',
  event: 'Event',
};

export interface ListingSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  price: number;
  price_type: string;
  condition: string;
  ad_type: AdType | '';
  featured: boolean;
  date: string;
  thumbnail: string | null;
  thumbnail_srcset: string | null;
  categories: WpTerm[];
  locations: WpTerm[];
  permalink: string;
}

export interface GalleryImage {
  id: number;
  url: string;
  thumb: string | null;
  srcset: string | null;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface CustomField {
  label: string;
  key: string;
  type: string;
  value: string | number | boolean | string[];
}

export interface Seller {
  id: number;
  display_name: string;
  avatar: string;
  member_since: string;
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
}

export interface Geo {
  lat: number;
  lng: number;
  address: string;
  zipcode: string;
}

export interface YoastMeta {
  title: string;
  description: string;
  canonical: string;
  og_image: string;
}

export interface ListingDetail extends ListingSummary {
  content: string;
  content_raw: string;
  gallery: GalleryImage[];
  tags: WpTerm[];
  custom_fields: CustomField[];
  geo: Geo;
  seller: Seller | null;
  contact?: ContactInfo;
  related: ListingSummary[];
  yoast: YoastMeta | null;
}

export interface TaxonomyNode {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  children?: TaxonomyNode[];
}

export interface MenuItem {
  id: number;
  label: string;
  url: string;
  target: string;
  classes: string[];
  children: MenuItem[];
}

export interface MenuLocation {
  location: string;
  name: string | null;
  slug: string | null;
}

export interface ListingsQuery {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  location?: string;
  tag?: string;
  type?: AdType;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  orderby?: 'date' | 'title' | 'rand' | 'menu_order';
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  totalPages: number;
}

export interface WpPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: string | null;
  yoast: {
    title?: string;
    description?: string;
    canonical?: string;
    og_image?: string;
  } | null;
}
