'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthProvider';
import { AccountSidebar } from './AccountSidebar';

interface AccountShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AccountShell({ title, description, actions, children }: AccountShellProps) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="container-page py-16">
        <div className="h-6 w-40 bg-[color:var(--color-surface-sunken)] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container-page pt-6 md:pt-14 pb-16">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <Link href="/account" className="hover:text-[color:var(--color-ink)]">
          Account
        </Link>
      </nav>

      <header className="mt-4 mb-6 md:mb-8 flex flex-wrap items-start gap-4">
        {user.avatar && (
          <Image
            src={user.avatar}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-subtle)] truncate">
            Signed in as {user.display_name}
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl md:text-3xl font-[family-name:var(--font-archivo)] font-extrabold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-[color:var(--color-ink-muted)] max-w-xl">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-end">
          {actions}
          <button
            type="button"
            onClick={() => {
              void logout().then(() => router.push('/'));
            }}
            className="text-sm text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ruby)] whitespace-nowrap"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AccountSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function AccountSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-4 sm:p-6">
      <header className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
