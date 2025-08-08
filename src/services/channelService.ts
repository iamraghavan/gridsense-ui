
'use server';
import { API_URL } from '@/lib/constants';
import type { Channel, ChannelHistory, ChannelStats } from '@/types';

interface ChannelsResponse {
  count: number;
  channels: Channel[];
}

// Lightweight version to get all channels without full history for faster page loads
export async function getChannels(userId: string, token: string): Promise<ChannelsResponse | null> {
  if (!userId || !token) {
    console.error('getChannels: Missing userId or token');
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/channels/user/${userId}?meta=true`, {
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

// Fetches basic channel details
async function getChannelById(channelId: string, token: string): Promise<Channel | null> {
  const res = await fetch(`${API_URL}/channels/${channelId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf' },
    cache: 'no-store',
  });
  return res.ok ? res.json() : null;
}

// Fetches channel history for the chart
async function getChannelHistory(channelId: string, token: string): Promise<ChannelHistory[]> {
  const res = await fetch(`${API_URL}/sensors/${channelId}/history?limit=100`, {
    headers: { 'Authorization': `Bearer ${token}`, 'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf' },
    cache: 'no-store',
  });
  return res.ok ? res.json() : [];
}

// Fetches the latest data entry
async function getLatestChannelData(channelId: string, token: string): Promise<ChannelHistory | null> {
  const res = await fetch(`${API_URL}/sensors/${channelId}/latest`, {
    headers: { 'Authorization': `Bearer ${token}`, 'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf' },
    cache: 'no-store',
  });
  return res.ok ? res.json() : null;
}

// Fetches stats like total entries and last update time
async function getChannelStats(channelId: string, token: string): Promise<ChannelStats | null> {
    const res = await fetch(`${API_URL}/channels/${channelId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf' },
        cache: 'no-store',
    });
    return res.ok ? res.json() : null;
}

// New function to fetch all data for the detail page in parallel
export async function getChannelPageData(channelId: string, token: string) {
    if (!channelId || !token) {
        console.error('getChannelPageData: Missing channelId or token');
        return null;
    }
    
    try {
        const [channel, history, latestData, stats] = await Promise.all([
            getChannelById(channelId, token),
            getChannelHistory(channelId, token),
            getLatestChannelData(channelId, token),
            getChannelStats(channelId, token),
        ]);

        return { channel, history, latestData, stats };

    } catch (error) {
        console.error('getChannelPageData: An unexpected error occurred:', error);
        return null;
    }
}


export async function updateChannel(
  channelId: string,
  channelData: {
    projectName: string;
    description: string;
    fields: { name: string; unit: string }[];
  },
  token: string
) {
    try {
        const response = await fetch(`${API_URL}/channels/${channelId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(channelData),
        });

        const result = await response.json();
        if (!response.ok) {
            return { success: false, message: result.message || 'An error occurred during update' };
        }
        return { success: true, channel: result };
    } catch (error) {
        console.error('updateChannel service error:', error);
        return { success: false, message: 'An unexpected server error occurred.' };
    }
}

export async function deleteChannel(channelId: string, token: string) {
    try {
        const response = await fetch(`${API_URL}/channels/${channelId}`, {
            method: 'DELETE',
            headers: {
                'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 204 || response.ok) {
            return { success: true };
        } else {
             const result = await response.json().catch(() => ({}));
            return { success: false, message: result.message || 'Failed to delete channel' };
        }
    } catch (error) {
        console.error('deleteChannel service error:', error);
        return { success: false, message: 'An unexpected server error occurred.' };
    }
}
