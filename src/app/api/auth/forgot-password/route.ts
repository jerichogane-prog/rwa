import { NextResponse, type NextRequest } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;

/**
 * Proxies a lost-password request to WordPress core's `wp-login.php`.
 *
 * The WP classifieds plugin doesn't expose a REST endpoint for password
 * resets, so we forward to the built-in handler. WordPress deliberately
 * does not leak whether the account exists — it always returns the same
 * redirect — so we mirror that and treat any non-5xx response as success.
 *
 * The reset email itself (with the `key`/`login` link) is sent by WP and
 * currently points at `wp-login.php`, which is acceptable for MVP.
 */
export async function POST(request: NextRequest) {
  if (!WP_URL) {
    return NextResponse.json(
      { success: false, message: 'WordPress URL is not configured.' },
      { status: 500 },
    );
  }

  let body: { user_login?: string } = {};
  try {
    body = (await request.json()) as { user_login?: string };
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const userLogin = (body.user_login ?? '').trim();
  if (!userLogin) {
    return NextResponse.json(
      { success: false, message: 'Enter your username or email.' },
      { status: 400 },
    );
  }

  const form = new URLSearchParams();
  form.set('user_login', userLogin);
  form.set('wp-submit', 'Get New Password');
  form.set('redirect_to', '');

  try {
    const res = await fetch(`${WP_URL}/wp-login.php?action=lostpassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html',
      },
      body: form.toString(),
      redirect: 'manual',
      cache: 'no-store',
    });

    // WP redirects on success (302 to `?checkemail=confirm`). Any 3xx or
    // 2xx response is considered a success from the client's perspective,
    // matching WP's own policy of not disclosing whether the account exists.
    if (res.status >= 500) {
      return NextResponse.json(
        { success: false, message: 'WordPress rejected the request.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Network error reaching WordPress.' },
      { status: 502 },
    );
  }
}
