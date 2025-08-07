'use server';

import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getChannelById } from '@/services/channelService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default async function ChannelDetailPage({ params }: { params: { channelId: string } }) {
  const session = await getSession();
  if (!session?.user || !session?.token) {
    return redirect('/login');
  }

  const channel = await getChannelById(params.channelId, session.token);

  if (!channel) {
    notFound();
  }

  // Group entries by field name
  const dataByField = channel.fields.reduce((acc, field) => {
    acc[field.name] = {
      unit: field.unit,
      data: [],
    };
    return acc;
  }, {} as Record<string, { unit: string; data: any[] }>);

  if (channel.entries && channel.entries.length > 0) {
    channel.entries.forEach(entry => {
      Object.entries(entry.data).forEach(([fieldName, value]) => {
        if (dataByField[fieldName]) {
          dataByField[fieldName].data.push({
            time: format(parseISO(entry.createdAt), 'MMM d, HH:mm'),
            value: value,
          });
        }
      });
    });
  }

  return (
    <div className="flex-1 space-y-4 pt-6">
      <Link href="/channel" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
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
          const chartData = dataByField[field.name]?.data ?? [];
          const unit = dataByField[field.name]?.unit;

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
                            right: 20,
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
                        tickFormatter={(value) => value.slice(0, 12)}
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
                            This sensor hasn't sent any data.
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
