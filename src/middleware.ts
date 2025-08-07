
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_TOKEN_COOKIE_NAME } from '@/lib/constants';

// This is a list of pages that are accessible to the public (unauthenticated users)
const PUBLIC_ROUTES = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  
  // This is the dynamic dashboard path prefix
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/channels') || pathname.startsWith('/api-keys');

  if (token) {
    // USER IS AUTHENTICATED
    
    // If an authenticated user tries to access a public route (e.g., login, register, home),
    // redirect them to the dashboard. We need to extract the user ID for the redirect URL.
    // Since we can't easily get the user ID here without another API call,
    // we will redirect to a generic /dashboard path and let the page handle the final redirect.
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If the user is authenticated and trying to go to `/dashboard`, we let the page
    // `dashboard/[userId]/page.tsx` handle the rendering. The AppLayout will fetch user data
    // and correctly construct nav links. The middleware's job is just to protect routes.
     if (pathname === '/dashboard') {
      // We can't know the user ID here, so we let the client-side logic in AppLayout
      // or a server component on the dashboard page handle fetching the ID and displaying data.
      // This is a safe pass-through.
      return NextResponse.next();
    }

  } else {
    // USER IS NOT AUTHENTICATED

    // If a non-authenticated user tries to access a protected app route,
    // redirect them to the login page.
    if (isAppRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow the request to proceed if no redirect conditions are met.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, we want to allow our /api/auth/me to be called)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
