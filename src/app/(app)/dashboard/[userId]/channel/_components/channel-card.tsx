
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Channel } from '@/types';
import { ArrowRight, Info, Eye, EyeOff, Clipboard, Check, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteChannelAction } from '@/lib/actions';
import { useParams } from 'next/navigation';

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

export function ChannelCard({ channel, apiKey }: { channel: Channel; apiKey: string }) {
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const apiUrl = `${API_URL_BASE}/sensors/${channel.channel_id}/data`;
    const { toast } = useToast();
    const params = useParams();
    const userId = params.userId as string;

    const toggleKeyVisibility = () => setIsKeyVisible(!isKeyVisible);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteChannelAction(channel.channel_id);
            if (result.success) {
                toast({ title: "Channel Deleted", description: `The channel "${channel.projectName}" has been successfully deleted.` });
            } else {
                toast({ variant: 'destructive', title: "Error Deleting Channel", description: result.error });
            }
        } catch (error) {
             toast({ variant: 'destructive', title: "Error", description: "An unexpected error occurred." });
        } finally {
            setIsDeleting(false);
        }
    };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle className="text-lg">{channel.projectName}</CardTitle>
            <CardDescription className="line-clamp-2 h-10">{channel.description}</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 <DropdownMenuItem asChild>
                    <Link href={`/dashboard/${userId}/channel/${channel.channel_id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </Link>
                </DropdownMenuItem>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            <span className="text-destructive">Delete</span>
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                <span className="font-bold"> {channel.projectName} </span>
                                channel and all of its associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Yes, delete channel
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
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
