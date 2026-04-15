import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

interface RevalidatePayload {
  secret?: string;
  tags?: string[];
  paths?: string[];
}

const KNOWN_TAGS = new Set([
  'listings',
  'categories',
  'locations',
  'tags',
  'menus',
  'pages',
  'ads',
  'ad-list',
]);

function isAllowedTag(tag: string): boolean {
  if (KNOWN_TAGS.has(tag)) return true;
  return /^(listing|page|menu|ad|ad-group):[a-z0-9_-]{1,120}$/i.test(tag);
}

function isAllowedPath(path: string): boolean {
  return typeof path === 'string' && path.startsWith('/') && path.length < 200 && !path.includes('..');
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Server not configured.' }, { status: 500 });
  }

  const provided =
    request.headers.get('x-revalidate-secret') ||
    new URL(request.url).searchParams.get('secret');

  let payload: RevalidatePayload;
  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    payload = {};
  }

  const bodySecret = payload.secret ?? provided;
  if (bodySecret !== secret) {
    return NextResponse.json({ error: 'Invalid secret.' }, { status: 401 });
  }

  const revalidated = { tags: [] as string[], paths: [] as string[], skipped: [] as string[] };

  for (const tag of payload.tags ?? []) {
    if (isAllowedTag(tag)) {
      // Next.js 16: revalidateTag requires a cacheLife profile.
      revalidateTag(tag, 'max');
      revalidated.tags.push(tag);
    } else {
      revalidated.skipped.push(`tag:${tag}`);
    }
  }

  for (const path of payload.paths ?? []) {
    if (isAllowedPath(path)) {
      revalidatePath(path);
      revalidated.paths.push(path);
    } else {
      revalidated.skipped.push(`path:${path}`);
    }
  }

  return NextResponse.json({ success: true, revalidated, now: new Date().toISOString() });
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 });
}
