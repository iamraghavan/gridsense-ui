
import { API_URL, API_KEY } from "@/lib/constants";

type DashboardStats = {
    totalChannels: number;
    totalRequests: number;
    totalFields: number;
}

// This function now correctly calls the /api/channels/stats/overview endpoint
// for the logged-in user. The backend identifies the user via the token.
export async function getDashboardOverview(token: string): Promise<DashboardStats> {
  const url = `${API_URL}/channels/stats/overview`;
  console.log(`Fetching dashboard overview from ${url} with token.`);
  const res = await fetch(url, {
    headers: {
      "x-api-key": API_KEY,
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });
  
  const data = await res.json();
  console.log(`Response for dashboard stats overview:`, data);

  if (!res.ok) {
      console.error("Failed to fetch dashboard overview:", res.status, data.message);
      throw new Error(data.message || 'Failed to fetch dashboard overview');
  }
  
  return data;
}
