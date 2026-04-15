// Sort definitions — imported from both server components (listings/events/jobs
// pages) and the client <SortMenu>. Keeping this in a non-"use client" module
// means Next can tree-shake it into the server build too.

export interface SortOption {
  value: string;
  label: string;
  orderby: string;
  order: 'ASC' | 'DESC';
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'recent', label: 'Newest first', orderby: 'date', order: 'DESC' },
  { value: 'oldest', label: 'Oldest first', orderby: 'date', order: 'ASC' },
  { value: 'alpha', label: 'Title A\u2013Z', orderby: 'title', order: 'ASC' },
  { value: 'alpha-desc', label: 'Title Z\u2013A', orderby: 'title', order: 'DESC' },
  { value: 'price-asc', label: 'Price low to high', orderby: 'price', order: 'ASC' },
  { value: 'price-desc', label: 'Price high to low', orderby: 'price', order: 'DESC' },
  { value: 'views', label: 'Most viewed', orderby: 'views', order: 'DESC' },
];

export const DEFAULT_SORT = 'recent';

export function resolveSort(value: string | undefined): SortOption {
  return SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
}
