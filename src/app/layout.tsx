import type { Metadata } from 'next';
import { Inter, Archivo } from 'next/font/google';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationSchema } from '@/lib/seo/schema';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800', '900'],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Ruby Want Ads';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Elko, Nevada Classifieds`,
    template: `%s · ${siteName}`,
  },
  description:
    'Free local classifieds for northeastern Nevada. Buy, sell, rent, hire, and discover around Elko — vehicles, real estate, jobs, events, and more.',
  applicationName: siteName,
  keywords: [
    'Elko classifieds',
    'Nevada classifieds',
    'northeastern Nevada',
    'Ruby Want Ads',
    'local listings',
    'Elko jobs',
    'Elko real estate',
    'Elko events',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName,
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — Elko, Nevada Classifieds`,
    description:
      'Free local classifieds for northeastern Nevada. Buy, sell, rent, hire, and discover around Elko.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable}`}>
      <body className="min-h-screen flex flex-col bg-[color:var(--color-surface)] text-[color:var(--color-ink)]">
        <a href="#main" className="skip-link">Skip to content</a>
        <JsonLd data={organizationSchema()} id="organization-ld" />
        <AuthProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
