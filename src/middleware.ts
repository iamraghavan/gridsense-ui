
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_TOKEN_COOKIE_NAME, USER_DETAILS_COOKIE_NAME } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  const userCookie = request.cookies.get(USER_DETAILS_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isHomePage = pathname === '/';
  // Check if it's any page under the (app) group
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/channels') || pathname.startsWith('/api-keys');

  if (token && userCookie) {
    // User is authenticated
    try {
        const user = JSON.parse(userCookie);
        const userId = user.id;

        // If user is authenticated, redirect from auth pages or home page to their dashboard
        if (isAuthPage || isHomePage) {
            return NextResponse.redirect(new URL(`/dashboard/${userId}`, request.url));
        }
        
        // If user is on a generic app route like /dashboard, redirect to their specific one
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
    // If trying to access a protected app route, redirect to login
    if (isAppRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow the request to continue for all other cases
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
