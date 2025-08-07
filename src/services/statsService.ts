
import { API_URL, API_KEY } from "@/lib/constants";

type DashboardStats = {
    totalChannels: number;
    totalRequests: number;
    totalFields: number;
}

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
        ...options.headers,
        "x-api-key": API_KEY,
        "Authorization": `Bearer ${token}`,
    };
    
    console.log(`[API CALL] Making authenticated request to: ${url}`);

    return fetch(url, { ...options, headers, cache: "no-store" });
}


export async function getDashboardOverview(userId: string, token: string): Promise<DashboardStats> {
  const url = `${API_URL}/channels/user/${userId}/stats/overview`;
  const res = await fetchWithAuth(url, token);
  const data = await res.json();
  console.log(`[API RESPONSE] for dashboard stats overview:`, data);

  if (!res.ok) {
      console.error("Failed to fetch dashboard overview:", res.status, data.message);
      throw new Error(data.message || 'Failed to fetch dashboard overview');
  }
  
  return data;
}
