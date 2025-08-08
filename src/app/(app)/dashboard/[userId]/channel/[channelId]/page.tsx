
'use server';

import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getChannelPageData } from '@/services/channelService';
import { notFound } from 'next/navigation';
import { ChannelDetailClient } from './_components/channel-detail-client';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { userId: string, channelId: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const session = await getSession();
  if (!session?.token) {
    return {
        title: 'Channel Not Found'
    }
  }
  const data = await getChannelPageData(params.channelId, session.token);
 
  return {
    title: data?.channel ? `${data.channel.projectName}` : 'Channel Details',
    description: `View real-time sensor data and history for ${data?.channel?.projectName || 'your channel'}.`,
  }
}

export default async function ChannelDetailPage({ params }: Props) {
    const session = await getSession();
    if (!session?.user || !session?.token) {
        redirect('/login');
        return null;
    }

    const data = await getChannelPageData(params.channelId, session.token);

    if (!data?.channel) {
        notFound();
        return null;
    }

    const { channel, history, stats, latestData } = data;

    return (
        <ChannelDetailClient 
            channel={channel} 
            initialHistory={history}
            initialStats={stats}
            initialLatestData={latestData}
        />
    );
}
