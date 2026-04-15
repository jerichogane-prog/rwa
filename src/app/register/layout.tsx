import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an account',
  description:
    'Join Ruby Want Ads — free to post classifieds across northeastern Nevada. Sign up in under a minute.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/register' },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
