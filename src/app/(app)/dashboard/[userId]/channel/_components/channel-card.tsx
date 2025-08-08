'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Channel } from '@/types';
import { ArrowRight, Info, Eye, EyeOff, Clipboard, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ChannelCardProps {
  channel: Channel;
  apiKey: string;
}

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://node-sensor-gird.onrender.com/api';

function generateExamplePayload(fields: Channel['fields']): string {
    const example: Record<string, number> = {};
    fields.forEach(field => {
        const fieldName = field.name;
        if (fieldName.toLowerCase().includes('temp')) {
            example[fieldName] = 25.5;
        } else if (fieldName.toLowerCase().includes('hum')) {
            example[fieldName] = 60;
        } else if (fieldName.toLowerCase().includes('pressure')) {
            example[fieldName] = 1012;
        } else {
            example[fieldName] = 123.45;
        }
    });
    return JSON.stringify(example, null, 2);
}

function CopyButton({ textToCopy }: { textToCopy: string }) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const onCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            toast({ title: 'Copied to clipboard!' });
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <Button onClick={onCopy} size="icon" variant="ghost" className="h-6 w-6">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            <span className="sr-only">Copy</span>
        </Button>
    );
}

export function ChannelCard({ channel, apiKey }: ChannelCardProps) {
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    const apiUrl = `${API_URL_BASE}/sensors/${channel.channel_id}/data`;

    const toggleKeyVisibility = () => setIsKeyVisible(!isKeyVisible);

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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>API Documentation</DialogTitle>
              <DialogDescription>
                Send sensor data to this channel using a POST request. The channel ID is part of the URL.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Endpoint</h4>
                     <div className="flex items-center gap-2 text-xs font-mono bg-muted p-2 rounded-md break-all">
                        <span className="font-bold text-primary">POST</span>
                        <span className="flex-grow">{apiUrl}</span>
                        <CopyButton textToCopy={apiUrl} />
                    </div>
                </div>

                 <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Headers</h4>
                    <div className="text-xs bg-muted p-3 rounded-md space-y-2">
                        <pre className='font-mono'>Content-Type: application/json</pre>
                        <div className="flex items-center gap-2 font-mono">
                           <span>x-api-key:</span>
                           <span className="flex-grow">{isKeyVisible ? apiKey : '•'.repeat(12)}</span>
                           <Button onClick={toggleKeyVisibility} size="icon" variant="ghost" className="h-6 w-6">
                               {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                               <span className="sr-only">{isKeyVisible ? 'Hide API Key' : 'Show API Key'}</span>
                           </Button>
                           <CopyButton textToCopy={apiKey} />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Request Body (JSON)</h4>
                     <p className="text-xs text-muted-foreground">
                        The body must be a JSON object where keys match the field names you defined.
                    </p>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                        <code>
                            {generateExamplePayload(channel.fields)}
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
