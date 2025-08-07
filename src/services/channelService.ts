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
