
'use server';

import { cookies } from 'next/headers';
import { AUTH_TOKEN_COOKIE_NAME } from './constants';
import type { User } from '@/types';
import { API_URL, API_KEY } from './constants';


// This function is now the single source of truth for fetching the logged-in user's data on the server.
export async function getUser(): Promise<{ user: User | null; token: string | null }> {
  const token = cookies().get(AUTH_TOKEN_COOKIE_NAME)?.value;
  
  if (!token) {
    return { user: null, token: null };
  }

  try {
    // Make a secure, server-to-server call to your backend API to get user details.
    const res = await fetch(`${API_URL}/auth/me`, {
       headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': API_KEY,
      },
      // Important: Use no-store to ensure we always get the latest user data
      // and not a cached version.
      cache: 'no-store',
    });

    if (!res.ok) {
        console.error("Failed to fetch user from API", await res.text());
        return { user: null, token: null };
    }

    const data = await res.json();
    // Assuming the API returns { user: User, token: string }
    return { user: data.user, token: data.token };

  } catch (error) {
    console.error('Failed to fetch user in getUser:', error);
    return { user: null, token: null };
  }
}
