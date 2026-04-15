'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { TextField } from '@/components/forms/TextField';
import { ImageUploader, type PendingImage } from '@/components/forms/ImageUploader';
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
    const payload = {
      title: String(data.get('title') ?? '').trim(),
      description: String(data.get('description') ?? '').trim(),
      price: Number(data.get('price') ?? 0),
      category: String(data.get('category') ?? ''),
      location: String(data.get('location') ?? ''),
      phone: String(data.get('phone') ?? '').trim(),
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
          // Keep the listing but surface upload warning
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
  const locationOptions = flattenTaxonomy(locations);

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

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Category" name="category" options={categoryOptions} />
          <SelectField label="Location" name="location" options={locationOptions} />
        </div>

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

interface SelectOption { value: string; label: string; depth?: number }
interface SelectFieldProps { label: string; name: string; options: SelectOption[] }

function SelectField({ label, name, options }: SelectFieldProps) {
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
