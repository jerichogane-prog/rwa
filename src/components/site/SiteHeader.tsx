import Image from 'next/image';
import Link from 'next/link';
import { fetchMenu } from '@/lib/wp';
import type { MenuItem } from '@/lib/wp';
import { BrowseMenu } from './BrowseMenu';
import { HeaderAuth } from './HeaderAuth';
import { MobileNav } from './MobileNav';

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

function NavList({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="hidden lg:flex items-center gap-1">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={normalizeUrl(item.url)}
            target={item.target || undefined}
            className="px-3 py-2 text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)] transition-colors"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export async function SiteHeader() {
  const items = await fetchMenu('primary');

  return (
    <header className="sticky top-0 z-40 bg-[color:var(--color-surface-raised)] border-b border-[color:var(--color-border)]">
      <div className="container-page flex items-center justify-between h-16 md:h-20 lg:h-24 gap-3 md:gap-6 lg:gap-8">
        <Link href="/" className="flex items-center flex-shrink-0" aria-label="Ruby Want Ads home">
          <Image
            src="/brand/logo.png"
            alt="Ruby Want Ads"
            width={260}
            height={76}
            priority
            className="h-9 md:h-12 lg:h-16 w-auto"
          />
        </Link>

        <nav aria-label="Main navigation" className="flex-1 min-w-0">
          <NavList items={items} />
        </nav>

        <div className="flex items-center gap-1.5 md:gap-3">
          <BrowseMenu />
          <HeaderAuth />
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  );
}
