'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useUnreadMessages } from '@/lib/auth/useUnreadMessages';

interface Reply {
  id: number;
  date: string;
  body: string;
  email_delivered: boolean;
}

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
  replies: Reply[];
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
  const { refresh: refreshUnread } = useUnreadMessages();
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
      void refreshUnread();
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
        <MessageDetail
          message={active}
          onDelete={() => remove(active.id)}
          onReplyPosted={(reply) => {
            if (!messages) return;
            setMessages(
              messages.map((m) =>
                m.id === active.id ? { ...m, replies: [...m.replies, reply] } : m,
              ),
            );
          }}
        />
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

interface MessageDetailProps {
  message: Message;
  onDelete(): void;
  onReplyPosted(reply: Reply): void;
}

function MessageDetail({ message, onDelete, onReplyPosted }: MessageDetailProps) {
  const { user, authedFetch } = useAuth();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    setNote(null);
    try {
      const res = await authedFetch<{ success: boolean; email_delivered: boolean; reply: Reply }>(
        `/my/messages/${message.id}/reply`,
        { method: 'POST', body: JSON.stringify({ message: body }) },
      );
      onReplyPosted(res.reply);
      setDraft('');
      setNote(
        res.email_delivered
          ? 'Reply sent — emailed to the buyer.'
          : 'Reply saved. Email delivery failed; the buyer can still read it here.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reply.');
    } finally {
      setSending(false);
    }
  }

  return (
    <article className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-5 pb-5 border-b border-[color:var(--color-border)]">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)]">
            From
          </p>
          <p className="mt-1 text-base font-semibold">{message.sender_name || 'Anonymous'}</p>
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            <a href={`mailto:${message.sender_email}`} className="text-[color:var(--color-ruby)] hover:underline">
              {message.sender_email}
            </a>
            {message.sender_phone && (
              <>
                {' · '}
                <a href={`tel:${message.sender_phone}`} className="text-[color:var(--color-ruby)] hover:underline">
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
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)] hover:bg-[color:var(--color-surface-sunken)]"
        >
          Delete thread
        </button>
      </header>

      {message.listing && (
        <p className="mb-4 text-xs text-[color:var(--color-ink-subtle)]">
          About:{' '}
          <Link href={`/listing/${message.listing.slug}`} className="text-[color:var(--color-ruby)] hover:underline">
            {message.listing.title}
          </Link>
        </p>
      )}

      <div className="space-y-4">
        <Bubble
          who={message.sender_name || 'Buyer'}
          when={message.date}
          body={message.body}
          side="buyer"
        />
        {message.replies.map((reply) => (
          <Bubble
            key={reply.id}
            who={user?.display_name ?? 'You'}
            when={reply.date}
            body={reply.body}
            side="seller"
            note={reply.email_delivered ? 'Emailed to buyer' : 'Saved · email delivery failed'}
          />
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-6 pt-5 border-t border-[color:var(--color-border)] space-y-3"
        aria-label="Reply to buyer"
      >
        <label htmlFor={`reply-${message.id}`} className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)]">
          Reply
        </label>
        <textarea
          id={`reply-${message.id}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="Type your reply. It's emailed to the buyer and saved here for your records."
          className="w-full rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none"
        />
        {error && (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">{error}</p>
        )}
        {note && (
          <p role="status" className="text-sm text-[color:var(--color-ruby-deep)]">{note}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[color:var(--color-ink-subtle)]">
            Sends from <strong>{user?.email ?? 'your account'}</strong> · buyer can reply by email.
          </p>
          <button
            type="submit"
            disabled={sending || draft.trim().length === 0}
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-[color:var(--color-ruby)] !text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] disabled:opacity-60 transition-colors"
          >
            {sending ? 'Sending…' : 'Send reply'}
          </button>
        </div>
      </form>
    </article>
  );
}

function Bubble({
  who,
  when,
  body,
  side,
  note,
}: {
  who: string;
  when: string;
  body: string;
  side: 'buyer' | 'seller';
  note?: string;
}) {
  const isSeller = side === 'seller';
  return (
    <div className={`flex ${isSeller ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-[var(--radius-md)] px-4 py-3 text-sm whitespace-pre-wrap ${
          isSeller
            ? 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]'
            : 'bg-[color:var(--color-surface-sunken)] text-[color:var(--color-ink)]'
        }`}
      >
        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase opacity-70 mb-1">
          {who} · {new Date(when).toLocaleString()}
        </p>
        <p>{body}</p>
        {note && (
          <p className="mt-2 text-[10px] opacity-70">{note}</p>
        )}
      </div>
    </div>
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
