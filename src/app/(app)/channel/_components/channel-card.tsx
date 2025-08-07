'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Channel } from '@/types';
import { ArrowRight } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{channel.projectName}</CardTitle>
        <CardDescription className="line-clamp-2 h-10">{channel.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-foreground">{channel.channel_id}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{channel.fields.length}</span> {channel.fields.length === 1 ? 'Field' : 'Fields'}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
            <Link href={`/channel/${channel._id}`}>
                View Channel
                <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
