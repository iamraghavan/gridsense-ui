
import { API_URL, API_KEY } from "@/lib/constants";

type DashboardStats = {
    totalChannels: number;
    totalRequests: number;
    totalFields: number;
}

export async function getDashboardOverview(userId: string, token: string): Promise<DashboardStats> {
  try {
    const res = await fetch(`${API_URL}/channels/user/${userId}/stats/overview`, {
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
        return { totalChannels: 0, totalRequests: 0, totalFields: 0 };
    }
    
    // The API returns totalFields, so we can use that directly
    if (data && typeof data.totalChannels === 'number' && typeof data.totalRequests === 'number' && typeof data.totalFields === 'number') {
        return data;
    }

    console.error("Unexpected API response structure for dashboard overview:", data);
    return { totalChannels: 0, totalRequests: 0, totalFields: 0 };
  } catch (error) {
    console.error("Failed to fetch dashboard overview", error);
    return { totalChannels: 0, totalRequests: 0, totalFields: 0 };
  }
}
