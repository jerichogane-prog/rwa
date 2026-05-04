'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, use } from 'react';
import { ListingForm, type ListingFormValues } from '@/components/forms/ListingForm';
import type { PendingImage } from '@/components/forms/ImageUploader';
import { useAuth } from '@/lib/auth/AuthProvider';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

interface ListingDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  phone: string;
  ad_type: string;
  category: string;
  location: string;
  post_status: string;
  images: ExistingImage[];
}

interface ExistingImage {
  id: number;
  url: string;
  thumb: string | null;
  width: number | null;
  height: number | null;
  alt: string;
}

interface ImagesResponse {
  listing_id: number;
  images: ExistingImage[];
}

interface UpdateResponse {
  success: boolean;
  id: number;
  post_status: string;
}

export default function EditListingPage({ params }: EditPageProps) {
  const { id } = use(params);
  const listingId = Number(id);
  const router = useRouter();
  const { user, loading: authLoading, authedFetch, authedUpload } = useAuth();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<'idle' | 'submitting' | 'uploading'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=/account/listings/${listingId}/edit`);
      return;
    }
    if (!Number.isFinite(listingId)) {
      setFetchError('Invalid listing id.');
      return;
    }
    let cancelled = false;
    authedFetch<ListingDetail>(`/my/listings/${listingId}`)
      .then((data) => {
        if (cancelled) return;
        setListing(data);
        setExistingImages(data.images ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setFetchError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, listingId, router, authedFetch]);

  const handleSubmit = useCallback(
    async (values: ListingFormValues) => {
      setError(null);
      setStage('submitting');
      try {
        const response = await authedFetch<UpdateResponse>(`/my/listings/${listingId}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });

        if (images.length > 0) {
          setStage('uploading');
          setUploadProgress(0);
          const form = new FormData();
          images.forEach((img, i) => form.append(`image_${i}`, img.file, img.file.name));
          try {
            const res = await authedUpload<{ images: ExistingImage[] }>(
              `/my/listings/${listingId}/images`,
              form,
              { onProgress: setUploadProgress },
            );
            setExistingImages(res.images ?? existingImages);
          } catch (uploadErr) {
            setError(
              `Listing saved, but photos failed to upload: ${
                uploadErr instanceof Error ? uploadErr.message : 'unknown error'
              }`,
            );
          }
        }

        images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setImages([]);
        setSavedStatus(response.post_status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save your listing.');
      } finally {
        setStage('idle');
        setUploadProgress(0);
      }
    },
    [authedFetch, authedUpload, existingImages, images, listingId],
  );

  const removeExisting = useCallback(
    async (attachmentId: number) => {
      setRemovingId(attachmentId);
      try {
        const res = await authedFetch<ImagesResponse>(
          `/my/listings/${listingId}/images/${attachmentId}`,
          { method: 'DELETE' },
        );
        setExistingImages(res.images ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not remove image.');
      } finally {
        setRemovingId(null);
      }
    },
    [authedFetch, listingId],
  );

  if (authLoading || (!listing && !fetchError)) {
    return (
      <div className="container-page pt-8 pb-16 max-w-2xl">
        <div className="h-8 w-48 rounded bg-[color:var(--color-surface-sunken)] animate-pulse" />
        <div className="mt-6 h-96 rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] animate-pulse" />
      </div>
    );
  }

  if (fetchError || !listing) {
    return (
      <div className="container-page pt-8 pb-16 max-w-2xl">
        <h1 className="text-2xl font-bold">Unable to edit this listing</h1>
        <p className="mt-2 text-[color:var(--color-ink-muted)]">{fetchError ?? 'Not found.'}</p>
        <Link href="/account/listings" className="mt-4 inline-block text-[color:var(--color-ruby)] hover:underline">
          ← Back to My Listings
        </Link>
      </div>
    );
  }

  if (savedStatus) {
    return (
      <div className="container-page pt-12 pb-16 max-w-xl">
        <h1 className="section-title" style={{ fontSize: '2rem' }}>
          Changes saved
        </h1>
        <p className="mt-3 text-[color:var(--color-ink-muted)]">
          {savedStatus === 'pending'
            ? 'Your edit was saved. The ad is back in review before it goes live again.'
            : 'Your edit was saved.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/account/listings"
            className="inline-flex items-center px-4 h-10 rounded-full bg-[color:var(--color-ruby)] !text-white text-sm font-semibold hover:bg-[color:var(--color-ruby-deep)] transition-colors"
          >
            Back to My Listings
          </Link>
          <button
            type="button"
            onClick={() => setSavedStatus(null)}
            className="inline-flex items-center px-4 py-2 rounded-full border border-[color:var(--color-border-strong)] text-sm font-semibold hover:border-[color:var(--color-ink)]"
          >
            Keep editing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page pt-8 md:pt-14 pb-16 max-w-2xl">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/account" className="hover:text-[color:var(--color-ink)]">
          Account
        </Link>
        <span className="mx-1.5" aria-hidden>
          ›
        </span>
        <Link href="/account/listings" className="hover:text-[color:var(--color-ink)]">
          My listings
        </Link>
        <span className="mx-1.5" aria-hidden>
          ›
        </span>
        <span className="text-[color:var(--color-ink)]">Edit</span>
      </nav>

      <header className="mt-4 mb-8">
        <h1 className="section-title" style={{ fontSize: 'clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem)' }}>
          Edit listing
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
          Changes to a live ad will return it to review before republishing.
        </p>
      </header>

      <ListingForm
        mode="edit"
        initialValues={{
          title: listing.title,
          description: listing.description,
          price: listing.price,
          phone: listing.phone,
          ad_type: listing.ad_type || 'sell',
          category: listing.category,
          location: listing.location,
        }}
        images={images}
        onImagesChange={setImages}
        galleryPanel={
          existingImages.length > 0 ? (
            <div>
              <p className="block text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)] mb-2">
                Current photos
              </p>
              <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {existingImages.map((img, i) => (
                  <li key={img.id} className="relative group aspect-square">
                    <Image
                      src={img.thumb ?? img.url}
                      alt={img.alt || ''}
                      fill
                      unoptimized
                      className="object-cover rounded-[var(--radius-sm)]"
                      sizes="(min-width: 640px) 20vw, 33vw"
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-[color:var(--color-ruby)] text-white rounded-full">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExisting(img.id)}
                      disabled={removingId === img.id}
                      aria-label="Remove image"
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/70 text-white text-base leading-none flex items-center justify-center disabled:opacity-50"
                    >
                      {removingId === img.id ? '…' : '×'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null
        }
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        submittingLabel="Saving…"
        stage={stage}
        uploadProgress={uploadProgress}
        error={error}
      />
    </div>
  );
}
