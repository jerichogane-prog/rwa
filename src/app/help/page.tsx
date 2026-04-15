import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpStep, HelpStepImage, HelpStepImageProps } from '@/components/help/HelpStep';

export const metadata: Metadata = {
  title: 'Help & support',
  description:
    'Step-by-step guides for posting an ad, managing your account, photo tips, and staying safe on Ruby Want Ads.',
  alternates: { canonical: '/help' },
};

const QUICK_LINKS = [
  { href: '#getting-started', label: 'Getting started' },
  { href: '#posting-an-ad', label: 'Posting an ad' },
  { href: '#photos', label: 'Photo tips' },
  { href: '#managing', label: 'Managing your listings' },
  { href: '#safety', label: 'Safety & privacy' },
  { href: '#contact', label: 'Still stuck?' },
];

export default function HelpPage() {
  return (
    <div className="container-page pt-10 md:pt-14 pb-20">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>
          ›
        </span>
        <span className="text-[color:var(--color-ink)]">Help & support</span>
      </nav>

      <header className="mt-6 mb-10 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--color-ruby)]">
          Help center
        </p>
        <h1 className="hero-display mt-4">How can we help?</h1>
        <p className="mt-5 text-lg text-[color:var(--color-ink-muted)]">
          Short, click-through guides for everything Ruby Want Ads. If you can&apos;t find an
          answer here, our team is one tap away.
        </p>
      </header>

      <nav aria-label="On this page" className="mb-12">
        <ul className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex items-center px-3.5 py-2 rounded-full bg-[color:var(--color-surface-raised)] border border-[color:var(--color-border)] text-sm font-medium text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-ruby)]/40 hover:text-[color:var(--color-ruby)] transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <GettingStarted />
      <PostingAnAd />
      <PhotoTips />
      <ManagingListings />
      <Safety />
      <ContactCta />
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-28">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--color-ruby)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 section-title">{title}</h2>
        {description && (
          <p className="mt-3 text-base text-[color:var(--color-ink-muted)]">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}

function GettingStarted() {
  return (
    <Section
      id="getting-started"
      eyebrow="Step 1"
      title="Getting started"
      description="Browsing is free and open to everyone. Posting an ad just needs a free account so we can confirm you’re a real person from the area."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <HelpStep
          step={1}
          title="Create an account"
          body="Click Register from any page. We only need a username, email, and password — your address never appears on listings."
          cta={{ href: '/register', label: 'Register now' }}
          image={{ kind: 'register' }}
        />
        <HelpStep
          step={2}
          title="Verify your email"
          body="Open the verification link we email you, then come back to log in. Check your spam folder if you don’t see it."
          image={{ kind: 'verify' }}
        />
        <HelpStep
          step={3}
          title="You’re in"
          body="Land on the home page, search for what you need, or pick a category. Your avatar in the top-right opens a menu with your listings, messages, favorites, and settings."
          cta={{ href: '/account', label: 'Open my account' }}
          image={{ kind: 'account' }}
        />
      </div>
    </Section>
  );
}

function PostingAnAd() {
  return (
    <Section
      id="posting-an-ad"
      eyebrow="Step 2"
      title="Posting an ad"
      description="Listings with a clear title, a couple of photos, and a real description sell the fastest. The whole flow takes about a minute."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <HelpStep
          step={1}
          title="Click Post an ad"
          body="It’s in the top-right of every page on desktop, and inside the menu on mobile."
          image={{ kind: 'post-button' }}
        />
        <HelpStep
          step={2}
          title="Pick a category"
          body="Choose the closest category — sub-categories help buyers find you. One ad per category; if your item could fit two, post twice."
          image={{ kind: 'categories' }}
        />
        <HelpStep
          step={3}
          title="Title and description"
          body="Lead with the make/model/condition. Include details a buyer would ask: size, mileage, year, included extras."
          image={{ kind: 'form' }}
        />
        <HelpStep
          step={4}
          title="Submit"
          body="Once approved, your ad looks like this — title, gallery, price, and a Contact Seller form buyers can use without ever seeing your email. It sits in My Listings under Pending while it waits for review."
          cta={{ href: '/post-ad', label: 'Post an ad now' }}
          image={{ kind: 'submit' }}
        />
      </div>
    </Section>
  );
}

function PhotoTips() {
  return (
    <Section
      id="photos"
      eyebrow="Tip"
      title="Photo tips"
      description="Items with photos sell faster — but most phone photos are way bigger than they need to be."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <HelpStep
          step="✓"
          title="Daylight, plain background"
          body="Natural light and a clean wall or floor reads as trustworthy. Avoid dark, blurry phone shots."
          image={{ kind: 'photo-good' }}
        />
        <HelpStep
          step="✓"
          title="Multiple angles"
          body="Front, back, any wear or damage. Buyers won’t ask questions if they can already see the answer."
          image={{ kind: 'photo-angles' }}
        />
        <HelpStep
          step="!"
          title="Resize before uploading"
          body="We accept JPEG, PNG, WebP, or GIF up to 8MB each, 8 images per listing. Most newer phone photos are 6–10MB straight out of the camera — use your phone’s built-in resize before uploading."
          image={{ kind: 'photo-size' }}
        />
      </div>
    </Section>
  );
}

function ManagingListings() {
  return (
    <Section
      id="managing"
      eyebrow="Account"
      title="Managing your listings"
      description="Everything you’ve posted lives in My Account, sorted by status."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <HelpStep
          step="A"
          title="See how buyers find you"
          body="Your ad shows up alongside others in the listings grid with its title, cover photo, price, and type badge. The Live tab in My Listings surfaces the ones currently visible."
          cta={{ href: '/account/listings', label: 'My listings' }}
          image={{ kind: 'tabs' }}
        />
        <HelpStep
          step="B"
          title="Update your contact info"
          body="Profile holds your phone, WhatsApp, and website. Whatever you save here appears on the Contact panel of your listings."
          cta={{ href: '/account/profile', label: 'Edit profile' }}
          image={{ kind: 'profile' }}
        />
        <HelpStep
          step="C"
          title="Notification preferences"
          body="Choose what we email you about — buyer inquiries, status changes, expiry reminders."
          cta={{ href: '/account/notifications', label: 'Notifications' }}
          image={{ kind: 'notifications' }}
        />
      </div>
    </Section>
  );
}

function Safety() {
  return (
    <Section
      id="safety"
      eyebrow="Stay safe"
      title="Safety & privacy"
      description="A few habits that keep classified buying and selling smooth."
    >
      <ul className="grid gap-3 md:grid-cols-2">
        {SAFETY_TIPS.map((tip) => (
          <li
            key={tip.title}
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <span
                aria-hidden
                className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-[color:var(--color-ruby-soft)] text-[color:var(--color-ruby)] font-bold"
              >
                {tip.icon}
              </span>
              {tip.title}
            </h3>
            <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">{tip.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const SAFETY_TIPS = [
  {
    icon: '↗',
    title: 'Meet in public',
    body: 'A coffee shop, a bank lobby, or a busy parking lot is safer than a home. Go in daylight and bring a friend.',
  },
  {
    icon: '$',
    title: 'Cash or instant transfer',
    body: 'Avoid checks from people you don’t know. If you accept one, wait for it to clear before handing the item over.',
  },
  {
    icon: '🔒',
    title: 'Keep contact in-app',
    body: 'Use the Contact Seller form first. Buyers can’t see your phone unless you put it in your profile.',
  },
  {
    icon: '!',
    title: 'Trust your gut',
    body: 'If a price seems too good or a buyer is rushing you, pause. Real buyers are happy to wait a day.',
  },
];

function ContactCta() {
  return (
    <section
      id="contact"
      className="mt-20 scroll-mt-28 rounded-[var(--radius-xl)] bg-[color:var(--color-ink)] text-white p-8 md:p-12 text-center"
    >
      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--color-accent)]">
        Still stuck?
      </p>
      <h2 className="mt-3 text-3xl md:text-4xl font-[family-name:var(--font-archivo)] font-extrabold tracking-tight">
        Talk to a real human.
      </h2>
      <p className="mt-3 max-w-xl mx-auto text-sm text-white/70">
        We&apos;re a small Elko team. Email us or call during business hours — happy to walk you
        through anything.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href="mailto:info@global1media.com"
          className="inline-flex items-center px-5 py-2.5 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] transition-colors"
        >
          Email support
        </a>
        <a
          href="tel:+17757771196"
          className="inline-flex items-center px-5 py-2.5 rounded-full border border-white/20 text-sm font-semibold hover:bg-white/10 transition-colors"
        >
          Call (775) 777-1196
        </a>
      </div>
    </section>
  );
}

export type { HelpStepImageProps };
