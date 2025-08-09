
'use server';

import { redirect } from 'next/navigation';
import { setSession, deleteSession, getSession } from '@/lib/auth';
import { createChannel as createChannelService, deleteChannel, updateChannel } from '@/services/channelService';
import type { LoginResponse, User } from '@/types';
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

export async function register(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!name || !email || !password || !confirmPassword) {
    return { error: 'All fields are required.' };
  }
  
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    const response = await fetch(`${process.env.API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf'
      },
      // The backend requires a unique username, so we pass the name as the username.
      body: JSON.stringify({ name, email, password, username: name, role: 'user' }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok || response.status !== 201) {
      // The backend may return a more specific error message in the 'message' field
      return { error: data.message || 'Registration failed. The email might already be in use.' };
    }

    if (data.token && data._id) {
        // Automatically log the user in upon successful registration
        await setSession(data.token, data);
        return { success: true, user: data };
    } else {
        return { error: 'Registration succeeded but no token was received.' };
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
            revalidatePath('/dashboard/' + session.user._id + '/channel');
            return { success: true };
        } else {
            return { error: response?.message || 'Failed to create channel.' };
        }
    } catch (error) {
        console.error('Create channel action error:', error);
        return { error: 'An unexpected server error occurred.' };
    }
}


export async function updateChannelAction(channelId: string, formData: {
    projectName: string;
    description: string;
    fields: { name: string; unit: string }[];
}) {
    const session = await getSession();
    if (!session?.token || !session?.user) {
        return { error: 'Authentication required.' };
    }

    try {
        const response = await updateChannel(channelId, formData, session.token);
        if (response.success) {
            revalidatePath(`/dashboard/${session.user._id}/channel`);
            revalidatePath(`/dashboard/${session.user._id}/channel/${channelId}`);
            revalidatePath(`/dashboard/${session.user._id}/channel/${channelId}/edit`);
            return { success: true, channel: response.channel };
        } else {
            return { error: response.message || 'Failed to update channel.' };
        }
    } catch (error) {
        console.error('Update channel action error:', error);
        return { error: 'An unexpected server error occurred.' };
    }
}

export async function deleteChannelAction(channelId: string) {
    const session = await getSession();
    if (!session?.token || !session?.user) {
        return { error: 'Authentication required.' };
    }

    try {
        const response = await deleteChannel(channelId, session.token);
        if (response.success) {
            revalidatePath(`/dashboard/${session.user._id}/channel`);
            return { success: true };
        } else {
            return { error: response.message || 'Failed to delete channel.' };
        }
    } catch (error) {
        console.error('Delete channel action error:', error);
        return { error: 'An unexpected server error occurred.' };
    }
}
