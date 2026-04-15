'use client';

import { useState, type FormEvent } from 'react';

interface ContactSellerFormProps {
  listingId: number;
  sellerName: string;
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string };

export function ContactSellerForm({ listingId, sellerName }: ContactSellerFormProps) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: 'sending' });

    const payload = {
      listing_id: listingId,
      sender_name: String(data.get('sender_name') ?? '').trim(),
      sender_email: String(data.get('sender_email') ?? '').trim(),
      sender_phone: String(data.get('sender_phone') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      hp: String(data.get('hp') ?? ''),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WP_REST}/rwa/v1/contact-seller`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (res.ok && json.success) {
        setStatus({ kind: 'success' });
        form.reset();
        return;
      }
      setStatus({
        kind: 'error',
        message: json.message || 'Could not send your message. Please try again.',
      });
    } catch {
      setStatus({ kind: 'error', message: 'Network error. Please try again.' });
    }
  }

  if (status.kind === 'success') {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-md)] bg-[color:var(--color-ruby-soft)] border border-[color:var(--color-ruby)]/30 p-4 text-sm text-[color:var(--color-ruby-deep)]"
      >
        <strong>Message sent.</strong> {sellerName} has been notified and will reply directly to your email.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-describedby="contact-help">
      <p id="contact-help" className="text-sm text-[color:var(--color-ink-muted)]">
        Send a message to <strong>{sellerName}</strong>. Your email stays private until they reply.
      </p>

      <Field label="Your name" name="sender_name" required />
      <Field label="Email" name="sender_email" type="email" required />
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
