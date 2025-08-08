'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Channel, ChannelHistory } from '@/types';
import { useSocket } from '@/hooks/use-socket';

type ChartableData = Record<string, { unit: string; data: { time: string; value: number }[] }>;

function processChannelData(channel: Channel): ChartableData {
  const dataByField: ChartableData = channel.fields.reduce((acc, field) => {
    acc[field.name] = {
      unit: field.unit,
      data: [],
    };
    return acc;
  }, {} as ChartableData);

  if (channel.history && channel.history.length > 0) {
    channel.history.forEach((entry: ChannelHistory) => {
      Object.entries(entry.data).forEach(([fieldName, value]) => {
        const fieldConfig = channel.fields.find(f => f.name === fieldName);
        if (fieldConfig && dataByField[fieldConfig.name] && typeof value === 'number') {
          try {
            dataByField[fieldConfig.name].data.push({
              time: format(parseISO(entry.createdAt), 'MMM d, HH:mm'),
              value: value,
            });
          } catch(e) {
            // Ignore invalid date formats
          }
        }
      });
    });
  }

  Object.values(dataByField).forEach(field => {
    field.data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  });
  
  return dataByField;
}

export function ChannelDetailClient({ channel: initialChannel }: { channel: Channel }) {
  const [channel, setChannel] = useState<Channel>(initialChannel);

  const chartableData = useMemo(() => processChannelData(channel), [channel]);
  
  const { socket } = useSocket(initialChannel.userId);

  useEffect(() => {
    if (!socket) return;
    
    socket.emit('joinChannel', channel.channel_id);

    const handleNewData = (newHistoryEntry: ChannelHistory) => {
        if(newHistoryEntry.channelId === channel.channel_id) {
            setChannel(prevChannel => {
                const newHistory = [...(prevChannel.history || []), newHistoryEntry];
                if (newHistory.length > 200) { 
                    newHistory.shift();
                }
                return { ...prevChannel, history: newHistory };
            });
        }
    };

    socket.on('historyUpdate', handleNewData);

    return () => {
        socket.emit('leaveChannel', channel.channel_id);
        socket.off('historyUpdate', handleNewData);
    };
  }, [socket, channel.channel_id]);

  return (
    <div className="flex-1 space-y-4 pt-6">
      <Link href={`/dashboard/${channel.userId}/channel`} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Channels
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{channel.projectName}</CardTitle>
          <CardDescription>{channel.description}</CardDescription>
          <div className="text-sm text-muted-foreground pt-2">
            Channel ID: <span className="font-mono text-foreground">{channel.channel_id}</span>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {channel.fields.map((field) => {
          const { data: chartData, unit } = chartableData[field.name] ?? { data: [], unit: '' };

          return (
            <Card key={field._id}>
              <CardHeader>
                <CardTitle>{field.name} History</CardTitle>
                <CardDescription>
                  Recent readings for the {field.name.toLowerCase()} sensor. Unit: {unit}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ChartContainer 
                    config={{
                        value: {
                            label: field.name,
                            color: "hsl(var(--chart-1))",
                        },
                    }}
                    className="h-[250px] w-full"
                   >
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                        interval="preserveStartEnd"
                      />
                       <YAxis 
                         tickLine={false}
                         axisLine={false}
                         tickMargin={8}
                         tickFormatter={(value) => `${value} ${unit}`}
                       />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent 
                            formatter={(value, name, item) => (
                                <>
                                 <div className="font-medium">{item.payload.time}</div>
                                 <div className="text-sm text-muted-foreground">
                                    {field.name}: {value} {unit}
                                </div>
                                </>
                            )}
                            />}
                      />
                      <Line
                        dataKey="value"
                        type="monotone"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[250px] text-center">
                        <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold">No Data Yet</p>
                        <p className="text-sm text-muted-foreground">
                            This sensor hasn't sent any data. Check your device and API configuration.
                        </p>
                    </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
