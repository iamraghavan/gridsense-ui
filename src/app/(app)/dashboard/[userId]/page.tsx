
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, MoreHorizontal, Rss, Activity, BarChart } from "lucide-react";
import type { Channel, User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getChannels } from "@/services/channelService";
import { getDashboardOverview } from "@/services/statsService";

interface DashboardPageProps {
  user: User;
  token: string;
}

type Stats = {
    totalChannels: number;
    totalRequests: number;
    totalFields: number;
}

function StatCard({ title, value, description, icon: Icon, isLoading }: { title: string, value: string | number, description: string, icon: React.ElementType, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <>
                        <Skeleton className="h-8 w-1/4 mt-1" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function DashboardPage({ user, token }: DashboardPageProps) {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        if (!user?.id || !token) {
            console.log(`DashboardPage: Cannot fetch data, user or token is missing. {userId: ${user?.id}, tokenExists: ${!!token}}`);
            setIsDataLoading(false);
            return;
        }
        
        console.log(`DashboardPage: Starting to fetch data for user ${user.id}`);
        setIsDataLoading(true);
        try {
            const [statsResponse, channelsResponse] = await Promise.all([
                getDashboardOverview(user.id, token),
                getChannels(user.id, token)
            ]);
            
            console.log("DashboardPage: Successfully fetched data.", { statsResponse, channelsResponse });
            setStats(statsResponse);
            setChannels(channelsResponse.channels);

        } catch (error) {
            console.error("DashboardPage: Failed to fetch dashboard data", error);
        } finally {
            console.log("DashboardPage: Finished fetching data.");
            setIsDataLoading(false);
        }
    }, [user?.id, token]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const recentChannels = channels.slice(0, 5);
    
    return (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Welcome, {user?.name || '...'}!</h1>
                    <p className="text-muted-foreground">
                        An overview of your channels and their latest activity.
                    </p>
                </div>
                <div>
                    <Button asChild disabled={!user?.id}>
                        <Link href={user?.id ? `/dashboard/${user.id}/channel` : '#'}>Manage Channels <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    title="Total Channels" 
                    value={stats?.totalChannels ?? 0} 
                    description={`You have ${stats?.totalChannels ?? 0} active channels.`} 
                    icon={Rss} 
                    isLoading={isDataLoading} 
                />
                <StatCard 
                    title="Total Requests" 
                    value={stats?.totalRequests?.toLocaleString() ?? 0} 
                    description="Total data points from all channels." 
                    icon={Activity} 
                    isLoading={isDataLoading} 
                />
                 <StatCard 
                    title="Active Fields" 
                    value={stats?.totalFields ?? 0} 
                    description="Total sensor fields being monitored." 
                    icon={BarChart} 
                    isLoading={isDataLoading} 
                />
            </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Channels</CardTitle>
              <CardDescription>
                Your 5 most recently created channels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Update</TableHead>
                    <TableHead className="hidden lg:table-cell">Latest Data</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDataLoading ? (
                     [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                     ))
                  ) : recentChannels.length > 0 ? (
                    recentChannels.map((channel) => (
                      <TableRow key={channel.channel_id}>
                        <TableCell className="font-medium">{channel.projectName}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-xs">{channel.description}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {channel.lastUpdate ? new Date(channel.lastUpdate).toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {channel.latestData ? (
                                Object.entries(channel.latestData).map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="font-code">{`${key}: ${value}`}</Badge>

                                ))
                            ) : (
                                <span className="text-muted-foreground text-xs">No data yet</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                               <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/${user.id}/channel/${channel.channel_id}`}>View Details & Chart</Link>
                               </DropdownMenuItem>
                              <DropdownMenuItem disabled>Edit (soon)</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No channels found.
                        <Button variant="link" asChild><Link href={user?.id ? `/dashboard/${user.id}/channel` : '#'}>Create your first one!</Link></Button>
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
