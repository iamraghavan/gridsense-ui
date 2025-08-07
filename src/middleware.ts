
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_TOKEN_COOKIE_NAME } from '@/lib/constants';

// This is a list of pages that are accessible to everyone, even unauthenticated users.
const PUBLIC_ROUTES = ['/login', '/register', '/'];

// This is a list of pages that are part of the authenticated application.
// We use `startsWith` to match dynamic routes like /dashboard/[userId] and /channels/[channelId]
const PROTECTED_ROUTE_PREFIXES = ['/dashboard', '/channels', '/api-keys'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (token) {
    // USER IS AUTHENTICATED

    // If an authenticated user tries to access a public route (e.g., login, register, home),
    // redirect them to a generic /dashboard path. The AppLayout's logic will handle
    // fetching the correct user ID and displaying the right content.
    if (isPublicRoute) {
      // Using new URL() ensures the redirect is absolute
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // USER IS NOT AUTHENTICATED

    // If a non-authenticated user tries to access a protected app route,
    // redirect them to the login page.
    if (isProtectedRoute) {
        let from = pathname;
        if (request.nextUrl.search) {
            from += request.nextUrl.search;
        }
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', from);
        return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to proceed if no redirect conditions are met.
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
