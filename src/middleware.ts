
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_TOKEN_COOKIE_NAME } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const authenticatedRoutes = ['/dashboard', '/channels', '/api-keys'];
  const guestRoutes = ['/login', '/register'];

  if (token) {
    // If user is authenticated and tries to access login or register, redirect to dashboard
    if (guestRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // If user is not authenticated and tries to access a protected route, redirect to login
    if (authenticatedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/channels/:path*', '/api-keys/:path*', '/login', '/register'],
};
