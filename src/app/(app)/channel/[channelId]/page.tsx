'use server';

import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getChannelById } from '@/services/channelService';
import { notFound } from 'next/navigation';
import { ChannelDetailClient } from './_components/channel-detail-client';

export default async function ChannelDetailPage({ params }: { params: { channelId: string } }) {
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
