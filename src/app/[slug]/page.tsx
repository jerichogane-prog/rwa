import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPage } from '@/lib/wp';

export const revalidate = 300;

interface StaticPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page) return { title: 'Page not found' };
  return {
    title: page.yoast?.title || stripHtml(page.title),
    description: page.yoast?.description || stripHtml(page.excerpt).slice(0, 160),
    alternates: page.yoast?.canonical ? { canonical: page.yoast.canonical } : undefined,
    openGraph: {
      title: page.yoast?.title || stripHtml(page.title),
      description: page.yoast?.description || stripHtml(page.excerpt).slice(0, 160),
      type: 'article',
      images: page.yoast?.og_image
        ? [{ url: page.yoast.og_image }]
        : page.featuredImage
          ? [{ url: page.featuredImage }]
          : undefined,
    },
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page) notFound();

  return (
    <article className="container-page pt-10 md:pt-14 pb-16 max-w-3xl">
      <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--color-ink-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>›</span>
        <span
          className="text-[color:var(--color-ink)]"
          dangerouslySetInnerHTML={{ __html: page.title }}
        />
      </nav>

      <header className="mt-6 mb-8">
        <h1
          className="section-title"
          dangerouslySetInnerHTML={{ __html: page.title }}
        />
        <p className="mt-2 text-xs text-[color:var(--color-ink-subtle)]">
          Last updated{' '}
          {new Date(page.modified).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>

      {page.featuredImage && (
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)]">
          <Image
            src={page.featuredImage}
            alt={stripHtml(page.title)}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div
        className="prose-listing"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  );
}
