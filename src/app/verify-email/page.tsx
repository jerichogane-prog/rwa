'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <div className="h-6 w-40 bg-[color:var(--color-surface-sunken)] rounded animate-pulse" />
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}

type Status =
  | { kind: 'idle' }
  | { kind: 'verifying' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const userId = Number(params.get('user_id'));
    const hash = params.get('verify_email');
    if (!userId || !hash) {
      setStatus({ kind: 'error', message: 'This verification link is missing required parameters.' });
      return;
    }
    setStatus({ kind: 'verifying' });
    verifyEmail(userId, hash)
      .then(() => {
        setStatus({ kind: 'success' });
        setTimeout(() => router.replace('/account'), 1200);
      })
      .catch((err: Error) =>
        setStatus({ kind: 'error', message: err.message || 'Verification failed.' }),
      );
  }, [params, router, verifyEmail]);

  return (
    <AuthCard
      eyebrow="Email verification"
      title={
        status.kind === 'success'
          ? 'You’re verified'
          : status.kind === 'error'
            ? 'Verification problem'
            : 'Verifying your email…'
      }
      description={
        status.kind === 'success'
          ? 'Welcome to Ruby Want Ads. Redirecting you to your account.'
          : status.kind === 'error'
            ? 'Something went wrong while verifying your email.'
            : 'One moment while we confirm your account.'
      }
      alt={{ label: 'Need a new link?', cta: 'Resend verification', href: '/login' }}
    >
      {status.kind === 'verifying' && (
        <div className="flex items-center gap-3 text-sm text-[color:var(--color-ink-muted)]">
          <span
            className="w-4 h-4 rounded-full border-2 border-[color:var(--color-ruby)] border-r-transparent animate-spin"
            aria-hidden
          />
          Checking the link…
        </div>
      )}
      {status.kind === 'success' && (
        <p className="text-sm text-[color:var(--color-ruby-deep)] font-medium">
          Verified! Sending you to your account…
        </p>
      )}
      {status.kind === 'error' && (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">
            {status.message}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] transition-colors"
          >
            Back to login
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
