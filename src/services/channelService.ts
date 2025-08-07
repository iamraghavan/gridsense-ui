
import { API_URL, API_KEY } from "@/lib/constants";
import type { Channel, ChannelDataPoint } from "@/types";

type ChannelsResponse = {
    count: number;
    channels: Channel[];
}

type CombinedChannel = Channel & { history: ChannelDataPoint[] };

export async function getChannels(userId: string, token: string): Promise<ChannelsResponse> {
  try {
    const res = await fetch(`${API_URL}/channels/user/${userId}`, {
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
        return { count: 0, channels: [] };
    }
    
    if (data && typeof data.count === 'number' && Array.isArray(data.channels)) {
        return data;
    }

    console.error("Unexpected API response structure for channels:", data);
    return { count: 0, channels: [] };
  } catch (error) {
    console.error("Failed to fetch channels", error);
    return { count: 0, channels: [] };
  }
}

export async function getChannelDetails(channelId: string, token: string): Promise<CombinedChannel | null> {
  try {
    const res = await fetch(`${API_URL}/channels/${channelId}`, {
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
        return null;
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch channel details", error);
    return null;
  }
}

export async function createChannel(channelData: {
    projectName: string;
    description: string;
    fields: { name: string; unit: string }[];
  }, token: string): Promise<any> {
  const res = await fetch(`${API_URL}/channels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(channelData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create channel.");
  }
  return res.json();
}

export async function deleteChannel(channelId: string, token: string): Promise<any> {
    const res = await fetch(`${API_URL}/channels/${channelId}`, {
        method: 'DELETE',
        headers: {
            "x-api-key": API_KEY,
            "Authorization": `Bearer ${token}`
        }
    });
    if(!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete channel.");
    }
    return res.json();
}
