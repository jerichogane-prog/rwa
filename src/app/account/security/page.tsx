'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { TextField } from '@/components/forms/TextField';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function SecurityPage() {
  return (
    <AccountShell title="Security" description="Keep your account safe.">
      <div className="space-y-6">
        <ChangePasswordPanel />
        <SignOutEverywherePanel />
      </div>
    </AccountShell>
  );
}

function ChangePasswordPanel() {
  const router = useRouter();
  const { authedFetch, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const current = String(data.get('current_password') ?? '');
    const next = String(data.get('new_password') ?? '');
    const confirm = String(data.get('confirm_password') ?? '');

    setError(null);
    setSuccess(null);

    if (next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authedFetch<{ success: boolean }>('/my/password', {
        method: 'POST',
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      setSuccess('Password changed. You will be signed out shortly.');
      form.reset();
      setTimeout(() => {
        void logout().then(() => router.push('/login'));
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AccountSection
      title="Change password"
      description="Use 8+ characters with a mix of letters, numbers, and symbols."
    >
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <TextField label="Current password" name="current_password" type="password" autoComplete="current-password" required />
        <TextField label="New password" name="new_password" type="password" autoComplete="new-password" required />
        <TextField label="Confirm new password" name="confirm_password" type="password" autoComplete="new-password" required />

        {error && (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">{error}</p>
        )}
        {success && (
          <p role="status" className="text-sm text-[color:var(--color-ruby-deep)]">{success}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-5 py-2.5 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] disabled:opacity-70 transition-colors"
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AccountSection>
  );
}

function SignOutEverywherePanel() {
  const router = useRouter();
  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);

  return (
    <AccountSection
      title="Sign out everywhere"
      description="Revokes any active sessions and signs you out on all devices."
    >
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await logout();
          router.push('/login');
        }}
        className="inline-flex items-center px-5 py-2.5 rounded-full border border-[color:var(--color-border-strong)] text-sm font-semibold hover:border-[color:var(--color-ruby)] hover:text-[color:var(--color-ruby)] transition-colors disabled:opacity-70"
      >
        {busy ? 'Signing out…' : 'Sign out of all sessions'}
      </button>
    </AccountSection>
  );
}
