'use server';

import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getChannels } from '@/services/channelService';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChannelCard } from './_components/channel-card';
import { PlusCircle } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Channel Management',
    description: 'Create, view, and manage all of your IoT data channels. Get API keys and integration details for each channel.',
  };
}

export default async function ChannelsPage({ params }: { params: { userId: string } }) {
  const session = await getSession();
  if (!session?.user || !session?.token) {
    return redirect('/login');
  }

  const channelsResponse = await getChannels(session.user._id, session.token);
  const channels = channelsResponse?.channels ?? [];
  const apiKey = session.user.apiKey;

  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-2xl font-bold font-headline">Channel Management</h1>
          <p className="text-muted-foreground">
            View, create, and manage all of your data channels.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/channel/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Channel
            </Link>
          </Button>
        </div>
      </div>

      {channels.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {channels.map((channel) => (
            <ChannelCard key={channel._id} channel={channel} apiKey={apiKey} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm h-[450px]">
          <h3 className="text-2xl font-bold tracking-tight">
            You have no channels yet.
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by creating your first data channel.
          </p>
          <Button asChild>
            <Link href="/channel/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Channel
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
