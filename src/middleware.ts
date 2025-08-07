
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_TOKEN_COOKIE_NAME, USER_DETAILS_COOKIE_NAME } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME);
  const userCookie = request.cookies.get(USER_DETAILS_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const authenticatedAppRoutes = ['/dashboard', '/channels', '/api-keys'];
  const guestRoutes = ['/login', '/register', '/'];

  if (token && userCookie) {
    // User is authenticated
    try {
        const user = JSON.parse(userCookie.value);
        const userId = user.id;

        // If trying to access a guest route, redirect to their dashboard
        if (guestRoutes.includes(pathname)) {
            return NextResponse.redirect(new URL(`/dashboard/${userId}`, request.url));
        }
        
        // If they are on the base /dashboard path, ensure they are on their specific user dashboard
        if (pathname === '/dashboard') {
             return NextResponse.redirect(new URL(`/dashboard/${userId}`, request.url));
        }

    } catch(e) {
        // If cookie is malformed, clear it and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete(AUTH_TOKEN_COOKIE_NAME);
        response.cookies.delete(USER_DETAILS_COOKIE_NAME);
        return response;
    }

  } else {
    // User is not authenticated
    // If trying to access a protected route, redirect to login
    if (authenticatedAppRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
