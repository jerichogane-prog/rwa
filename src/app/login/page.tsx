'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { TextField } from '@/components/forms/TextField';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-page py-16"><div className="h-6 w-40 bg-[color:var(--color-surface-sunken)] rounded animate-pulse" /></div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { user, login, loading, resendVerification } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsVerify, setNeedsVerify] = useState<string | null>(null);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [user, loading, router, redirect]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get('username') ?? '').trim();
    setSubmitting(true);
    setError(null);
    setNeedsVerify(null);
    setResendNote(null);
    try {
      await login({
        username,
        password: String(data.get('password') ?? ''),
      });
      router.replace(redirect);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not log you in.';
      // Surface the verify-link CTA when the server reports the dedicated code.
      if (/verify your email/i.test(message)) {
        setNeedsVerify(username);
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Log in"
      description="Access your saved listings, messages, and account settings."
      alt={{ label: 'New to Ruby Want Ads?', cta: 'Create an account', href: '/register' }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Username or email" name="username" autoComplete="username" required />
        <TextField label="Password" name="password" type="password" autoComplete="current-password" required />

        {error && (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">
            {error}
          </p>
        )}
        {needsVerify && (
          <div className="text-sm text-[color:var(--color-ink-muted)] space-y-2">
            <button
              type="button"
              disabled={resending}
              onClick={async () => {
                setResending(true);
                setResendNote(null);
                try {
                  await resendVerification(needsVerify);
                  setResendNote('A new verification link has been sent to your email.');
                } catch {
                  setResendNote('Could not resend right now. Try again shortly.');
                } finally {
                  setResending(false);
                }
              }}
              className="font-semibold text-[color:var(--color-ruby)] hover:underline disabled:opacity-70"
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
            {resendNote && <p role="status">{resendNote}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] disabled:opacity-70 transition-colors"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  );
}
