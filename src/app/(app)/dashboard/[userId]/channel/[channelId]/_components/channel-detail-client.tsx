
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import type { Channel, ChannelHistory } from '@/types';
import { useSocket } from '@/hooks/use-socket';
import { ArrowLeft, Rss, Clock, Hash, Thermometer, Droplets } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Helper to get a consistent color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const chartColors = ['#3399FF', '#6666B2', '#FF6347', '#3CB371', '#FFD700', '#BA55D3'];

const getFieldColor = (fieldName: string, index: number) => {
    return chartColors[index % chartColors.length] || stringToColor(fieldName);
};


export function ChannelDetailClient({ channel }: { channel: Channel }) {
    const [history, setHistory] = useState<ChannelHistory[]>(channel.history || []);
    const [selectedField, setSelectedField] = useState<string>(channel.fields[0]?.name || 'all');
    
    // Initialize state with data from the channel prop to avoid "N/A" on load.
    const [latestData, setLatestData] = useState<Record<string, number> | undefined>(channel.latestData);
    const [lastUpdate, setLastUpdate] = useState<string | undefined>(channel.lastUpdate);
    
    const { socket } = useSocket(channel.userId);

    useEffect(() => {
        if (socket) {
            const handleHistoryUpdate = (newHistoryEntry: ChannelHistory) => {
                if (newHistoryEntry.channelId === channel.channel_id) {
                     setHistory(prevHistory => {
                        const newHistory = [...prevHistory, newHistoryEntry];
                        // Keep client-side history manageable, e.g., last 100 entries
                        return newHistory.slice(-100); 
                    });
                    setLatestData(newHistoryEntry.data);
                    setLastUpdate(newHistoryEntry.createdAt);
                }
            };
            socket.on('historyUpdate', handleHistoryUpdate);
            return () => {
                socket.off('historyUpdate', handleHistoryUpdate);
            };
        }
    }, [socket, channel.channel_id]);

    const chartData = useMemo(() => 
        history.map(entry => ({
            ...entry.data,
            time: format(new Date(entry.createdAt), 'HH:mm:ss'),
        })), [history]
    );

    const chartConfig = useMemo(() => {
        const config: any = {};
        channel.fields.forEach((field, index) => {
            config[field.name] = {
                label: `${field.name} (${field.unit})`,
                color: getFieldColor(field.name, index),
            };
        });
        return config;
    }, [channel.fields]);

    const fieldsToDisplay = selectedField === 'all' 
        ? channel.fields 
        : channel.fields.filter(f => f.name === selectedField);

    return (
        <div className="flex-1 space-y-6 pt-6">
             <Link href={`/dashboard/${channel.userId}/channel`} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Channels
            </Link>
            <Card>
                <CardHeader>
                    <div className='flex flex-wrap justify-between items-start gap-4'>
                        <div>
                            <CardTitle className="text-2xl font-bold font-headline">{channel.projectName}</CardTitle>
                            <CardDescription className='mt-1'>{channel.description}</CardDescription>
                            <div className="mt-2 text-xs text-muted-foreground font-mono">
                                Channel ID: {channel.channel_id}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className='text-right'>
                             <p className="text-sm font-medium">Total Entries</p>
                             <p className="text-2xl font-bold">{history.length}</p>
                           </div>
                           <div className="w-48">
                                <Select value={selectedField} onValueChange={setSelectedField}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a field to display" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Fields</SelectItem>
                                    {channel.fields.map(field => (
                                    <SelectItem key={field._id} value={field.name}>{field.name}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                           </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {history.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12 }} 
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }} 
                            tickLine={false}
                            axisLine={false}
                            width={80}
                            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
                        />
                        <ChartTooltip 
                            content={<ChartTooltipContent />} 
                            cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3'}}
                        />
                        
                        {fieldsToDisplay.map(field => (
                           <Line
                            key={field.name}
                            type="monotone"
                            dataKey={field.name}
                            stroke={chartConfig[field.name]?.color || '#000000'}
                            strokeWidth={2}
                            dot={false}
                            />
                        ))}
                        </LineChart>
                    </ChartContainer>
                     ) : (
                        <div className="h-[400px] w-full flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                             <p className="text-muted-foreground">Waiting for initial data...</p>
                            <Skeleton className="h-full w-full" />
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Channel Details</CardTitle>
                        <CardDescription>Key information about this channel.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center"><Clock className="mr-2 h-4 w-4" />Created</span>
                            <span>{format(new Date(channel.createdAt), 'PP')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center"><Rss className="mr-2 h-4 w-4" />Last Update</span>
                             <span>{lastUpdate ? `${formatDistanceToNow(new Date(lastUpdate))} ago` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-muted-foreground flex items-center"><Hash className="mr-2 h-4 w-4" />Total Entries</span>
                           <span className="font-semibold">{history.length}</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Sensor Fields</CardTitle>
                         <CardDescription>Latest data from each configured sensor field.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Field Name</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead className="text-right">Latest Value</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {channel.fields.map((field) => (
                                    <TableRow key={field._id}>
                                        <TableCell className="font-medium">{field.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{field.unit}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {latestData && latestData[field.name] !== undefined 
                                                ? latestData[field.name].toFixed(2)
                                                : 'N/A'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

