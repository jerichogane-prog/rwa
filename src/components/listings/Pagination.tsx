import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseHref: string;
}

function buildHref(baseHref: string, page: number): string {
  if (page <= 1) {
    return baseHref.includes('?') ? baseHref.replace(/([?&])page=\d+&?/, '$1').replace(/[?&]$/, '') : baseHref;
  }
  const [path, query = ''] = baseHref.split('?');
  const params = new URLSearchParams(query);
  params.set('page', String(page));
  return `${path}?${params.toString()}`;
}

function pageRange(current: number, total: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const delta = 1;
  const range = new Set<number>([1, total, current]);
  for (let p = current - delta; p <= current + delta; p++) {
    if (p > 1 && p < total) range.add(p);
  }
  const sorted = Array.from(range).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push('ellipsis');
    pages.push(sorted[i]);
  }
  return pages;
}

export function Pagination({ currentPage, totalPages, baseHref }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = pageRange(currentPage, totalPages);
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      <PageLink href={buildHref(baseHref, prevPage)} disabled={currentPage === 1} label="Previous page">
        ←
      </PageLink>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-2 text-[color:var(--color-ink-subtle)]">
            …
          </span>
        ) : (
          <PageLink
            key={p}
            href={buildHref(baseHref, p)}
            label={`Page ${p}`}
            active={p === currentPage}
          >
            {p}
          </PageLink>
        ),
      )}
      <PageLink href={buildHref(baseHref, nextPage)} disabled={currentPage === totalPages} label="Next page">
        →
      </PageLink>
    </nav>
  );
}

interface PageLinkProps {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

function PageLink({ href, label, active, disabled, children }: PageLinkProps) {
  const base =
    'inline-flex min-w-[40px] h-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors';

  if (disabled) {
    return (
      <span aria-disabled className={`${base} text-[color:var(--color-ink-subtle)] opacity-40 cursor-not-allowed`}>
        {children}
      </span>
    );
  }

  const state = active
    ? 'bg-[color:var(--color-ruby)] text-white'
    : 'text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-ink)]';

  return (
    <Link href={href} aria-label={label} aria-current={active ? 'page' : undefined} className={`${base} ${state}`}>
      {children}
    </Link>
  );
}
