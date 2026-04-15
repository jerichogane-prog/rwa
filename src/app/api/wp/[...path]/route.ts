import { NextResponse, type NextRequest } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Same-origin proxy to the WordPress REST API.
 *
 * The browser cannot hit `cms.rubywantads.com` directly because WordPress
 * does not send CORS headers for `rubywantads.com`. Routing through this
 * handler keeps every call same-origin and avoids the preflight entirely.
 */

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
  'accept-encoding',
]);

function buildHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

// `fetch` transparently decompresses the upstream body, so we must not
// forward the original Content-Encoding/Content-Length — otherwise the
// browser tries to gunzip already-decoded bytes (ERR_CONTENT_DECODING_FAILED).
const STRIP_RESPONSE = new Set([...HOP_BY_HOP, 'content-encoding', 'content-length']);

function buildResponseHeaders(res: Response): Headers {
  const headers = new Headers();
  res.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  if (!WP_URL) {
    return NextResponse.json(
      { success: false, message: 'WordPress URL is not configured.' },
      { status: 500 },
    );
  }

  const joined = path.map(encodeURIComponent).join('/');
  const target = `${WP_URL.replace(/\/$/, '')}/wp-json/${joined}${req.nextUrl.search}`;

  const init: RequestInit & { duplex?: 'half' } = {
    method: req.method,
    headers: buildHeaders(req),
    redirect: 'manual',
    cache: 'no-store',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body;
    init.duplex = 'half';
  }

  try {
    const upstream = await fetch(target, init);
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: buildResponseHeaders(upstream),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Network error reaching WordPress.' },
      { status: 502 },
    );
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

async function handler(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
};
