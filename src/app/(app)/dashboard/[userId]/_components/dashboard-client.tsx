'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Channel, ChannelStats, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import { useSocket } from '@/hooks/use-socket';

function StatCard({ title, value, isLoading }: { title: string; value: string | number; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ChannelLastUpdate({ lastUpdate }: { lastUpdate?: string }) {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        if (lastUpdate) {
            setFormattedDate(format(new Date(lastUpdate), 'PPpp'));
        }
    }, [lastUpdate]);

    if (!lastUpdate) {
        return <>N/A</>;
    }
    
    if (!formattedDate) {
        return <Skeleton className="h-5 w-40" />;
    }

    return <>{formattedDate}</>;
}

interface DashboardClientProps {
  user: User;
  initialStats: ChannelStats | null;
  initialChannels: Channel[];
}

export function DashboardClient({ user, initialStats, initialChannels }: DashboardClientProps) {
  const [stats, setStats] = useState<ChannelStats | null>(initialStats);
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [isLoading, setIsLoading] = useState(!initialStats && !initialChannels);
  
  const { socket } = useSocket(user?._id);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('latestData', (data: { channelId: string; latestData: Record<string, number>, lastUpdate: string }) => {
        setChannels(prevChannels =>
            prevChannels.map(channel =>
                channel.channel_id === data.channelId
                    ? { ...channel, latestData: data.latestData, lastUpdate: data.lastUpdate }
                    : channel
            )
        );
    });
     
    socket.on('statsUpdate', (newStats: ChannelStats) => {
        setStats(newStats);
    });

    return () => {
        socket.off('latestData');
        socket.off('statsUpdate');
    };
  }, [socket]);
  
  return (
    <div className="flex-1 space-y-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                 <h1 className="text-2xl font-bold font-headline">Welcome, {user?.name ?? '...'}!</h1>
                <p className="text-muted-foreground">
                    An overview of your channels and their latest activity.
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <Button asChild>
                    <Link href={`/dashboard/${user._id}/channel`}>Manage Channels</Link>
                </Button>
            </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Channels" value={stats?.totalChannels ?? 0} isLoading={isLoading} />
            <StatCard title="Total Requests" value={stats?.totalRequests ?? 0} isLoading={isLoading} />
            <StatCard title="Active Fields" value={stats?.totalFields ?? 0} isLoading={isLoading} />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Recent Channels</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Your 5 most recently created channels.
                </p>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project Name</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            <TableHead className="hidden md:table-cell">Last Update</TableHead>
                            <TableHead>Latest Data</TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                                </TableRow>
                            ))
                        ) : channels.length > 0 ? (
                            channels.slice(0, 5).map((channel) => (
                                <TableRow key={channel._id}>
                                    <TableCell className="font-medium">{channel.projectName}</TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">{channel.description}</TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                       <ChannelLastUpdate lastUpdate={channel.lastUpdate} />
                                    </TableCell>
                                    <TableCell>
                                        {channel.latestData ? `${Object.keys(channel.latestData)[0]}: ${Object.values(channel.latestData)[0]}` : 'N/A'}
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/${channel.userId}/channel/${channel.channel_id}`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No channels found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
