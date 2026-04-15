'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { NotificationPrefs } from '@/lib/auth/profile';

const TOGGLES: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  {
    key: 'inquiries',
    label: 'New buyer inquiries',
    description: 'Email me when someone messages me about a listing.',
  },
  {
    key: 'listing_status',
    label: 'Listing status changes',
    description: 'Email me when an admin approves, rejects, or expires a listing.',
  },
  {
    key: 'expiry_reminders',
    label: 'Expiry reminders',
    description: 'Remind me before a listing is about to expire.',
  },
  {
    key: 'marketing',
    label: 'News and tips',
    description: 'Occasional updates from Ruby Want Ads. No spam.',
  },
];

export default function NotificationsPage() {
  return (
    <AccountShell title="Notifications" description="Choose what we email you about.">
      <NotificationsPanel />
    </AccountShell>
  );
}

function NotificationsPanel() {
  const { user, authedFetch } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    authedFetch<NotificationPrefs>('/my/notifications')
      .then(setPrefs)
      .catch((err: Error) => setError(err.message));
  }, [user, authedFetch]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prefs) return;
    const data = new FormData(event.currentTarget);
    const next: NotificationPrefs = {
      inquiries: data.get('inquiries') === 'on',
      listing_status: data.get('listing_status') === 'on',
      expiry_reminders: data.get('expiry_reminders') === 'on',
      marketing: data.get('marketing') === 'on',
    };
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await authedFetch<NotificationPrefs>('/my/notifications', {
        method: 'POST',
        body: JSON.stringify(next),
      });
      setPrefs(updated);
      setSuccess('Preferences saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save preferences.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!prefs) {
    return (
      <AccountSection title="Email preferences">
        {error ? (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">{error}</p>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] animate-pulse" />
            ))}
          </div>
        )}
      </AccountSection>
    );
  }

  return (
    <AccountSection title="Email preferences" description="You can change these any time.">
      <form onSubmit={onSubmit} className="space-y-4">
        <ul className="divide-y divide-[color:var(--color-border)]">
          {TOGGLES.map(({ key, label, description }) => (
            <li key={key} className="py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-0.5 text-xs text-[color:var(--color-ink-muted)]">{description}</p>
              </div>
              <Toggle name={key} defaultChecked={prefs[key]} />
            </li>
          ))}
        </ul>

        {error && (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">{error}</p>
        )}
        {success && (
          <p role="status" className="text-sm text-[color:var(--color-ruby-deep)]">{success}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] disabled:opacity-70 transition-colors"
          >
            {submitting ? 'Saving…' : 'Save preferences'}
          </button>
        </div>
      </form>
    </AccountSection>
  );
}

function Toggle({ name, defaultChecked }: { name: string; defaultChecked: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="w-11 h-6 rounded-full bg-[color:var(--color-surface-sunken)] peer-checked:bg-[color:var(--color-ruby)] transition-colors" />
      <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-[var(--shadow-card)] peer-checked:translate-x-5 transition-transform" />
    </label>
  );
}
