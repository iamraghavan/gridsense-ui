'use server';

import React from 'react';
import { getChannels } from '@/services/channelService';
import { getDashboardOverview } from '@/services/statsService';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardClient } from './_components/dashboard-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dashboard',
    description: 'Your personal dashboard for managing and monitoring all your IoT channels and sensor data.',
  };
}

// This is the main page component. It's a Server Component.
// It fetches all necessary data on the server and then passes it
// to the DashboardClient component, which handles the interactive parts.
export default async function DashboardPage({ params }: { params: { userId: string } }) {
  const session = await getSession();

  if (!session?.user || !session?.token) {
    return redirect('/login');
  }

  // We can fetch data in parallel on the server.
  const [statsData, channelsResponse] = await Promise.all([
    getDashboardOverview(params.userId, session.token),
    getChannels(params.userId, session.token)
  ]);
  
  return (
    <DashboardClient 
      user={session.user}
      initialStats={statsData}
      initialChannels={channelsResponse?.channels ?? []}
    />
  );
}
