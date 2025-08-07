'use server';
import { API_URL } from '@/lib/constants';
import type { Channel } from '@/types';

interface ChannelsResponse {
  count: number;
  channels: Channel[];
}

export async function getChannels(userId: string, token: string): Promise<ChannelsResponse | null> {
  if (!userId || !token) {
    console.error('getChannels: Missing userId or token');
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/channels/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf',
        'Authorization': `Bearer ${token}`,
      },
       cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Error fetching channels: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error("Error body:", errorBody);
      return null;
    }

    const data: ChannelsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('getChannels: An unexpected error occurred:', error);
    return null;
  }
}

export async function createChannel(
  channelData: {
    projectName: string;
    channel_id: string;
    description: string;
    fields: { name: string; unit: string }[];
  },
  token: string
) {
  try {
    const response = await fetch(`${API_URL}/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(channelData),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || 'An error occurred' };
    }
    
    return { success: true, channel: result };
  } catch (error) {
    console.error('createChannel service error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
