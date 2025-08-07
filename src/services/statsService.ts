
import { API_URL, API_KEY } from "@/lib/constants";

type DashboardStats = {
    totalChannels: number;
    totalRequests: number;
    totalFields: number;
}

export async function getDashboardOverview(userId: string, token: string): Promise<DashboardStats> {
  // Corrected to use the user-specific endpoint, as required by the backend router.
  const url = `${API_URL}/channels/user/${userId}/stats/overview`;
  console.log(`[API CALL] Fetching dashboard overview from: ${url}`);
  console.log(`[API CALL] Using token: Bearer ${token ? '...token exists' : '...no token'}`);
  
  const res = await fetch(url, {
    headers: {
      "x-api-key": API_KEY,
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });
  
  const data = await res.json();
  console.log(`[API RESPONSE] for dashboard stats overview:`, data);

  if (!res.ok) {
      console.error("Failed to fetch dashboard overview:", res.status, data.message);
      throw new Error(data.message || 'Failed to fetch dashboard overview');
  }
  
  return data;
}
