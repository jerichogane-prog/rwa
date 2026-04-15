'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { TextField } from '@/components/forms/TextField';
import { AvatarField } from '@/components/forms/AvatarField';
import { useAuth } from '@/lib/auth/AuthProvider';

interface PendingState {
  email: string;
  username: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, resendVerification, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<PendingState | null>(null);
  const [resending, setResending] = useState(false);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/account');
    }
  }, [user, loading, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') ?? '');
    const confirmPassword = String(data.get('password_confirm') ?? '');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await register({
        username: String(data.get('username') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
        password,
        name: String(data.get('name') ?? '').trim() || undefined,
        avatar: avatar ?? null,
      });
      if (result.kind === 'verification_pending') {
        setPending({ email: result.pending.email, username: result.pending.username });
      } else {
        router.replace('/account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  if (pending) {
    return (
      <AuthCard
        eyebrow="Almost there"
        title="Check your email"
        description={`We sent a verification link to ${pending.email}. Click it to activate your account, then come back and log in.`}
        alt={{ label: 'Already verified?', cta: 'Log in', href: '/login' }}
      >
        <div className="space-y-4 text-sm text-[color:var(--color-ink-muted)]">
          <p>
            Tip: check your spam folder if you don&apos;t see it within a minute. Verification links
            expire if you request a new one.
          </p>
          <button
            type="button"
            disabled={resending}
            onClick={async () => {
              setResending(true);
              setResendNote(null);
              try {
                await resendVerification(pending.username);
                setResendNote('A new link has been sent.');
              } catch {
                setResendNote('Could not resend right now. Try again shortly.');
              } finally {
                setResending(false);
              }
            }}
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-[color:var(--color-border-strong)] text-sm font-semibold hover:border-[color:var(--color-ruby)] hover:text-[color:var(--color-ruby)] transition-colors disabled:opacity-70"
          >
            {resending ? 'Sending…' : 'Resend verification email'}
          </button>
          {resendNote && <p role="status">{resendNote}</p>}
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
      eyebrow="Join Ruby Want Ads"
      title="Create an account"
      description="Post listings and reach local buyers across northeastern Nevada."
      alt={{ label: 'Already have an account?', cta: 'Log in', href: '/login' }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AvatarField value={avatar} onChange={setAvatar} />
        <TextField label="Display name" name="name" autoComplete="name" hint="Shown publicly on your listings." />
        <TextField label="Username" name="username" required autoComplete="username" />
        <TextField label="Email" name="email" type="email" required autoComplete="email" />
        <TextField label="Password" name="password" type="password" required autoComplete="new-password" hint="At least 8 characters." />
        <TextField label="Confirm password" name="password_confirm" type="password" required autoComplete="new-password" />

        {error && (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] disabled:opacity-70 transition-colors"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}
