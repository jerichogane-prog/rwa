import Image from 'next/image';
import Link from 'next/link';
import { fetchMenu } from '@/lib/wp';
import type { MenuItem } from '@/lib/wp';

function normalizeUrl(url: string): string {
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL;
  if (!wpUrl || !url) return url || '/';
  try {
    const parsed = new URL(url);
    const wp = new URL(wpUrl);
    if (parsed.hostname === wp.hostname) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    // non-URL strings fall through
  }
  return url;
}

const FOOTER_HEADINGS = ['Explore', 'Support', 'Company'] as const;

function FooterMenu({ items }: { items: MenuItem[] }) {
  if (items.length === 0) {
    return (
      <div className="grid gap-8 grid-cols-2 sm:grid-cols-3">
        <FooterColumn
          heading="Explore"
          items={[
            { id: -1, label: 'Browse listings', url: '/listings', target: '', classes: [], children: [] },
            { id: -2, label: 'Categories', url: '/categories', target: '', classes: [], children: [] },
            { id: -3, label: 'Post an ad', url: '/post-ad', target: '', classes: [], children: [] },
          ]}
        />
      </div>
    );
  }
  // Distribute items as evenly as possible across up to 3 columns.
  const colCount = Math.min(3, Math.max(1, Math.ceil(items.length / 4)));
  const perCol = Math.ceil(items.length / colCount);
  const cols: MenuItem[][] = Array.from({ length: colCount }, (_, i) =>
    items.slice(i * perCol, (i + 1) * perCol),
  );
  const gridCls =
    colCount === 1 ? 'grid gap-8' : colCount === 2 ? 'grid gap-8 grid-cols-2' : 'grid gap-8 grid-cols-2 sm:grid-cols-3';
  return (
    <div className={gridCls}>
      {cols.map((col, i) => (
        <FooterColumn key={i} items={col} heading={FOOTER_HEADINGS[i] ?? 'More'} />
      ))}
    </div>
  );
}

function FooterColumn({ items, heading }: { items: MenuItem[]; heading: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-[0.14em] uppercase text-[color:var(--color-ink-subtle)] mb-4">
        {heading}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={normalizeUrl(item.url)}
              target={item.target || undefined}
              className="text-sm text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SiteFooter() {
  const footerItems = await fetchMenu('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-sunken)]">
      <div className="container-page py-16 grid gap-12 md:grid-cols-[1.5fr_2fr]">
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="Ruby Want Ads home">
            <Image
              src="/brand/logo.png"
              alt="Ruby Want Ads"
              width={200}
              height={56}
              className="h-11 w-auto"
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm text-[color:var(--color-ink-muted)]">
            Northeastern Nevada&apos;s classifieds marketplace — where Elko-area buyers and sellers connect.
          </p>
        </div>

        <FooterMenu items={footerItems} />
      </div>

      <div className="border-t border-[color:var(--color-border)]">
        <div className="container-page py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--color-ink-subtle)]">
          <span>© {year} Global 1 Media. All rights reserved.</span>
          <span>Ruby Want Ads is a Global 1 Media property.</span>
        </div>
      </div>
    </footer>
  );
}
