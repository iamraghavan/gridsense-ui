
import { API_URL, API_KEY } from "@/lib/constants";

type DashboardStats = {
    totalChannels: number;
    totalRequests: number;
    totalFields: number;
}

export async function getDashboardOverview(userId: string, token: string): Promise<DashboardStats> {
  const url = `${API_URL}/channels/user/${userId}/stats/overview`;
  console.log(`Fetching dashboard overview for user: ${userId} from ${url}`);
  const res = await fetch(url, {
    headers: {
      "x-api-key": API_KEY,
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });
  
  const data = await res.json();
  console.log(`Response for user ${userId} stats overview:`, data);

  if (!res.ok) {
      console.error("Failed to fetch dashboard overview:", res.status, data.message);
      throw new Error(data.message || 'Failed to fetch dashboard overview');
  }
  
  return data;
}
