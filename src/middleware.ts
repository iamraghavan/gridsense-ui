
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_TOKEN_COOKIE_NAME, USER_DETAILS_COOKIE_NAME } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  const userCookie = request.cookies.get(USER_DETAILS_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isHomePage = pathname === '/';
  
  // Regex to check for protected application routes.
  // This includes /dashboard, /channels, /api-keys, etc.
  const isAppRoute = /^\/(dashboard|channels|api-keys)/.test(pathname);

  if (token && userCookie) {
    // USER IS AUTHENTICATED
    try {
        const user = JSON.parse(userCookie);
        const userId = user.id;

        // If authenticated user tries to access login, register, or home page,
        // redirect them to their dashboard.
        if (isAuthPage || isHomePage) {
            return NextResponse.redirect(new URL(`/dashboard/${userId}`, request.url));
        }
        
        // If user is on a generic /dashboard URL, ensure they are sent
        // to their specific dashboard URL.
        if (pathname === '/dashboard') {
             return NextResponse.redirect(new URL(`/dashboard/${userId}`, request.url));
        }

    } catch(e) {
        // If cookie is malformed, it's safer to clear cookies and force re-login.
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete(AUTH_TOKEN_COOKIE_NAME);
        response.cookies.delete(USER_DETAILS_COOKIE_NAME);
        return response;
    }
  } else {
    // USER IS NOT AUTHENTICATED
    // If an unauthenticated user tries to access a protected app route,
    // redirect them to the login page.
    if (isAppRoute) {
      // Preserve the intended destination for a redirect after login, if desired.
      // For now, we'll just redirect to login.
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If none of the above conditions are met, allow the request to proceed.
  return NextResponse.next();
}

// This config specifies which routes the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * This ensures the middleware runs on all page navigations.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
