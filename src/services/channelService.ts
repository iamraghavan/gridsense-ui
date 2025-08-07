
import { API_URL, API_KEY } from "@/lib/constants";
import type { Channel, ChannelDataPoint } from "@/types";

type ChannelsResponse = {
    count: number;
    channels: Channel[];
}

type CombinedChannel = Channel & { history: ChannelDataPoint[] };

export async function getChannels(userId: string, token: string): Promise<ChannelsResponse> {
  const url = `${API_URL}/channels/user/${userId}`;
  console.log(`Fetching channels for user: ${userId} from ${url}`);
  const res = await fetch(url, {
    headers: {
      "x-api-key": API_KEY,
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });
  
  const data = await res.json();
  console.log(`Response for user ${userId} channels:`, data);

  if (!res.ok) {
      console.error("Failed to fetch channels:", res.status, data.message);
      throw new Error(data.message || 'Failed to fetch channels');
  }
  
  return data;
}

export async function getChannelDetails(channelId: string, token: string): Promise<CombinedChannel> {
  const url = `${API_URL}/channels/${channelId}`;
  console.log(`Fetching details for channel: ${channelId} from ${url}`);
  const res = await fetch(url, {
    headers: {
      "x-api-key": API_KEY,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
   const data = await res.json();
   console.log(`Response for channel ${channelId}:`, data);
  if (!res.ok) {
      console.error("Failed to fetch channel details:", res.status, data.message);
      throw new Error(data.message || 'Failed to fetch channel details');
  }
  return data;
}

export async function createChannel(channelData: {
    projectName: string;
    description: string;
    fields: { name: string; unit: string }[];
  }, token: string): Promise<any> {
  const url = `${API_URL}/channels`;
  console.log('Creating new channel with data:', channelData, `at ${url}`);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(channelData),
  });
  
  const data = await res.json();
  console.log('Create channel response:', data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to create channel.");
  }
  return data;
}

export async function deleteChannel(channelId: string, token: string): Promise<any> {
    const url = `${API_URL}/channels/${channelId}`;
    console.log(`Deleting channel: ${channelId} at ${url}`);
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            "x-api-key": API_KEY,
            "Authorization": `Bearer ${token}`
        }
    });

    if(!res.ok) {
        const errorData = await res.json();
        console.error('Delete channel error:', errorData);
        throw new Error(errorData.message || "Failed to delete channel.");
    }
    
    // DELETE requests might not have a body, so we check for status 204 (No Content)
    if (res.status === 204) {
        return { success: true };
    }
    
    const data = await res.json();
    console.log('Delete channel response:', data);
    return data;
}
