import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post an ad',
  description:
    'Reach local buyers in Elko and across northeastern Nevada. Post a free classified ad — for sale, wanted, rent, jobs, or events.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/post-ad' },
};

export default function PostAdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
