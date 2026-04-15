'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ListingForm, type ListingFormValues } from '@/components/forms/ListingForm';
import type { PendingImage } from '@/components/forms/ImageUploader';
import { useAuth } from '@/lib/auth/AuthProvider';

interface SubmitResponse {
  success: boolean;
  id: number;
  status: string;
  message: string;
}

export default function PostAdPage() {
  const router = useRouter();
  const { user, loading, authedFetch } = useAuth();
  const [images, setImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [stage, setStage] = useState<'idle' | 'submitting' | 'uploading'>('idle');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/post-ad');
    }
  }, [loading, user, router]);

  async function handleSubmit(values: ListingFormValues) {
    setError(null);
    setStage('submitting');
    try {
      const response = await authedFetch<SubmitResponse>('/my/listings', {
        method: 'POST',
        body: JSON.stringify(values),
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
        <div className="mt-6 flex flex-wrap gap-3">
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

  return (
    <div className="container-page pt-8 md:pt-14 pb-16 max-w-2xl">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>
          ›
        </span>
        <Link href="/account" className="hover:text-[color:var(--color-ink)]">
          Account
        </Link>
        <span className="mx-1.5" aria-hidden>
          ›
        </span>
        <span className="text-[color:var(--color-ink)]">Post an ad</span>
      </nav>

      <header className="mt-4 mb-8">
        <h1 className="section-title" style={{ fontSize: 'clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem)' }}>
          Post a new ad
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
          Submit the basics now and an admin will review before it goes live.
        </p>
      </header>

      <ListingForm
        mode="create"
        images={images}
        onImagesChange={setImages}
        onSubmit={handleSubmit}
        submitLabel="Submit for review"
        submittingLabel="Submitting…"
        stage={stage}
        error={error}
      />
    </div>
  );
}
