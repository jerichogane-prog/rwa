import Link from 'next/link';

export type HelpStepImageKind =
  | 'register'
  | 'verify'
  | 'account'
  | 'post-button'
  | 'categories'
  | 'form'
  | 'submit'
  | 'photo-good'
  | 'photo-angles'
  | 'photo-size'
  | 'tabs'
  | 'profile'
  | 'notifications';

export interface HelpStepImageProps {
  kind: HelpStepImageKind;
}

interface HelpStepProps {
  step: number | string;
  title: string;
  body: string;
  cta?: { href: string; label: string };
  image?: HelpStepImageProps;
}

export function HelpStep({ step, title, body, cta, image }: HelpStepProps) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] overflow-hidden flex flex-col">
      {image && <HelpStepImage {...image} />}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-bold"
          >
            {step}
          </span>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        </div>
        <p className="text-sm text-[color:var(--color-ink-muted)] leading-relaxed flex-1">{body}</p>
        {cta && (
          <Link
            href={cta.href}
            className="inline-flex items-center text-sm font-semibold text-[color:var(--color-ruby)] hover:underline"
          >
            {cta.label} →
          </Link>
        )}
      </div>
    </article>
  );
}

export function HelpStepImage({ kind }: HelpStepImageProps) {
  return (
    <div className="aspect-[16/9] bg-[color:var(--color-surface-sunken)] border-b border-[color:var(--color-border)] flex items-center justify-center p-6">
      {ILLUSTRATIONS[kind]}
    </div>
  );
}

