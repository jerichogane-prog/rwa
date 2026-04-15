'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { TextField } from '@/components/forms/TextField';
import { ImageUploader, type PendingImage } from '@/components/forms/ImageUploader';
import { CategoryFields } from '@/components/forms/CategoryFields';
import { useAuth } from '@/lib/auth/AuthProvider';
import { flattenTaxonomy } from '@/lib/taxonomy';
import type { TaxonomyNode } from '@/lib/wp';

const REST_BASE = `${process.env.NEXT_PUBLIC_WP_REST}/rwa/v1`;

interface SubmitResponse {
  success: boolean;
  id: number;
  status: string;
  message: string;
}

export default function PostAdPage() {
  const router = useRouter();
  const { user, loading, authedFetch } = useAuth();
  const [categories, setCategories] = useState<TaxonomyNode[]>([]);
  const [locations, setLocations] = useState<TaxonomyNode[]>([]);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [stage, setStage] = useState<'idle' | 'creating' | 'uploading'>('idle');
  const [stateSlug, setStateSlug] = useState<string>('');
  const [categorySlug, setCategorySlug] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/post-ad');
    }
  }, [loading, user, router]);

  useEffect(() => {
    Promise.all([
      fetch(`${REST_BASE}/categories`).then((r) => r.json() as Promise<TaxonomyNode[]>),
      fetch(`${REST_BASE}/locations`).then((r) => r.json() as Promise<TaxonomyNode[]>),
    ])
      .then(([c, l]) => {
        setCategories(c);
        setLocations(l);
      })
      .catch(() => {
        // non-fatal; user can still submit without taxonomy
      });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const stateValue = String(data.get('state') ?? '').trim();
    const citySlug = String(data.get('city_slug') ?? '').trim();
    const cityText = String(data.get('city') ?? '').trim();
    const dynamicFields: Record<string, string> = {};
    for (const [key, value] of data.entries()) {
      const match = key.match(/^fields\[(.+)\]$/);
      if (match && typeof value === 'string' && value !== '') {
        dynamicFields[match[1]] = value;
      }
    }
    const payload = {
      title: String(data.get('title') ?? '').trim(),
      description: String(data.get('description') ?? '').trim(),
      price: Number(data.get('price') ?? 0),
      category: String(data.get('category') ?? ''),
      // Prefer the most specific taxonomy slug the user picked so the WP
      // plugin still files the listing under the right location term.
      location: citySlug || stateValue,
      state: stateValue,
      city: citySlug || cityText,
      address: String(data.get('address') ?? '').trim(),
      zipcode: String(data.get('zipcode') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      ad_type: String(data.get('ad_type') ?? 'sell'),
      fields: dynamicFields,
    };
    setError(null);
    setStage('creating');
    try {
      const response = await authedFetch<SubmitResponse>('/my/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (images.length > 0) {
        setStage('uploading');
        const form = new FormData();
        images.forEach((img, i) => form.append(`image_${i}`, img.file, img.file.name));
        try {
          await authedFetch(`/my/listings/${response.id}/images`, {
            method: 'POST',
            body: form,
          });
        } catch (uploadErr) {
          setError(
            `Listing submitted, but photos failed to upload: ${
              uploadErr instanceof Error ? uploadErr.message : 'unknown error'
            }`,
          );
        }
      }

      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your listing.');
    } finally {
      setStage('idle');
    }
  }

  const stateOptions = useMemo(
    () => locations.map((n) => ({ value: n.slug, label: n.name })),
    [locations],
  );
  const cityOptions = useMemo(() => {
    const parent = locations.find((n) => n.slug === stateSlug);
    return parent?.children?.map((n) => ({ value: n.slug, label: n.name })) ?? [];
  }, [locations, stateSlug]);

  if (loading || !user) {
    return (
      <div className="container-page py-16">
        <div className="h-6 w-40 bg-[color:var(--color-surface-sunken)] rounded animate-pulse" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="container-page pt-12 pb-16 max-w-xl">
        <h1 className="section-title" style={{ fontSize: '2.25rem' }}>
          Submitted for review
        </h1>
        <p className="mt-3 text-[color:var(--color-ink-muted)]">{result.message}</p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/account"
            className="inline-flex items-center px-4 h-10 rounded-full bg-[color:var(--color-ruby)] !text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] transition-colors"
          >
            Back to account
          </Link>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="inline-flex items-center px-4 py-2 rounded-full border border-[color:var(--color-border-strong)] text-sm font-semibold hover:border-[color:var(--color-ink)]"
          >
            Post another
          </button>
        </div>
      </div>
    );
  }

  const categoryOptions = flattenTaxonomy(categories);

  return (
    <div className="container-page pt-10 md:pt-14 pb-16 max-w-2xl">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">Home</Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <Link href="/account" className="hover:text-[color:var(--color-ink)]">Account</Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <span className="text-[color:var(--color-ink)]">Post an ad</span>
      </nav>

      <header className="mt-4 mb-8">
        <h1 className="section-title" style={{ fontSize: '2.25rem' }}>
          Post a new ad
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
          Submit the basics now and an admin will review before it goes live.
          You can upload images from WordPress after review.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-6">
        <AdTypePicker />
        <TextField label="Title" name="title" required placeholder="2018 Toyota Hilux, low kms" />
        <TextField
          label="Description"
          name="description"
          as="textarea"
          rows={6}
          required
          placeholder="Describe condition, features, reason for selling…"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField label="Price (USD)" name="price" type="number" hint="Leave 0 for POA" />
          <TextField label="Phone (optional)" name="phone" type="tel" autoComplete="tel" />
        </div>

        <SelectField
          label="Category"
          name="category"
          options={categoryOptions}
          value={categorySlug}
          onChange={setCategorySlug}
        />

        <CategoryFields categorySlug={categorySlug} />

        <fieldset className="space-y-4">
          <legend className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)]">
            Location
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <PlainSelect
              label="State"
              name="state"
              options={stateOptions}
              value={stateSlug}
              onChange={setStateSlug}
            />
            {cityOptions.length > 0 ? (
              <PlainSelect label="City" name="city_slug" options={cityOptions} />
            ) : (
              <TextField label="City" name="city" autoComplete="address-level2" />
            )}
          </div>
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
            <TextField
              label="Address"
              name="address"
              autoComplete="street-address"
              placeholder="Street address"
            />
            <TextField
              label="Zip code"
              name="zipcode"
              autoComplete="postal-code"
            />
          </div>
        </fieldset>

        <ImageUploader value={images} onChange={setImages} />

        {error && (
          <p role="alert" className="text-sm text-[color:var(--color-ruby-deep)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={stage !== 'idle'}
          className="w-full h-12 rounded-full bg-[color:var(--color-ruby)] text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] disabled:opacity-70 transition-colors"
        >
          {stage === 'creating'
            ? 'Submitting…'
            : stage === 'uploading'
              ? `Uploading ${images.length} photo${images.length === 1 ? '' : 's'}…`
              : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}

const AD_TYPE_OPTIONS: { value: string; label: string; hint: string; icon: string }[] = [
  { value: 'sell', label: 'For sale', hint: 'Selling an item', icon: '$' },
  { value: 'buy', label: 'Wanted', hint: 'Looking to buy', icon: '?' },
  { value: 'rentlease', label: 'Rent / lease', hint: 'Renting or leasing', icon: '◧' },
  { value: 'lostfound', label: 'Lost & found', hint: 'Lost or found', icon: '!' },
  { value: 'job', label: 'Job', hint: 'Hiring', icon: '☷' },
  { value: 'event', label: 'Event', hint: 'Event or gathering', icon: '★' },
];

function AdTypePicker() {
  return (
    <fieldset>
      <legend className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-2">
        Ad type <span className="text-[color:var(--color-ruby)]">*</span>
      </legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AD_TYPE_OPTIONS.map((opt, i) => (
          <label
            key={opt.value}
            className="relative flex items-start gap-2 p-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] cursor-pointer transition-colors hover:border-[color:var(--color-ruby)]/40 has-[:checked]:border-[color:var(--color-ruby)] has-[:checked]:bg-[color:var(--color-ruby-soft)]"
          >
            <input
              type="radio"
              name="ad_type"
              value={opt.value}
              defaultChecked={i === 0}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="inline-flex w-6 h-6 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-sunken)] text-[color:var(--color-ink-subtle)] text-xs font-bold peer-checked:bg-[color:var(--color-ruby)] peer-checked:text-white"
            >
              {opt.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[color:var(--color-ink)]">
                {opt.label}
              </span>
              <span className="block text-[11px] text-[color:var(--color-ink-muted)] leading-snug">
                {opt.hint}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface SelectOption { value: string; label: string; depth?: number }

interface SelectFieldProps {
  label: string;
  name: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
}

function SelectField({ label, name, options, value, onChange }: SelectFieldProps) {
  const controlled = value !== undefined;
  return (
    <div>
      <label
        htmlFor={`field-${name}`}
        className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-1"
      >
        {label}
      </label>
      <select
        id={`field-${name}`}
        name={name}
        value={controlled ? value : undefined}
        defaultValue={controlled ? undefined : ''}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full h-11 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 text-sm focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.depth ? `${'— '.repeat(opt.depth)}${opt.label}` : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface PlainSelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

function PlainSelect({ label, name, options, value, onChange }: PlainSelectProps) {
  return (
    <div>
      <label
        htmlFor={`field-${name}`}
        className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-1"
      >
        {label}
      </label>
      <select
        id={`field-${name}`}
        name={name}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        defaultValue={value === undefined ? '' : undefined}
        className="w-full h-11 rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 text-sm focus:ring-2 focus:ring-[color:var(--color-ruby)] focus:outline-none"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
