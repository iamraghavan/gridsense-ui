
import { cookies } from 'next/headers';
import { AUTH_TOKEN_COOKIE_NAME, USER_DETAILS_COOKIE_NAME } from './constants';
import type { User } from '@/types';

export async function getUser(): Promise<{ user: User | null }> {
  const token = cookies().get(AUTH_TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    return { user: null };
  }

  const userDetailsCookie = cookies().get(USER_DETAILS_COOKIE_NAME)?.value;
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
