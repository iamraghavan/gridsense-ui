
import { API_URL, API_KEY } from "@/lib/constants";
import { getAuthToken } from "./authService";

type DashboardStats = {
    totalChannels: number;
    totalRequests: number;
    totalFields: number;
}

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


export async function getDashboardOverview(userId: string): Promise<DashboardStats> {
  const url = `${API_URL}/channels/user/${userId}/stats/overview`;
  const res = await fetchWithAuth(url);
  const data = await res.json();
  console.log(`[API RESPONSE] for dashboard stats overview:`, data);

  if (!res.ok) {
      console.error("Failed to fetch dashboard overview:", res.status, data.message);
      throw new Error(data.message || 'Failed to fetch dashboard overview');
  }
  
  return data;
}
