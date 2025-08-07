'use server';

import { API_URL } from '@/lib/constants';
import type { ChannelStats } from '@/types';

export async function getDashboardOverview(userId: string, token: string): Promise<ChannelStats | null> {
    if (!userId || !token) {
        console.error('getDashboardOverview: Missing userId or token');
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/channels/user/${userId}/stats/overview`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY || 'a0ea2188-ee2f-46d2-9661-310bed43c3bf',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store', // Always fetch the latest stats
        });

        if (!response.ok) {
            console.error(`Error fetching stats: ${response.status} ${response.statusText}`);
            const errorBody = await response.text();
            console.error("Error body:", errorBody);
            return null;
        }
        
        const data: ChannelStats = await response.json();
        return data;

    } catch (error) {
        console.error('getDashboardOverview: An unexpected error occurred:', error);
        return null;
    }
}
