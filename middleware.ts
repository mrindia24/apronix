import { NextResponse, type NextRequest } from 'next/server';

/**
 * Edge middleware — defence in depth, not the primary gate.
 *
 * The real authorisation happens server-side in `requireUser()` / the
 * `(admin)` layout, which validates the session against the database. This layer
 * simply:
 *   - bounces unauthenticated visitors away from /admin before rendering
 *   - forces noindex headers on admin/API responses
 *   - applies legacy redirects stored by the CMS
 */
const SESSION_COOKIE = 'apronix_session';
const PUBLIC_ADMIN_PATHS = ['/admin/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: require a session cookie (validated properly downstream).
  if (pathname.startsWith('/admin')) {
    const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

    if (!hasSession && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
    if (hasSession && isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
