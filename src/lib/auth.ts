
'use server';

import { cookies } from 'next/headers';
import { AUTH_TOKEN_COOKIE_NAME, USER_DETAILS_COOKIE_NAME } from './constants';
import type { User } from '@/types';

// This function needs to be async to use `cookies()`
export async function getUser(): Promise<{ user: User | null }> {
  // We don't need to await `cookies()` itself, but we should be in an async function
  // to properly handle the promise-like nature of the cookie store in some contexts.
  const cookieStore = cookies();
  
  const token = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    return { user: null };
  }

  const userDetailsCookie = cookieStore.get(USER_DETAILS_COOKIE_NAME)?.value;
  if (!userDetailsCookie) {
    // If we have a token but no user details, the session is inconsistent.
    // It's safer to treat the user as logged out.
    // We could also try to re-fetch from an API here if we had an endpoint for it.
    return { user: null };
  }

  try {
    const user: User = JSON.parse(userDetailsCookie);
    return { user };
  } catch (error) {
    console.error('Failed to parse user details from cookie:', error);
    return { user: null };
  }
}
