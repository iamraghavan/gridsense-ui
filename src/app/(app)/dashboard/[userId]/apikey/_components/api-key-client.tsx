
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Clipboard, Eye, EyeOff, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://node-sensor-gird.onrender.com/api';

const apiEndpoints = [
    { 
        method: 'POST', 
        path: '/sensors/{channelId}/data', 
        description: 'Send sensor data to a channel.',
        params: [{ name: 'channelId', type: 'path', description: 'The unique ID of the channel.'}],
        body: {
            "Temperature": 25.5,
            "Humidity": 60
        },
        response: {
            "message": "Data received successfully",
            "entry": {
                "channelId": "your-channel-id",
                "data": { "Temperature": 25.5, "Humidity": 60 },
                "_id": "60d5f1f7a4b8a40015f3e1a1",
                "createdAt": "2025-08-08T00:00:00.000Z"
            }
        }
    },
    { 
        method: 'GET', 
        path: '/sensors/{channelId}/latest', 
        description: 'Get the most recent data entry from a channel.',
        params: [{ name: 'channelId', type: 'path', description: 'The unique ID of the channel.'}],
        response: {
            "_id": "60d5f1f7a4b8a40015f3e1a1",
            "channelId": "your-channel-id",
            "data": { "Temperature": 26.1, "Humidity": 59.5 },
            "createdAt": "2025-08-08T00:05:00.000Z"
        }
    },
    { 
        method: 'GET', 
        path: '/sensors/{channelId}/history', 
        description: 'Get a paginated history of data for a channel.',
        params: [
            { name: 'channelId', type: 'path', description: 'The unique ID of the channel.' },
            { name: 'limit', type: 'query', description: 'Number of entries to return (default: 50).' },
            { name: 'start', type: 'query', description: 'Start date for history (ISO format).' },
        ],
        response: [
             {
                "_id": "60d5f1f7a4b8a40015f3e1a1",
                "channelId": "your-channel-id",
                "data": { "Temperature": 26.1, "Humidity": 59.5 },
                "createdAt": "2025-08-08T00:05:00.000Z"
            },
            {
                "_id": "60d5f1f0a4b8a40015f3e1a0",
                "channelId": "your-channel-id",
                "data": { "Temperature": 25.9, "Humidity": 59.8 },
                "createdAt": "2025-08-08T00:04:00.000Z"
            }
        ]
    },
    { 
        method: 'GET', 
        path: '/channels/{channelId}', 
        description: 'Get a single channel with its full history.',
        params: [{ name: 'channelId', type: 'path', description: 'The unique ID of the channel.'}],
        response: {
            "_id": "60d5f0a8a4b8a40015f3e19f",
            "channel_id": "your-channel-id",
            "projectName": "Greenhouse Monitor",
            /* ... other channel fields ... */
            "history": [ /* array of history objects */ ]
        }
    },
    { 
        method: 'PUT', 
        path: '/channels/{channelId}', 
        description: 'Update a channel\'s properties (name, description, fields).',
        params: [{ name: 'channelId', type: 'path', description: 'The unique ID of the channel.'}],
        body: {
            "projectName": "Updated Greenhouse Monitor",
            "description": "Monitors temperature and humidity in the main greenhouse.",
            "fields": [
                { "name": "Temperature", "unit": "C" },
                { "name": "Humidity", "unit": "%" }
            ]
        },
        response: {
             "_id": "60d5f0a8a4b8a40015f3e19f",
            "channel_id": "your-channel-id",
            "projectName": "Updated Greenhouse Monitor",
            /* ... other updated fields ... */
        }
    },
    { 
        method: 'DELETE', 
        path: '/channels/{channelId}', 
        description: 'Permanently delete a channel and all its data.',
        params: [{ name: 'channelId', type: 'path', description: 'The unique ID of the channel.'}],
        response: { "message": "Channel deleted successfully" }
    },
];

function CopyButton({ textToCopy, className }: { textToCopy: string, className?: string }) {
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
        <Button onClick={onCopy} size="icon" variant="ghost" className={className}>
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
            <span className="sr-only">Copy</span>
        </Button>
    );
}

