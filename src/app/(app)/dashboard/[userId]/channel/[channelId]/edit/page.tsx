'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getChannelById } from '@/services/channelService';
import { getSession }from '@/lib/actions';
import type { Channel } from '@/types';
import EditChannelClient from './_components/edit-channel-client';

function PageLoader() {
    return (
         <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="space-y-4">
                         <div className="space-y-4 rounded-lg border p-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                    </div>
                 </div>
                 <div className="flex justify-end pt-4">
                    <Skeleton className="h-10 w-32" />
                 </div>
            </CardContent>
         </Card>
    )
}

export default function EditChannelPage() {
    const [channel, setChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const channelId = params.channelId as string;
    const userId = params.userId as string;

    useEffect(() => {
        async function fetchChannel() {
            try {
                // We need the token to fetch the channel data
                const session = await getSession();
                if (!session?.token) {
                    setError("Authentication failed.");
                    setLoading(false);
                    return;
                }
                const fetchedChannel = await getChannelById(channelId, session.token);
                if (fetchedChannel) {
                    setChannel(fetchedChannel);
                    document.title = `Edit ${fetchedChannel.projectName} | RSensorGrid`;
                } else {
                    setError("Channel not found.");
                }
            } catch (err) {
                setError("Failed to fetch channel data.");
            } finally {
                setLoading(false);
            }
        }
        if (channelId) {
            fetchChannel();
        }
    }, [channelId]);


  return (
    <div className="flex-1 space-y-4 pt-6">
        <Link href={`/dashboard/${userId}/channel`} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Channels
        </Link>
        {loading ? (
           <PageLoader />
        ) : channel ? (
             <Card>
                <CardHeader>
                    <CardTitle>Edit {channel.projectName}</CardTitle>
                    <CardDescription>Update the details for your data channel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EditChannelClient channel={channel} />
                </CardContent>
             </Card>
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                    <CardDescription>
                        {error || "An unexpected error occurred while loading the channel."}
                    </CardDescription>
                </CardHeader>
            </Card>
        )}
    </div>
  );
}
