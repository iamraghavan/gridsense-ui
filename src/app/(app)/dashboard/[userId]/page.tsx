'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getChannels } from '@/services/channelService';
import { getDashboardOverview } from '@/services/statsService';
import type { Channel, ChannelStats, User } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

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

export default function DashboardPage({ params }: { params: { userId: string } }) {
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Note: The parent layout will be responsible for fetching the user and token
  // and passing them down as props. For now, we'll mock them.
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!params.userId || !token) {
        console.error("DashboardPage: Cannot fetch data, user ID or token is missing.");
        if (!token) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'Could not find auth token. Please log in again.',
            });
        }
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    try {
        const [statsData, channelsResponse] = await Promise.all([
            getDashboardOverview(params.userId, token),
            getChannels(params.userId, token)
        ]);

        if (statsData) {
            setStats(statsData);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error fetching stats',
                description: 'Could not load dashboard statistics.',
            });
        }
        
        if (channelsResponse && channelsResponse.channels) {
            setChannels(channelsResponse.channels);
        } else {
             toast({
                variant: 'destructive',
                title: 'Error fetching channels',
                description: 'Could not load channel list.',
            });
        }

    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
            variant: 'destructive',
            title: 'Network Error',
            description: 'Failed to fetch dashboard data. Please check your connection.',
        });
    } finally {
        setIsLoading(false);
    }
  }, [params.userId, token, toast]);

  useEffect(() => {
    // In a real app, user and token would come from a context or parent component.
    // We will simulate this when we build the main AppLayout.
    // For now, this will trigger fetching when the component mounts if userId is present.
    // We will need to get the user and token from the session in the layout.
    // This is a placeholder for the real implementation.
    const sessionStr = document.cookie.split('; ').find(row => row.startsWith('session='));
    if (sessionStr) {
        const sessionData = JSON.parse(decodeURIComponent(atob(sessionStr.split('.')[1])));
        setUser(sessionData.user);
        setToken(sessionData.token);
    }
  }, []);

  useEffect(() => {
      if (params.userId && token) {
        fetchDashboardData();
      }
  }, [params.userId, token, fetchDashboardData]);
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                 <h1 className="text-2xl font-bold font-headline">Welcome, {user?.name || '...'}!</h1>
                <p className="text-muted-foreground">
                    An overview of your channels and their latest activity.
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <Button>Manage Channels</Button>
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
                                        {channel.lastUpdate ? format(new Date(channel.lastUpdate), 'PP pp') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {channel.latestData ? `${Object.values(channel.latestData)[0]}` : 'N/A'}
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <Button variant="outline" size="sm">View</Button>
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
