import type { ListingSummary } from '@/lib/wp';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  listings: ListingSummary[];
  emptyMessage?: string;
}

export function ListingGrid({ listings, emptyMessage = 'No listings match your filters.' }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-12 text-center">
        <h3 className="text-xl font-semibold">No results</h3>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
