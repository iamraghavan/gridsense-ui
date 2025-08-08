'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Channel } from '@/types';
import { ArrowRight, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ChannelCardProps {
  channel: Channel;
}

function generateExamplePayload(fields: Channel['fields']): string {
    const example: Record<string, number> = {};
    fields.forEach(field => {
        const fieldName = field.name;
        // Basic logic to generate a sensible default value
        if (fieldName.toLowerCase().includes('temp')) {
            example[fieldName] = 25.5;
        } else if (fieldName.toLowerCase().includes('hum')) {
            example[fieldName] = 60;
        } else if (fieldName.toLowerCase().includes('pressure')) {
            example[fieldName] = 1012;
        }
        else {
            example[fieldName] = 123.45;
        }
    });
    return JSON.stringify(example, null, 2);
}


export function ChannelCard({ channel }: ChannelCardProps) {
    const [apiUrl, setApiUrl] = React.useState('');

    React.useEffect(() => {
        // Ensure this runs only on the client
        setApiUrl(`${window.location.origin}/api/sensors/${channel.channel_id}/data`);
    }, [channel.channel_id]);

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
      <CardFooter className="flex justify-between gap-2">
         <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className='flex-shrink-0'>
                <Info className="mr-2 h-4 w-4" />
                API Info
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>API Documentation</DialogTitle>
              <DialogDescription>
                Send sensor data to this channel using a POST request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-1">Endpoint</h4>
                    <p className="text-xs font-mono bg-muted p-2 rounded-md break-all">
                        <span className="font-bold text-primary">POST</span> {apiUrl}
                    </p>
                </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-1">Request Body (JSON)</h4>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                        <code>
                            {generateExamplePayload(channel.fields)}
                        </code>
                    </pre>
                </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-1">Headers</h4>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                        <code>
                            {'Content-Type: application/json\n'}
                            {'x-api-key: YOUR_API_KEY'}
                        </code>
                    </pre>
                </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button asChild className="w-full">
            <Link href={`/dashboard/${channel.userId}/channel/${channel.channel_id}`}>
                View Channel
                <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
