import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchCategories } from '@/lib/wp';
import type { TaxonomyNode } from '@/lib/wp';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'All categories',
  description:
    'Every classified category on Ruby Want Ads — vehicles, real estate, jobs, household, services, and more across northeastern Nevada.',
  alternates: { canonical: '/categories' },
};

function totalCount(node: TaxonomyNode): number {
  const own = node.count ?? 0;
  const kids = (node.children ?? []).reduce((sum, c) => sum + totalCount(c), 0);
  return own + kids;
}

export default async function CategoriesIndex() {
  const categories = await fetchCategories().catch(() => []);

  return (
    <div className="container-page pt-10 md:pt-14 pb-16">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <span className="text-[color:var(--color-ink)]">Categories</span>
      </nav>

      <header className="mt-4 mb-10">
        <h1 className="section-title">All categories</h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)] max-w-xl">
          Every classified category across Ruby Want Ads — pick a top-level bucket to drill in.
        </p>
      </header>

      {categories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => {
            const count = totalCount(cat);
            return (
              <section
                key={cat.id}
                className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-bold tracking-tight">
                    <Link
                      href={`/category/${encodeURIComponent(cat.slug)}`}
                      className="hover:text-[color:var(--color-ruby)]"
                    >
                      {cat.name}
                    </Link>
                  </h2>
                  {count > 0 && (
                    <span className="text-xs text-[color:var(--color-ink-subtle)] whitespace-nowrap">
                      {count.toLocaleString()} {count === 1 ? 'ad' : 'ads'}
                    </span>
                  )}
                </div>
                {cat.children && cat.children.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {cat.children.slice(0, 8).map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/category/${encodeURIComponent(child.slug)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[color:var(--color-surface-sunken)] text-xs hover:bg-[color:var(--color-ruby-soft)] hover:text-[color:var(--color-ruby-deep)]"
                        >
                          {child.name}
                          {child.count !== undefined && child.count > 0 && (
                            <span className="text-[color:var(--color-ink-subtle)]">
                              {child.count}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                    {cat.children.length > 8 && (
                      <li>
                        <Link
                          href={`/category/${encodeURIComponent(cat.slug)}`}
                          className="inline-flex items-center px-2.5 py-1 text-xs text-[color:var(--color-ruby)] hover:underline"
                        >
                          +{cat.children.length - 8} more
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-12 text-center">
      <h2 className="text-xl font-medium">No categories yet</h2>
      <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
        Add classified categories in WordPress and they&apos;ll appear here.
      </p>
    </div>
  );
}
