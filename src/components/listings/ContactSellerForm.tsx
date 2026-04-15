'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';

interface ContactSellerFormProps {
  listingId: number;
  sellerName: string;
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string };

export function ContactSellerForm({ listingId, sellerName }: ContactSellerFormProps) {
  const { user, loading, authedFetch } = useAuth();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: 'sending' });

    const payload = {
      listing_id: listingId,
      sender_name: user?.display_name || user?.email || '',
      sender_email: user?.email || '',
      sender_phone: String(data.get('sender_phone') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      hp: String(data.get('hp') ?? ''),
    };

    try {
      const json = await authedFetch<{ success?: boolean; message?: string }>(
        '/contact-seller',
        { method: 'POST', body: JSON.stringify(payload) },
      );
      if (json.success) {
        setStatus({ kind: 'success' });
        form.reset();
        return;
      }
      setStatus({
        kind: 'error',
        message: json.message || 'Could not send your message. Please try again.',
      });
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Network error. Please try again.',
      });
    }
  }

  if (loading) {
    return (
      <div className="h-24 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] animate-pulse" />
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(pathname || '/');
    return (
      <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-sunken)] p-4 text-sm text-[color:var(--color-ink-muted)] space-y-3">
        <p>
          Sign in to message <strong>{sellerName}</strong>. This keeps conversations tied to your account and cuts down on spam.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/login?redirect=${redirect}`}
            className="inline-flex items-center justify-center px-4 h-10 rounded-full bg-[color:var(--color-ruby)] !text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] transition-colors"
          >
            Sign in to message
          </Link>
          <Link
            href={`/register?redirect=${redirect}`}
            className="inline-flex items-center justify-center px-4 h-10 rounded-full border border-[color:var(--color-border-strong)] text-sm font-semibold hover:border-[color:var(--color-ink)]"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  if (status.kind === 'success') {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-md)] bg-[color:var(--color-ruby-soft)] border border-[color:var(--color-ruby)]/30 p-4 text-sm text-[color:var(--color-ruby-deep)]"
      >
        <strong>Message sent.</strong> {sellerName} has been notified. Replies will appear in your{' '}
        <Link href="/account/messages" className="underline font-semibold">
          messages
        </Link>
        .
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-describedby="contact-help">
      <p id="contact-help" className="text-sm text-[color:var(--color-ink-muted)]">
        Send a message to <strong>{sellerName}</strong> as{' '}
        <span className="font-semibold text-[color:var(--color-ink)]">{user.display_name || user.email}</span>.
      </p>

      <Field label="Phone (optional)" name="sender_phone" type="tel" />

      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-1">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Hi, I'm interested in this listing — is it still available?"
          className="w-full rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none"
        />
      </div>

      <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />

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
        {status.kind === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}

function Field({ label, name, type = 'text', required }: FieldProps) {
  return (
    <div>
      <label htmlFor={`contact-${name}`} className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-1">
        {label}
      </label>
      <input
        id={`contact-${name}`}
        name={name}
        type={type}
        required={required}
        className="w-full h-11 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 text-sm focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none"
      />
    </div>
  );
}
