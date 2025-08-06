
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { API_URL, API_KEY, AUTH_TOKEN_COOKIE_NAME, USER_DETAILS_COOKIE_NAME } from './constants';
import type { User } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export type AuthState = {
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    _form?: string[];
  };
};

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to Login.',
    };
  }
  
  const { email, password } = validatedFields.data;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { message: data.message || 'Login failed. Please check your credentials.' };
    }
    
    if (data.token) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      };
      
      const user: User = { id: data._id, name: data.name, email: data.email };
      
      cookies().set(AUTH_TOKEN_COOKIE_NAME, data.token, cookieOptions);
      cookies().set(USER_DETAILS_COOKIE_NAME, JSON.stringify(user), cookieOptions);

    } else {
       return { message: 'Login failed: No token received.' };
    }

  } catch (error) {
    return { message: 'An unexpected error occurred.' };
  }

  redirect('/dashboard');
}

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to Register.',
    };
  }

  const { name, email, password } = validatedFields.data;
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();

    if (!response.ok) {
      return { message: data.message || 'Registration failed.' };
    }
    
    if (data.token && data.user) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      };

      // Handle the case where the user object might be nested
      const userData = data.user.user ? data.user.user : data.user;
      const user: User = { id: userData._id, name: userData.name, email: userData.email };

      cookies().set(AUTH_TOKEN_COOKIE_NAME, data.token, cookieOptions);
      cookies().set(USER_DETAILS_COOKIE_NAME, JSON.stringify(user), cookieOptions);

    } else {
        return { message: 'Registration failed: No token or user data received.' };
    }

  } catch (error) {
    return { message: 'An unexpected error occurred during registration.' };
  }
  
  redirect('/dashboard');
}

export async function logout() {
  cookies().delete(AUTH_TOKEN_COOKIE_NAME);
  cookies().delete(USER_DETAILS_COOKIE_NAME);
  redirect('/login');
}