function MockResponse({ data }: { data: any }) {
    const [showResponse, setShowResponse] = useState(false);

    return (
        <div className="space-y-2">
            <Button variant="outline" size="sm" onClick={() => setShowResponse(!showResponse)}>
                <Server className="mr-2 h-4 w-4" />
                {showResponse ? 'Hide' : 'Test'} Mock Response
            </Button>
            {showResponse && (
                 <div className="relative">
                    <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto border">
                        <code>
                            {JSON.stringify(data, null, 2)}
                        </code>
                    </pre>
                     <CopyButton textToCopy={JSON.stringify(data, null, 2)} className="absolute top-2 right-2 h-7 w-7" />
                </div>
            )}
        </div>
    )
}

function MethodLabel({ method }: { method: string }) {
    const colorClasses = {
        'GET': 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400',
        'POST': 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400',
        'PUT': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400',
        'DELETE': 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400',
    };
    return (
        <span className={`w-20 text-center rounded-md px-2 py-1 text-sm font-semibold ${colorClasses[method as keyof typeof colorClasses] || ''}`}>
            {method}
        </span>
    )
}

export function ApiKeyClient({ apiKey }: { apiKey: string }) {
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    
    const { toast } = useToast();

    const toggleVisibility = () => setIsKeyVisible(!isKeyVisible);
    
    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: message });
        });
    };

    return (
        <div className="flex-1 space-y-6 pt-6">
             <div className="flex items-center justify-between space-y-2">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">API Documentation</h1>
                    <p className="text-muted-foreground">
                        Use your API key to interact with the RSensorGrid API.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>
                        All API requests must include the <code className='font-mono bg-muted px-1 py-0.5 rounded-sm'>x-api-key</code> header with your API key.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex w-full max-w-lg items-center space-x-2">
                        <Input
                            type={isKeyVisible ? 'text' : 'password'}
                            readOnly
                            value={apiKey}
                            className="font-mono text-base"
                        />
                        <Button variant="ghost" size="icon" onClick={toggleVisibility} aria-label="Toggle API key visibility">
                            {isKeyVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                        <Button variant="outline" onClick={() => copyToClipboard(apiKey, 'API Key copied!')}>
                            <Clipboard className="mr-2 h-4 w-4" /> Copy Key
                        </Button>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm mb-1">Base URL</h4>
                        <div className="flex items-center gap-2 text-sm font-mono bg-muted p-2 rounded-md break-all">
                            <span className="flex-grow">{API_URL_BASE}</span>
                            <CopyButton textToCopy={API_URL_BASE} className="h-7 w-7"/>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline">Endpoints</h2>
                <Accordion type="single" collapsible className="w-full space-y-2">
                    {apiEndpoints.map((endpoint, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg bg-card">
                             <AccordionTrigger className="p-4 text-base hover:no-underline">
                                <div className='flex items-center gap-4 w-full'>
                                    <MethodLabel method={endpoint.method} />
                                    <span className="font-mono text-left flex-1">{endpoint.path}</span>
                                    <span className="text-sm text-muted-foreground font-normal hidden md:block mr-4">{endpoint.description}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-6 pt-2 border-t">
                                <div className="space-y-6">
                                    <p className="text-sm text-muted-foreground md:hidden">{endpoint.description}</p>
                                    
                                    {endpoint.params && (
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">Parameters</h4>
                                            <ul className='list-disc list-inside space-y-1 text-sm'>
                                                {endpoint.params.map(p => (
                                                    <li key={p.name}>
                                                        <code className='font-mono bg-muted px-1 py-0.5 rounded-sm'>{p.name}</code>
                                                        <span className='text-muted-foreground'> ({p.type})</span>: {p.description}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {endpoint.body && (
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">Request Body</h4>
                                            <div className="relative">
                                                <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto border">
                                                    <code>{JSON.stringify(endpoint.body, null, 2)}</code>
                                                </pre>
                                                <CopyButton textToCopy={JSON.stringify(endpoint.body, null, 2)} className="absolute top-2 right-2 h-7 w-7" />
                                            </div>
                                        </div>
                                    )}

                                    {endpoint.response && <MockResponse data={endpoint.response} />}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}


    