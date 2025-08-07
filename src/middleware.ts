
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/'];
const PROTECTED_ROUTE_PREFIX = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Since we are using localStorage, the server-side middleware no longer has access
  // to the token directly via cookies in a reliable way for protecting routes.
  // Route protection will be handled client-side in the `AppLayout`.
  // If a user tries to access a protected route without a session, the layout
  // will redirect them to the login page.
  
  // This middleware can still be useful for other purposes, like redirecting
  // the root path to the dashboard or login page.
  
  if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (This is for our BFF routes, though we've removed it for now)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
