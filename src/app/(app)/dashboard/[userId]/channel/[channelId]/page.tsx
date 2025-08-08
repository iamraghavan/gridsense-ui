'use server';

import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getChannelById } from '@/services/channelService';
import { notFound } from 'next/navigation';
import { ChannelDetailClient } from '@/app/(app)/channel/[channelId]/_components/channel-detail-client';
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
  const channel = await getChannelById(params.channelId, session.token);
 
  return {
    title: channel ? `${channel.projectName}` : 'Channel Details',
    description: `View real-time sensor data and history for ${channel?.projectName || 'your channel'}.`,
  }
}

export default async function ChannelDetailPage({ params }: Props) {
    const session = await getSession();
    if (!session?.user || !session?.token) {
        redirect('/login');
        return null;
    }

    const channel = await getChannelById(params.channelId, session.token);

    if (!channel) {
        notFound();
        return null;
    }

    return <ChannelDetailClient channel={channel} />;
}
