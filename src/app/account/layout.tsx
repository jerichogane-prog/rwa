import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your account',
  description: 'Manage your Ruby Want Ads profile, listings, messages, favorites, and settings.',
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
