'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { TextField } from '@/components/forms/TextField';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { UserProfile } from '@/lib/auth/profile';

export default function ProfilePage() {
  return (
    <AccountShell title="Profile" description="Your public details and contact info on listings.">
      <ProfilePanel />
    </AccountShell>
  );
}

function ProfilePanel() {
  const { user, authedFetch } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    authedFetch<UserProfile>('/my/profile')
      .then(setProfile)
      .catch((err: Error) => setError(err.message));
  }, [user, authedFetch]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await authedFetch<UserProfile>('/my/profile', {
        method: 'POST',
        body: JSON.stringify({
          display_name: String(data.get('display_name') ?? '').trim(),
          first_name: String(data.get('first_name') ?? '').trim(),
          last_name: String(data.get('last_name') ?? '').trim(),
          email: String(data.get('email') ?? '').trim(),
          phone: String(data.get('phone') ?? '').trim(),
          whatsapp: String(data.get('whatsapp') ?? '').trim(),
          website: String(data.get('website') ?? '').trim(),
          description: String(data.get('description') ?? '').trim(),
        }),
      });
      setProfile(updated);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update profile.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!profile) {
    return (
      <AccountSection title="Your details">
        {error ? (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">{error}</p>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-11 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] animate-pulse" />
            ))}
          </div>
        )}
      </AccountSection>
    );
  }

  return (
    <div className="space-y-6">
      <AccountSection title="Your details" description="Display name shows up on your listings; first/last name are kept private.">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <TextField label="Display name" name="display_name" defaultValue={profile.display_name} required />
          <TextField label="Email" name="email" type="email" defaultValue={profile.email} required />
          <TextField label="First name" name="first_name" defaultValue={profile.first_name} />
          <TextField label="Last name" name="last_name" defaultValue={profile.last_name} />
          <TextField label="Phone" name="phone" type="tel" defaultValue={profile.phone} autoComplete="tel" />
          <TextField label="WhatsApp" name="whatsapp" type="tel" defaultValue={profile.whatsapp} />
          <div className="sm:col-span-2">
            <TextField label="Website" name="website" type="url" defaultValue={profile.website} placeholder="https://" />
          </div>
          <div className="sm:col-span-2">
            <TextField
              label="About you"
              name="description"
              as="textarea"
              rows={4}
              defaultValue={profile.description}
              hint="A short bio that appears next to your listings."
            />
          </div>

          {error && (
            <p role="alert" className="sm:col-span-2 text-sm text-[color:var(--color-ruby-deep)]">{error}</p>
          )}
          {success && (
            <p role="status" className="sm:col-span-2 text-sm text-[color:var(--color-ruby-deep)]">{success}</p>
          )}

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] disabled:opacity-70 transition-colors"
            >
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </AccountSection>

      <AccountSection title="Account" description="Read-only details about your account.">
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <Field label="Username">{profile.username}</Field>
          <Field label="Email verified">
            {profile.verified ? (
              <span className="inline-flex items-center gap-1 text-[color:var(--color-ruby-deep)] font-semibold">
                <span aria-hidden>✓</span> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[oklch(38%_0.12_60)] font-semibold">
                <span aria-hidden>!</span> Pending verification
              </span>
            )}
          </Field>
          <Field label="Member since">
            {new Date(profile.member_since).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </Field>
          <Field label="Roles">{profile.roles.join(', ') || 'subscriber'}</Field>
        </dl>
      </AccountSection>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)]">{label}</dt>
      <dd className="mt-1 text-[color:var(--color-ink)]">{children}</dd>
    </div>
  );
}
