
import { cookies } from 'next/headers';
import { API_URL, API_KEY, AUTH_TOKEN_COOKIE_NAME } from './constants';
import type { User } from '@/types';

export async function getUser(): Promise<{ user: User | null }> {
  const token = cookies().get(AUTH_TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    return { user: null };
  }

  try {
    const res = await fetch(`${API_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': API_KEY,
      },
      next: { tags: ['user'] },
    });

    if (!res.ok) {
      console.error('Failed to fetch user:', res.statusText);
      return { user: null };
    }

    const data = await res.json();
    return { user: data.user };
  } catch (error) {
    console.error('An error occurred while fetching the user:', error);
    return { user: null };
  }
}
