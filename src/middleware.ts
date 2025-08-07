import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAuthPage) {
    if (session) {
      // If user is logged in, redirect from auth pages to their dashboard
      const userId = session.user?._id;
      if(userId) {
        return NextResponse.redirect(new URL(`/dashboard/${userId}`, request.url));
      }
      // If for some reason user id is not in session, let them re-login
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // If trying to access any other page without a session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to dashboard pages
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Redirect root channel paths to be nested under user dashboard
  if (pathname.startsWith('/channel')) {
      const userId = session.user?._id;
      if (userId) {
          const newPath = pathname.replace('/channel', `/dashboard/${userId}/channel`);
          return NextResponse.redirect(new URL(newPath, request.url));
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
     * - / (the root page, which will be the landing page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|^/$).*)',
  ],
};
