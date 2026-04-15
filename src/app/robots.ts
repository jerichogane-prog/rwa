import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/account',
          '/account/',
          '/post-ad',
          '/login',
          '/register',
          '/verify-email',
          '/api/',
          // Don't waste crawl budget on faceted search combinations; the
          // canonical tags already point to /listings, but robots speeds it up.
          '/listings?search=*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
