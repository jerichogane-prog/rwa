import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  alt: { label: string; cta: string; href: string };
  children: ReactNode;
}

export function AuthCard({ eyebrow, title, description, alt, children }: AuthCardProps) {
  return (
    <div className="container-page pt-12 md:pt-16 pb-16">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--color-ruby)]">
          {eyebrow}
        </p>
        <h1 className="section-title mt-2" style={{ fontSize: '2.25rem' }}>
          {title}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">{description}</p>

        <div className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-6">
          {children}
        </div>

        <p className="mt-5 text-sm text-[color:var(--color-ink-muted)] text-center">
          {alt.label}{' '}
          <Link href={alt.href} className="font-semibold text-[color:var(--color-ruby)] hover:underline">
            {alt.cta}
          </Link>
        </p>
      </div>
    </div>
  );
}
