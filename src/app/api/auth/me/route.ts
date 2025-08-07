// /src/app/api/auth/me/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_TOKEN_COOKIE_NAME, API_URL, API_KEY } from '@/lib/constants';

// This route handler acts as a secure backend-for-frontend (BFF).
// It safely uses the httpOnly cookie on the server to fetch user data.
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
      // Ensure we always get the latest user data, not a cached version.
      cache: 'no-store', 
    });

    const data = await res.json();

    if (!res.ok) {
      // Forward the error from the backend API
      console.error("BFF: Backend API error on /auth/me:", data);
      // Clear the invalid cookie
      const response = NextResponse.json({ error: data.message || 'Failed to fetch user' }, { status: res.status });
      response.cookies.delete(AUTH_TOKEN_COOKIE_NAME);
      return response;
    }

    // Your backend for a successful login/register returns a flat object.
    // The /me endpoint also returns the user object directly.
    if (!data || !data._id) {
        console.error("BFF: Malformed user data from /auth/me:", data);
        return NextResponse.json({ error: 'Invalid user data received from API' }, { status: 500 });
    }
    
    // On success, return the user data and the token itself so the client can use it
    // for subsequent client-side API calls.
    // The user's ID is changed from `_id` to `id` for better client-side consistency.
    const userObject = { ...data, id: data._id };
    
    const responseData = {
        user: userObject,
        token: token,
    };
    
    console.log("BFF: Successfully fetched user, returning to client:", responseData.user.id);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('BFF /api/auth/me route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
