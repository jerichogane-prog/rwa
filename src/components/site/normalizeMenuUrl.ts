// Shared normalizer for WordPress menu item URLs. Header, footer, and
// mobile navigation all call into this so "Help" always lands on /help no
// matter whether the WP editor pasted rwa.local/help/, the production
// rubywantadss.com/help/, or just /help.

const CLAIMED_PATHS = new Set([
  '/help',
  '/contact-us',
  '/terms-of-use',
  '/privacy-policy',
  '/events',
  '/jobs',
  '/categories',
  '/listings',
]);

export function normalizeMenuUrl(url: string): string {
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL;
  if (!url) return '/';
  try {
    const parsed = new URL(url, wpUrl ?? 'http://placeholder.local');
    const pathname = parsed.pathname.replace(/\/$/, '') || '/';
    if (CLAIMED_PATHS.has(pathname)) {
      return pathname;
    }
    const categoryMatch = pathname.match(/^\/category\/(.+)$/);
    if (categoryMatch) {
      return `/listings?category=${encodeURIComponent(categoryMatch[1])}`;
    }
    if (wpUrl) {
      const wp = new URL(wpUrl);
      if (parsed.hostname === wp.hostname) {
        return parsed.pathname + parsed.search + parsed.hash;
      }
    }
    return url;
  } catch {
    return url || '/';
  }
}
