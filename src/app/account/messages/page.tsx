'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { useAuth } from '@/lib/auth/AuthProvider';

interface Message {
  id: number;
  date: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  body: string;
  read: boolean;
  email_delivered: boolean;
  listing: { id: number; title: string; slug: string } | null;
}

export default function MessagesPage() {
  return (
    <AccountShell title="Messages" description="Inquiries from buyers about your listings.">
      <MessagesPanel />
    </AccountShell>
  );
}

function MessagesPanel() {
  const { user, authedFetch } = useAuth();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    authedFetch<Message[]>('/my/messages')
      .then((list) => {
        setMessages(list);
        if (list.length > 0) setActiveId(list[0].id);
      })
      .catch((err: Error) => setError(err.message));
  }, [user, authedFetch]);

  const active = useMemo(
    () => (messages && activeId ? messages.find((m) => m.id === activeId) ?? null : null),
    [messages, activeId],
  );

  async function markRead(id: number) {
    if (!messages) return;
    setMessages(messages.map((m) => (m.id === id ? { ...m, read: true } : m)));
    try {
      await authedFetch(`/my/messages/${id}/read`, { method: 'POST' });
    } catch {
      // Local state already optimistic; no need to revert for a read marker.
    }
  }

  async function remove(id: number) {
    if (!messages) return;
    if (!window.confirm('Delete this message?')) return;
    const next = messages.filter((m) => m.id !== id);
    setMessages(next);
    setActiveId(next[0]?.id ?? null);
    try {
      await authedFetch(`/my/messages/${id}`, { method: 'DELETE' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.');
    }
  }

  if (!messages) {
    return (
      <AccountSection title="Buyer inquiries">
        {error ? (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">{error}</p>
        ) : (
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="h-16 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] animate-pulse"
              />
            ))}
          </ul>
        )}
      </AccountSection>
    );
  }

  if (messages.length === 0) {
    return (
      <AccountSection title="Buyer inquiries">
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          No messages yet. When a buyer fills out the Contact Seller form on one of your listings,
          their message will land here.
        </p>
      </AccountSection>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] overflow-hidden">
        <ul className="divide-y divide-[color:var(--color-border)] max-h-[600px] overflow-y-auto">
          {messages.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveId(m.id);
                  if (!m.read) void markRead(m.id);
                }}
                className={`w-full text-left p-4 transition-colors ${
                  activeId === m.id
                    ? 'bg-[color:var(--color-ruby-soft)]'
                    : 'hover:bg-[color:var(--color-surface-sunken)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {!m.read && (
                    <span
                      aria-label="Unread"
                      className="w-2 h-2 rounded-full bg-[color:var(--color-ruby)] flex-shrink-0"
                    />
                  )}
                  <p className={`flex-1 truncate text-sm ${m.read ? 'font-medium text-[color:var(--color-ink-muted)]' : 'font-semibold text-[color:var(--color-ink)]'}`}>
                    {m.sender_name || 'Anonymous buyer'}
                  </p>
                  <span className="text-[10px] text-[color:var(--color-ink-subtle)]">
                    {formatDate(m.date)}
                  </span>
                </div>
                {m.listing && (
                  <p className="mt-1 text-xs text-[color:var(--color-ink-subtle)] truncate">
                    Re: {m.listing.title}
                  </p>
                )}
                <p className="mt-1 text-xs text-[color:var(--color-ink-muted)] line-clamp-2">
                  {m.body}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {active ? (
        <MessageDetail message={active} onDelete={() => remove(active.id)} />
      ) : (
        <AccountSection title="Select a message">
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            Pick an inquiry from the list to view it.
          </p>
        </AccountSection>
      )}
    </div>
  );
}

function MessageDetail({ message, onDelete }: { message: Message; onDelete: () => void }) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-5 pb-5 border-b border-[color:var(--color-border)]">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)]">
            From
          </p>
          <p className="mt-1 text-base font-semibold">{message.sender_name || 'Anonymous'}</p>
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            <a
              href={`mailto:${message.sender_email}`}
              className="text-[color:var(--color-ruby)] hover:underline"
            >
              {message.sender_email}
            </a>
            {message.sender_phone && (
              <>
                {' · '}
                <a
                  href={`tel:${message.sender_phone}`}
                  className="text-[color:var(--color-ruby)] hover:underline"
                >
                  {message.sender_phone}
                </a>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-ink-subtle)]">
            {new Date(message.date).toLocaleString()}
            {!message.email_delivered && ' · email delivery failed'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${message.sender_email}?subject=${encodeURIComponent(
              `Re: ${message.listing?.title ?? 'Your inquiry'}`,
            )}`}
            className="inline-flex items-center px-4 py-2 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] transition-colors"
          >
            Reply by email
          </a>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)] hover:bg-[color:var(--color-surface-sunken)]"
          >
            Delete
          </button>
        </div>
      </header>

      {message.listing && (
        <p className="mb-4 text-xs text-[color:var(--color-ink-subtle)]">
          About:{' '}
          <Link
            href={`/listing/${message.listing.slug}`}
            className="text-[color:var(--color-ruby)] hover:underline"
          >
            {message.listing.title}
          </Link>
        </p>
      )}

      <div className="prose-listing whitespace-pre-wrap text-[color:var(--color-ink)]">
        {message.body}
      </div>
    </article>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
}
