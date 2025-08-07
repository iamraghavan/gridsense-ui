
'use client'

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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Rss, Activity, Calendar, Tag } from "lucide-react";
import type { Channel, ChannelDataPoint, User } from "@/types";
import { API_URL, API_KEY } from "@/lib/constants";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type CombinedChannel = Channel & { history: ChannelDataPoint[] };

async function getChannelDetails(channelId: string, token: string): Promise<CombinedChannel | null> {
  try {
    const res = await fetch(`${API_URL}/channels/${channelId}`, {
      headers: {
        "x-api-key": API_KEY,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
     console.log(`Response for channel ${channelId}:`, await res.clone().json()); // Log the response
    if (!res.ok) {
        console.error("Failed to fetch channel details:", res.status, await res.text());
        return null;
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch channel details", error);
    return null;
  }
}

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

// This component now receives the token as a prop from AppLayout
export default function ChannelDetailsPage({ params, token: initialToken }: { params: { channelId: string }, token?: string }) {
    const [channel, setChannel] = useState<CombinedChannel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // The token is passed as a prop, making it available immediately.
    const token = initialToken;

    const fetchChannelData = useCallback(async (authToken: string) => {
        setIsLoading(true);
        try {
            const channelData = await getChannelDetails(params.channelId, authToken);
            setChannel(channelData);
        } catch (error) {
            console.error("Failed to fetch channel data", error);
        } finally {
            setIsLoading(false);
        }
    }, [params.channelId]);

    useEffect(() => {
        if (token) {
            fetchChannelData(token);
        } else {
            // If there's no token, it might mean the layout is still loading.
            // Or the user is unauthenticated, in which case middleware should have redirected.
            // We set loading to false to avoid an infinite spinner if something goes wrong.
            setIsLoading(false);
        }
    }, [token, fetchChannelData]);

    const chartConfig = useMemo(() => {
        const config: ChartConfig = {};
        if (channel?.fields) {
            channel.fields.forEach((field, index) => {
                config[field.name] = {
                    label: `${field.name} (${field.unit || 'N/A'})`,
                    color: `hsl(var(--chart-${(index % 5) + 1}))`,
                };
            });
        }
        return config;
    }, [channel?.fields]);
    
    const chartData = useMemo(() => {
        if (!channel?.history) return [];
        // The API returns history sorted descending, so we reverse it for charting
        return channel.history.map(item => ({
            ...item.data,
            date: new Date(item.createdAt).toLocaleTimeString(),
        })).reverse();
    }, [channel?.history]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
                <Skeleton className="h-96" />
                <Skeleton className="h-64" />
            </div>
        )
    }

    if (!channel) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Channel Not Found</CardTitle>
                    <CardDescription>
                        We could not find the channel you were looking for.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline">
                        <Link href="/channels">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Channels
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/channels">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Channels
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">{channel.projectName}</h1>
            <p className="text-muted-foreground">{channel.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Channel ID" value={channel.channel_id} icon={Rss} />
            <StatCard title="Total Entries" value={channel.totalEntries || channel.history.length} icon={Activity} />
            <StatCard title="Fields" value={channel.fields.length} icon={Tag} />
            <StatCard title="Created On" value={new Date(channel.createdAt).toLocaleDateString()} icon={Calendar} />
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Data History</CardTitle>
                <CardDescription>A chart visualizing the latest sensor readings.</CardDescription>
            </CardHeader>
            <CardContent>
                 {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <AreaChart data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                             <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `${value}`}
                             />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            {channel.fields.map(field => (
                                <Area
                                    key={field.name}
                                    dataKey={field.name}
                                    type="natural"
                                    fill={`var(--color-${field.name})`}
                                    fillOpacity={0.4}
                                    stroke={`var(--color-${field.name})`}
                                    stackId="a"
                                />
                            ))}
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        No data has been sent to this channel yet.
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>The last 10 data points received by this channel.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            {channel.fields.map(field => <TableHead key={field.name}>{`${field.name} (${field.unit || 'N/A'})`}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {channel.history.slice(0, 10).map(entry => (
                            <TableRow key={entry._id}>
                                <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
                                {channel.fields.map(field => (
                                    <TableCell key={field.name}>{entry.data[field.name] ?? 'N/A'}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
