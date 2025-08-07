
import type { User } from '@/types';

const USER_CACHE_KEY = 'rsg_user_cache';

/**
 * Saves the user object to localStorage.
 * This should be called after a successful login or session refresh.
 */
export function saveUserToCache(user: User): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save user to cache", e);
    }
  }
}

/**
 * Retrieves the user object from localStorage.
 * This is used to quickly re-establish the session on page load.
 */
export function getUserFromCache(): User | null {
  if (typeof window !== 'undefined') {
    try {
      const cachedUser = window.localStorage.getItem(USER_CACHE_KEY);
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch (e) {
      console.error("Failed to get user from cache", e);
      return null;
    }
  }
  return null;
}

/**
 * Clears the user object from localStorage.
 * This should be called on logout.
 */
export function clearUserFromCache(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(USER_CACHE_KEY);
    } catch (e) {
      console.error("Failed to clear user from cache", e);
    }
  }
}