const ILLUSTRATIONS: Record<HelpStepImageKind, React.ReactNode> = {
  register: (
    <MockBrowser>
      <div className="space-y-2">
        <FauxField />
        <FauxField />
        <FauxField />
        <FauxButton label="Create account" />
      </div>
    </MockBrowser>
  ),
  verify: (
    <MockEmail>
      <div className="text-center">
        <div className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-[color:var(--color-ruby)] text-white text-base">
          ✓
        </div>
        <div className="mt-2 h-2 w-24 mx-auto rounded bg-[color:var(--color-border-strong)]" />
        <div className="mt-1 h-2 w-16 mx-auto rounded bg-[color:var(--color-border-strong)]" />
        <div className="mt-3 inline-block px-3 py-1.5 rounded-full bg-[color:var(--color-ruby)] text-white text-[10px] font-semibold">
          Verify email
        </div>
      </div>
    </MockEmail>
  ),
  account: (
    <MockBrowser>
      <div className="flex gap-2 h-full">
        <div className="w-1/3 space-y-1.5">
          <FauxNavItem active />
          <FauxNavItem />
          <FauxNavItem />
          <FauxNavItem />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-3/4 rounded bg-[color:var(--color-border-strong)]" />
          <div className="h-2 w-full rounded bg-[color:var(--color-border)]" />
          <div className="h-2 w-5/6 rounded bg-[color:var(--color-border)]" />
        </div>
      </div>
    </MockBrowser>
  ),
  'post-button': (
    <MockBrowser>
      <div className="flex justify-end">
        <div className="px-3 py-1.5 rounded-full bg-[color:var(--color-ruby)] text-white text-[10px] font-semibold flex items-center gap-1">
          <span>+</span> Post an ad
        </div>
      </div>
      <div className="mt-3 h-2 w-3/4 rounded bg-[color:var(--color-border)]" />
      <div className="mt-1.5 h-2 w-5/6 rounded bg-[color:var(--color-border)]" />
    </MockBrowser>
  ),
  categories: (
    <MockBrowser>
      <div className="grid grid-cols-3 gap-1.5">
        {['Cars', 'Real estate', 'Jobs', 'Pets', 'Outdoors', 'More'].map((label, i) => (
          <div
            key={i}
            className={`h-7 rounded text-[9px] font-semibold flex items-center justify-center ${
              i === 0
                ? 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]'
                : 'bg-[color:var(--color-border)] text-[color:var(--color-ink-muted)]'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </MockBrowser>
  ),
  form: (
    <MockBrowser>
      <div className="space-y-1.5">
        <Label text="TITLE" />
        <FauxField />
        <Label text="DESCRIPTION" />
        <div className="h-8 rounded bg-[color:var(--color-surface-sunken)]" />
      </div>
    </MockBrowser>
  ),
  submit: (
    <MockBrowser>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-[color:var(--color-ruby)] text-white text-[8px]">
            ✓
          </span>
          <div className="h-2 flex-1 rounded bg-[color:var(--color-border)]" />
        </div>
        <div className="text-center pt-2">
          <span className="inline-block px-2 py-0.5 rounded-full bg-[oklch(95%_0.06_75)] text-[oklch(38%_0.12_60)] text-[9px] font-semibold uppercase tracking-wider">
            Pending review
          </span>
        </div>
      </div>
    </MockBrowser>
  ),
  'photo-good': (
    <PhotoFrame>
      <div className="absolute inset-2 rounded bg-gradient-to-br from-[oklch(80%_0.04_30)] via-[oklch(70%_0.06_60)] to-[oklch(60%_0.08_30)]" />
      <span className="relative z-10 text-white/95 text-2xl">📷</span>
      <Badge tone="ruby" text="Sharp" />
    </PhotoFrame>
  ),
  'photo-angles': (
    <div className="grid grid-cols-3 gap-1.5 w-full max-w-[180px]">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="aspect-square rounded bg-gradient-to-br from-[color:var(--color-border-strong)] to-[color:var(--color-border)] flex items-center justify-center text-base"
        >
          📷
        </div>
      ))}
    </div>
  ),
  'photo-size': (
    <PhotoFrame>
      <div className="absolute inset-2 rounded bg-[color:var(--color-border)]" />
      <Badge tone="warm" text="Resize first" />
    </PhotoFrame>
  ),
  tabs: (
    <MockBrowser>
      <div className="flex gap-1.5 mb-2">
        <Pill active>All</Pill>
        <Pill>Live</Pill>
        <Pill>Pending</Pill>
      </div>
      <div className="space-y-1.5">
        <Row />
        <Row />
        <Row />
      </div>
    </MockBrowser>
  ),
  profile: (
    <MockBrowser>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-[color:var(--color-border-strong)]" />
        <div className="space-y-1">
          <div className="h-2 w-20 rounded bg-[color:var(--color-border-strong)]" />
          <div className="h-1.5 w-12 rounded bg-[color:var(--color-border)]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <FauxField />
        <FauxField />
      </div>
    </MockBrowser>
  ),
  notifications: (
    <MockBrowser>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2 py-1 border-b border-[color:var(--color-border)] last:border-0"
        >
          <div className="flex-1 space-y-1">
            <div className="h-1.5 w-3/4 rounded bg-[color:var(--color-border-strong)]" />
            <div className="h-1 w-1/2 rounded bg-[color:var(--color-border)]" />
          </div>
          <div className={`w-7 h-3.5 rounded-full ${i === 1 ? 'bg-[color:var(--color-ruby)]' : 'bg-[color:var(--color-border)]'}`}>
            <div className={`w-3 h-3 mt-[1px] rounded-full bg-white shadow ${i === 1 ? 'ml-3.5' : 'ml-0.5'}`} />
          </div>
        </div>
      ))}
    </MockBrowser>
  ),
};

function MockBrowser({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[260px] rounded-[var(--radius-md)] bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[color:var(--color-border)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-border-strong)]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-border-strong)]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-border-strong)]" />
      </div>
      <div className="p-3 min-h-[100px]">{children}</div>
    </div>
  );
}

function MockEmail({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[220px] rounded-[var(--radius-md)] bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-3 py-1.5 border-b border-[color:var(--color-border)] text-[9px] font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)]">
        Inbox
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function PhotoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-32 h-24 rounded-[var(--radius-md)] bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] shadow-[var(--shadow-card)] flex items-center justify-center">
      {children}
    </div>
  );
}

function Badge({ tone, text }: { tone: 'ruby' | 'warm'; text: string }) {
  const cls =
    tone === 'ruby'
      ? 'bg-[color:var(--color-ruby)] text-white'
      : 'bg-[oklch(95%_0.06_75)] text-[oklch(38%_0.12_60)]';
  return (
    <span
      className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold tracking-wider uppercase ${cls}`}
    >
      {text}
    </span>
  );
}

function FauxField() {
  return <div className="h-5 rounded bg-[color:var(--color-surface-sunken)]" />;
}

function FauxButton({ label }: { label: string }) {
  return (
    <div className="h-6 rounded-full bg-[color:var(--color-ruby)] text-white text-[10px] font-semibold flex items-center justify-center">
      {label}
    </div>
  );
}

function FauxNavItem({ active }: { active?: boolean } = {}) {
  return (
    <div
      className={`h-4 rounded ${
        active ? 'bg-[color:var(--color-ruby-soft)]' : 'bg-[color:var(--color-border)]'
      }`}
    />
  );
}

function Label({ text }: { text: string }) {
  return (
    <div className="text-[8px] font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)]">
      {text}
    </div>
  );
}

function Pill({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
        active
          ? 'bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby-deep)]'
          : 'bg-[color:var(--color-border)] text-[color:var(--color-ink-muted)]'
      }`}
    >
      {children}
    </span>
  );
}

function Row() {
  return (
    <div className="flex items-center gap-2 py-1 border-b border-[color:var(--color-border)] last:border-0">
      <div className="flex-1 space-y-0.5">
        <div className="h-1.5 w-3/4 rounded bg-[color:var(--color-border-strong)]" />
        <div className="h-1 w-1/2 rounded bg-[color:var(--color-border)]" />
      </div>
      <Pill active>Live</Pill>
    </div>
  );
}
