import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Publicly accessible pages
  const isPublicPage = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register');
  
  // If the page is public, we don't need to do anything special.
  // But if a logged-in user tries to visit login/register, we redirect them.
  if (isPublicPage) {
    if (session && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
      const userId = session.user?._id;
      if (userId) {
        return NextResponse.redirect(new URL(`/dashboard/${userId}`, request.url));
      }
    }
    return NextResponse.next();
  }

  // If trying to access a protected page without a session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in, ensure they can only access their own dashboard pages
  if (pathname.startsWith('/dashboard')) {
    const userId = session.user?._id;
    if (userId && pathname.startsWith(`/dashboard/`) && !pathname.startsWith(`/dashboard/${userId}`)) {
        const path = pathname.split('/').slice(3).join('/');
        return NextResponse.redirect(new URL(`/dashboard/${userId}/${path}`, request.url));
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
     * - assets (any other static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
