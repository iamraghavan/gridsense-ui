
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_TOKEN_COOKIE_NAME } from '@/lib/constants';

const PUBLIC_ROUTES = ['/login', '/register', '/'];
const PROTECTED_ROUTE_PREFIX = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isProtectedRoute = pathname.startsWith(PROTECTED_ROUTE_PREFIX);

  if (token) {
    // If user is authenticated
    if (isPublicRoute) {
      // Redirect from public routes like /login, /register, / to the dashboard
      // We don't know the userId here, so we redirect to a generic path.
      // The AppLayout will fetch the user and handle the final URL.
      return NextResponse.redirect(new URL(PROTECTED_ROUTE_PREFIX, request.url));
    }
    // If the user tries to go to just /dashboard, we can't know their ID.
    // The AppLayout will handle fetching the user and redirecting to /dashboard/[userId]
    // if it gets a user object back. So we can just let this pass.
    if (pathname === PROTECTED_ROUTE_PREFIX) {
        return NextResponse.next();
    }

  } else {
    // If user is not authenticated
    if (isProtectedRoute) {
        // Redirect from protected routes to the login page
        let from = pathname;
        if (request.nextUrl.search) {
            from += request.nextUrl.search;
        }
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', from);
        return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (This is for our BFF routes like /api/auth/me)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
