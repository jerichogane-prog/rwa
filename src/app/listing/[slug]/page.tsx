import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchListing } from '@/lib/wp';
import { Gallery } from '@/components/listings/Gallery';
import { ListingCard } from '@/components/listings/ListingCard';
import { ContactSellerForm } from '@/components/listings/ContactSellerForm';
import { AdSlot } from '@/components/ads/AdSlot';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, listingProductSchema } from '@/lib/seo/schema';
import { decodeEntities, formatPrice, formatRelativeDate } from '@/lib/format';

export const revalidate = 120;

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const listing = await fetchListing(slug);
    const yoast = listing.yoast;
    const decodedTitle = decodeEntities(listing.title);
    const decodedExcerpt = decodeEntities(listing.excerpt);
    const location = listing.locations[0] ? decodeEntities(listing.locations[0].name) : 'Elko, NV';
    const pricePart = listing.price > 0 ? formatPrice(listing.price, listing.price_type) : '';
    const derivedDescription = [
      pricePart,
      decodedExcerpt || `${decodedTitle} — classified listing on Ruby Want Ads in ${location}.`,
    ]
      .filter(Boolean)
      .join(' · ')
      .slice(0, 160);

    const title = decodeEntities(yoast?.title || '') || decodedTitle;
    const description =
      decodeEntities(yoast?.description || '') ||
      derivedDescription ||
      `${decodedTitle} — classified listing on Ruby Want Ads.`;

    return {
      title,
      description,
      alternates: yoast?.canonical ? { canonical: yoast.canonical } : { canonical: `/listing/${listing.slug}` },
      openGraph: {
        title,
        description,
        type: 'article',
        images: yoast?.og_image
          ? [{ url: yoast.og_image }]
          : listing.thumbnail
            ? [{ url: listing.thumbnail }]
            : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return { title: 'Listing not found', robots: { index: false } };
  }
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;

  let listing;
  try {
    listing = await fetchListing(slug);
  } catch {
    notFound();
  }

  const primaryCategory = listing.categories[0];
  const primaryLocation = listing.locations[0];
  const title = decodeEntities(listing.title);
  const sellerName = listing.seller ? decodeEntities(listing.seller.display_name) : '';
  const contact = listing.contact ?? {
    phone: listing.seller?.phone ?? '',
    email: listing.seller?.email ?? '',
    website: listing.seller?.website ?? '',
    whatsapp: listing.seller?.whatsapp ?? '',
  };
  const hasContact = Boolean(contact.phone || contact.email || contact.website || contact.whatsapp);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Listings', url: '/listings' },
    ...(primaryCategory
      ? [{ name: decodeEntities(primaryCategory.name), url: `/category/${primaryCategory.slug}` }]
      : []),
    { name: title, url: `/listing/${listing.slug}` },
  ];

  return (
    <div className="container-page pt-8 pb-16">
      <JsonLd data={listingProductSchema(listing)} id="product-ld" />
      <JsonLd data={breadcrumbSchema(crumbs)} id="breadcrumb-ld" />
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <Link href="/listings" className="hover:text-[color:var(--color-ink)]">
          Listings
        </Link>
        {primaryCategory && (
          <>
            <span className="mx-1.5" aria-hidden>›</span>
            <Link
              href={`/listings?category=${encodeURIComponent(primaryCategory.slug)}`}
              className="hover:text-[color:var(--color-ink)]"
            >
              {decodeEntities(primaryCategory.name)}
            </Link>
          </>
        )}
        <span className="mx-1.5" aria-hidden>›</span>
        <span className="text-[color:var(--color-ink)] line-clamp-1 inline-block max-w-[20ch] align-bottom">
          {title}
        </span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <article>
          <Gallery
            images={listing.gallery}
            fallbackImage={listing.thumbnail}
            fallbackTitle={listing.title}
          />

          <header className="mt-8">
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-[color:var(--color-ink-subtle)]">
              {primaryCategory && <span>{decodeEntities(primaryCategory.name)}</span>}
              {primaryLocation && <span>· {decodeEntities(primaryLocation.name)}</span>}
              {listing.condition && <span>· {decodeEntities(listing.condition)}</span>}
              {listing.featured && (
                <span className="text-[color:var(--color-ruby)]">· Featured</span>
              )}
            </div>
            <h1 className="mt-2 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-[family-name:var(--font-archivo)] font-extrabold leading-[1.05] tracking-tight">
              {title}
            </h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="text-3xl md:text-4xl font-bold text-[color:var(--color-ruby)]">
                {formatPrice(listing.price, listing.price_type)}
              </span>
              <span className="text-sm text-[color:var(--color-ink-subtle)]">
                Posted {formatRelativeDate(listing.date)}
              </span>
            </div>
          </header>

          {listing.content && (
            <div
              className="mt-8 prose-listing text-[color:var(--color-ink)] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: listing.content }}
            />
          )}

          {listing.custom_fields.length > 0 && (
            <section className="mt-10">
              <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Details</h2>
              <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5">
                {listing.custom_fields.map((field) => (
                  <div key={field.key} className="flex items-baseline justify-between gap-3 border-b border-[color:var(--color-border)]/50 pb-2 last:border-0 last:pb-0">
                    <dt className="text-xs font-semibold tracking-wider uppercase text-[color:var(--color-ink-subtle)]">
                      {decodeEntities(field.label)}
                    </dt>
                    <dd className="text-sm text-[color:var(--color-ink)] font-medium text-right">
                      {Array.isArray(field.value)
                        ? field.value.map((v) => decodeEntities(String(v))).join(', ')
                        : decodeEntities(String(field.value))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(listing.geo.address || (listing.geo.lat && listing.geo.lng)) && (
            <section className="mt-10">
              <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Location</h2>
              <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
                {[listing.geo.address, listing.geo.zipcode].filter(Boolean).join(' · ')}
              </p>
            </section>
          )}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {listing.seller && (
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5">
              <div className="flex items-center gap-3">
                {listing.seller.avatar && (
                  <Image
                    src={listing.seller.avatar}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[color:var(--color-ink-subtle)]">
                    Seller
                  </p>
                  <p className="text-base font-semibold">{sellerName}</p>
                  <p className="text-xs text-[color:var(--color-ink-subtle)]">
                    Member since {new Date(listing.seller.member_since).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>

              {hasContact && (
                <dl className="mt-4 space-y-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
                  {contact.phone && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[color:var(--color-ink-subtle)]">Phone</dt>
                      <dd>
                        <a
                          href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                          className="font-medium text-[color:var(--color-ruby)] hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {contact.whatsapp && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[color:var(--color-ink-subtle)]">WhatsApp</dt>
                      <dd>
                        <a
                          href={`https://wa.me/${contact.whatsapp.replace(/[^\d+]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[color:var(--color-ruby)] hover:underline"
                        >
                          {contact.whatsapp}
                        </a>
                      </dd>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[color:var(--color-ink-subtle)]">Email</dt>
                      <dd className="min-w-0">
                        <a
                          href={`mailto:${contact.email}`}
                          className="font-medium text-[color:var(--color-ruby)] hover:underline break-all"
                        >
                          {contact.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {contact.website && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[color:var(--color-ink-subtle)]">Website</dt>
                      <dd className="min-w-0">
                        <a
                          href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[color:var(--color-ruby)] hover:underline break-all"
                        >
                          {contact.website.replace(/^https?:\/\//, '')}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          )}

          <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-5">
            <h2 className="text-lg font-semibold mb-3">Contact seller</h2>
            <ContactSellerForm
              listingId={listing.id}
              sellerName={sellerName || 'the seller'}
            />
          </div>

          <AdSlot slot="listing-sidebar" variant="card" />
        </aside>
      </div>

      {listing.related.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title">More like this</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {listing.related.slice(0, 4).map((related) => (
              <ListingCard key={related.id} listing={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
