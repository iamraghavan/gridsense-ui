
import { API_URL, API_KEY } from "@/lib/constants";
import type { Channel, ChannelDataPoint } from "@/types";
import { getAuthToken } from "./authService";

type ChannelsResponse = {
    count: number;
    channels: Channel[];
}

type CombinedChannel = Channel & { history: ChannelDataPoint[] };

// Fetches the token from the BFF before making the actual API call.
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const { token } = await getAuthToken();
    if (!token) {
        throw new Error("Authentication token not found.");
    }
    
    const headers = {
        ...options.headers,
        "x-api-key": API_KEY,
        "Authorization": `Bearer ${token}`,
    };
    
    console.log(`[API CALL] Making authenticated request to: ${url} with token: Bearer ${token ? '...token exists' : '...no token'}`);
    
    return fetch(url, { ...options, headers, cache: "no-store" });
}

export async function getChannels(userId: string): Promise<ChannelsResponse> {
  const url = `${API_URL}/channels/user/${userId}`;
  const res = await fetchWithAuth(url);
  const data = await res.json();
  console.log(`[API RESPONSE] for user channels:`, data);

  if (!res.ok) {
      console.error("Failed to fetch channels:", res.status, data.message);
      throw new Error(data.message || 'Failed to fetch channels');
  }
  
  return data;
}

export async function getChannelDetails(channelId: string): Promise<CombinedChannel> {
  const url = `${API_URL}/channels/${channelId}`;
  const res = await fetchWithAuth(url);
  const data = await res.json();
  console.log(`[API RESPONSE] for channel ${channelId}:`, data);

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
  }): Promise<any> {
  const url = `${API_URL}/channels`;
  console.log(`[API CALL] Creating new channel at: ${url} with data:`, channelData);
  
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(channelData),
  });
  
  const data = await res.json();
  console.log('[API RESPONSE] Create channel response:', data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to create channel.");
  }
  return data;
}

export async function deleteChannel(channelId: string): Promise<any> {
    const url = `${API_URL}/channels/${channelId}`;
    console.log(`[API CALL] Deleting channel: ${channelId} at: ${url}`);
    
    const res = await fetchWithAuth(url, { method: 'DELETE' });

    if(!res.ok) {
        try {
            const errorData = await res.json();
            console.error('[API RESPONSE ERROR] Delete channel error:', errorData);
            throw new Error(errorData.message || "Failed to delete channel.");
        } catch (e) {
            throw new Error(res.statusText || "Failed to delete channel.");
        }
    }
    
    if (res.status === 204) {
        console.log(`[API RESPONSE] Channel ${channelId} deleted successfully (Status 204).`);
        return { success: true };
    }
    
    try {
        const data = await res.json();
        console.log('[API RESPONSE] Delete channel response:', data);
        return data;
    } catch(e) {
        return { success: true };
    }
}
