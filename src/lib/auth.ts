
'use server';

import { cookies } from 'next/headers';
import { AUTH_TOKEN_COOKIE_NAME, USER_DETAILS_COOKIE_NAME } from './constants';
import type { User } from '@/types';

// This function needs to be async to use `cookies()`
export async function getUser(): Promise<{ user: User | null }> {
  // Directly awaiting the `cookies()` call is not how it works. 
  // You get the store synchronously, but its methods might be used in async contexts.
  // The error comes from Next.js's static analysis detecting that the async `cookies()` 
  // function is called without `await` in a Server Component.
  const cookieStore = cookies();
  
  const token = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    return { user: null };
  }

  const userDetailsCookie = cookieStore.get(USER_DETAILS_COOKIE_NAME)?.value;
  if (!userDetailsCookie) {
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
