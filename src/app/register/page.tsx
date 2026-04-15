'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { TextField } from '@/components/forms/TextField';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/account');
    }
  }, [user, loading, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await register({
        username: String(data.get('username') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
        password: String(data.get('password') ?? ''),
        name: String(data.get('name') ?? '').trim() || undefined,
      });
      router.replace('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Join Ruby Want Ads"
      title="Create an account"
      description="Post listings and reach local buyers across northeastern Nevada."
      alt={{ label: 'Already have an account?', cta: 'Log in', href: '/login' }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Display name" name="name" autoComplete="name" hint="Shown publicly on your listings." />
        <TextField label="Username" name="username" required autoComplete="username" />
        <TextField label="Email" name="email" type="email" required autoComplete="email" />
        <TextField label="Password" name="password" type="password" required autoComplete="new-password" hint="At least 8 characters." />

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
