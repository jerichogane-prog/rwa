import Image from 'next/image';
import Link from 'next/link';
import { fetchMenu, fetchMenuBySlug } from '@/lib/wp';
import type { MenuItem } from '@/lib/wp';

const FALLBACK_CATEGORIES: MenuItem[] = [
  { id: -101, label: 'Animals', url: '/listings?category=animals', target: '', classes: [], children: [] },
  { id: -102, label: 'Cars, Trucks & Parts', url: '/listings?category=cars-trucks-parts', target: '', classes: [], children: [] },
  { id: -103, label: 'Recreational Vehicles', url: '/listings?category=recreational-vehicles', target: '', classes: [], children: [] },
  { id: -104, label: 'Outdoors', url: '/listings?category=outdoors', target: '', classes: [], children: [] },
  { id: -105, label: 'Construction & Industrial', url: '/listings?category=construction-industrial', target: '', classes: [], children: [] },
  { id: -106, label: 'Real Estate', url: '/listings?category=real-estate', target: '', classes: [], children: [] },
  { id: -107, label: 'Job Openings', url: '/listings?category=job-openings', target: '', classes: [], children: [] },
  { id: -108, label: 'Clothing & Jewelry', url: '/listings?category=clothing-jewelry', target: '', classes: [], children: [] },
  { id: -109, label: 'Household', url: '/listings?category=household', target: '', classes: [], children: [] },
  { id: -110, label: 'Events', url: '/listings?category=events', target: '', classes: [], children: [] },
];

const FALLBACK_HELP: MenuItem[] = [
  { id: -201, label: 'Contact us', url: '/contact-us', target: '', classes: [], children: [] },
  { id: -202, label: 'Help', url: '/help', target: '', classes: [], children: [] },
  { id: -203, label: 'Terms of Use', url: '/terms-of-use', target: '', classes: [], children: [] },
  { id: -204, label: 'Privacy Policy', url: '/privacy-policy', target: '', classes: [], children: [] },
];

function normalizeUrl(url: string): string {
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL;
  if (!url) return '/';
  // Convert category WP URLs (rwa.local/category/<slug>) into our /listings filter URLs.
  try {
    const parsed = new URL(url, wpUrl ?? 'http://placeholder.local');
    const pathname = parsed.pathname.replace(/\/$/, '');
    if (wpUrl) {
      const wp = new URL(wpUrl);
      if (parsed.hostname === wp.hostname) {
        const categoryMatch = pathname.match(/^\/category\/(.+)$/);
        if (categoryMatch) {
          return `/listings?category=${encodeURIComponent(categoryMatch[1])}`;
        }
        return parsed.pathname + parsed.search + parsed.hash;
      }
    }
    return url;
  } catch {
    return url || '/';
  }
}

function dedupeAndNormalize(items: MenuItem[]): MenuItem[] {
  const seen = new Set<string>();
  const out: MenuItem[] = [];
  for (const item of items) {
    const url = normalizeUrl(item.url);
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ ...item, url });
  }
  return out;
}

export async function SiteFooter() {
  const [categoriesMenu, helpMenu, primaryFooter] = await Promise.all([
    fetchMenuBySlug('categories-footer'),
    fetchMenuBySlug('help-and-support-footer'),
    fetchMenu('footer'),
  ]);

  const categories = dedupeAndNormalize(
    categoriesMenu.length > 0 ? categoriesMenu : FALLBACK_CATEGORIES,
  );
  const help = dedupeAndNormalize(
    helpMenu.length > 0
      ? helpMenu
      : primaryFooter.length > 0
        ? primaryFooter
        : FALLBACK_HELP,
  );
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-sunken)]">
      <div className="container-page py-16 grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <BrandColumn />
        <FooterColumn heading="Categories" items={categories.slice(0, 8)} />
        <FooterColumn heading="Help & support" items={help} />
        <ContactColumn />
      </div>

      <BottomBar year={year} />
    </footer>
  );
}

function BrandColumn() {
  return (
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
      <Link
        href="/post-ad"
        className="mt-5 inline-flex items-center px-4 py-2 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] transition-colors"
      >
        Post an ad
      </Link>
    </div>
  );
}

function FooterColumn({ heading, items }: { heading: string; items: MenuItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)] mb-4">
        {heading}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.url}
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

function ContactColumn() {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)] mb-4">
        Get in touch
      </h3>
      <ul className="space-y-2.5 text-sm text-[color:var(--color-ink-muted)]">
        <li>
          <a
            href="tel:+17757771196"
            className="hover:text-[color:var(--color-ruby)]"
          >
            (775) 777-1196
          </a>
        </li>
        <li>
          <a
            href="mailto:info@global1media.com"
            className="hover:text-[color:var(--color-ruby)] break-all"
          >
            info@global1media.com
          </a>
        </li>
        <li className="pt-1 text-xs leading-relaxed text-[color:var(--color-ink-subtle)]">
          975 5th Street, 2nd Floor
          <br />
          Elko, NV 89801
        </li>
      </ul>
    </div>
  );
}

function BottomBar({ year }: { year: number }) {
  return (
    <div className="border-t border-[color:var(--color-border)]">
      <div className="container-page py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[color:var(--color-ink-subtle)]">
        <span>© {year} Global 1 Media. All rights reserved.</span>
        <a
          href="https://global1media.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 group"
          aria-label="A Global 1 Media property"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase opacity-70 group-hover:opacity-100">
            A property of
          </span>
          <Image
            src="/brand/g1m-logo.png"
            alt="Global 1 Media"
            width={120}
            height={54}
            className="h-9 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </a>
      </div>
    </div>
  );
}
