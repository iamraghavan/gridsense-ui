'use server';

import { redirect } from 'next/navigation';
import { setSession, deleteSession } from '@/lib/auth';
import { API_URL } from '@/lib/constants';
import type { LoginResponse } from '@/types';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf'
      },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Login failed' };
    }

    if (data.token && data._id) {
        await setSession(data.token, data);
        return { success: true, user: data };
    } else {
        return { error: 'Login failed: No token or user ID received.' };
    }

  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}
