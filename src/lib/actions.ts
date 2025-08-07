
'use server';

import { redirect } from 'next/navigation';
import { setSession, deleteSession, getSession } from '@/lib/auth';
import { createChannel as createChannelService } from '@/services/channelService';
import type { LoginResponse } from '@/types';
import { revalidatePath } from 'next/cache';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
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

export async function createChannel(formData: {
    projectName: string;
    description: string;
    fields: { name: string; unit: string }[];
}) {
    const session = await getSession();
    if (!session?.token) {
        return { error: 'You must be logged in to create a channel.' };
    }

    try {
        const response = await createChannelService(formData, session.token);

        if (response?.success) {
            revalidatePath('/channel');
            return { success: true };
        } else {
            return { error: response?.message || 'Failed to create channel.' };
        }
    } catch (error) {
        console.error('Create channel action error:', error);
        return { error: 'An unexpected server error occurred.' };
    }
}
