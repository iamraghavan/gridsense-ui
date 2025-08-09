'use server';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getChannelById } from '@/services/channelService';
import { getSession } from '@/lib/auth';
import EditChannelClient from './_components/edit-channel-client';
import { notFound, redirect } from 'next/navigation';

export default async function EditChannelPage({ params }: { params: { userId: string, channelId: string } }) {
    const session = await getSession();
    if (!session?.token) {
        redirect('/login');
    }

    const channel = await getChannelById(params.channelId, session.token);

    if (!channel) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-4 pt-6">
            <Link href={`/dashboard/${params.userId}/channel`} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Channels
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Edit {channel.projectName}</CardTitle>
                    <CardDescription>Update the details for your data channel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EditChannelClient channel={channel} />
                </CardContent>
            </Card>
        </div>
    );
}
