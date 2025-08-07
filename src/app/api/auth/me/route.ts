// /src/app/api/auth/me/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_TOKEN_COOKIE_NAME, API_URL, API_KEY } from '@/lib/constants';

// This route handler acts as a secure backend-for-frontend (BFF).
// It fetches user details on the server side using the secure httpOnly token.
export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Forward the request to your actual backend API to get user details
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': API_KEY,
      },
      cache: 'no-store', // Always fetch the latest user data
    });

    const data = await res.json();

    if (!res.ok) {
      // Forward the error from the backend API
      return NextResponse.json({ error: data.message || 'Failed to fetch user' }, { status: res.status });
    }

    // On success, return the user data
    return NextResponse.json(data);

  } catch (error) {
    console.error('API /me route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
