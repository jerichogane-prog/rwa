'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { TextField } from '@/components/forms/TextField';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success'; identifier: string }
  | { kind: 'error'; message: string };

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const identifier = String(data.get('user_login') ?? '').trim();
    if (!identifier) {
      setStatus({ kind: 'error', message: 'Enter your username or email.' });
      return;
    }

    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_login: identifier }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };
      if (res.ok && json.success) {
        setStatus({ kind: 'success', identifier });
        return;
      }
      setStatus({
        kind: 'error',
        message: json.message || 'Could not request a reset. Try again shortly.',
      });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Network error. Try again shortly.',
      });
    }
  }

  if (status.kind === 'success') {
    return (
      <AuthCard
        eyebrow="Check your email"
        title="Reset link sent"
        description={`If an account matches ${status.identifier}, we\u2019ve sent a password reset link. The link will expire after a short time, so use it soon.`}
        alt={{ label: 'Know your password?', cta: 'Log in', href: '/login' }}
      >
        <div className="space-y-3 text-sm text-[color:var(--color-ink-muted)]">
          <p>
            Check your spam folder if you don&rsquo;t see it in a minute. The reset link opens a
            secure page where you can pick a new password.
          </p>
          <p>
            <Link href="/" className="text-[color:var(--color-ruby)] hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Password help"
      title="Reset your password"
      description="Enter the email address or username on your Ruby Want Ads account. We\u2019ll send you a link to set a new password."
      alt={{ label: 'Remembered it?', cta: 'Back to log in', href: '/login' }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          label="Username or email"
          name="user_login"
          autoComplete="username"
          required
        />

        {status.kind === 'error' && (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={status.kind === 'sending'}
          className="w-full h-11 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] disabled:opacity-70 transition-colors"
        >
          {status.kind === 'sending' ? 'Sending reset link…' : 'Send reset link'}
        </button>
      </form>
    </AuthCard>
  );
}
