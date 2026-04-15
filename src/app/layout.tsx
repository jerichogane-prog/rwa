import type { Metadata } from 'next';
import { Inter, Archivo } from 'next/font/google';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AuthProvider } from '@/lib/auth/AuthProvider';
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
    default: `${siteName} — Classifieds marketplace`,
    template: `%s · ${siteName}`,
  },
  description:
    'Buy and sell locally on Ruby Want Ads — Northeastern Nevada\'s trusted classifieds marketplace, serving Elko and beyond.',
  openGraph: {
    siteName,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable}`}>
      <body className="min-h-screen flex flex-col bg-[color:var(--color-surface)] text-[color:var(--color-ink)]">
        <a href="#main" className="skip-link">Skip to content</a>
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
