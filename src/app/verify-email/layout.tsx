import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify your email',
  description: 'Confirm your Ruby Want Ads email address to activate your account.',
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
