interface ComingSoonProps {
  eyebrow?: string;
  title: string;
  body: string;
}

export function ComingSoon({ eyebrow = 'Coming soon', title, body }: ComingSoonProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-sunken)] p-8 text-center">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[color:var(--color-ruby)]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--color-ink-muted)] max-w-md mx-auto">{body}</p>
    </div>
  );
}
