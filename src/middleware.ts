
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
    // If user is authenticated and tries to access a public route like /login,
    // redirect them to the generic dashboard page. The AppLayout will handle
    // fetching the user data and rendering the correct content.
    if (isPublicRoute) {
      return NextResponse.redirect(new URL(PROTECTED_ROUTE_PREFIX, request.url));
    }
  } else {
    // If user is not authenticated and tries to access a protected route,
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
