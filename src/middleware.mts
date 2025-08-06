
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_TOKEN_COOKIE_NAME } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/channels') || pathname.startsWith('/api-keys');

  if (isAppPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((isAuthPage || pathname === '/') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
