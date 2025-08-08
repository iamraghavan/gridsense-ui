
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Clipboard, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://node-sensor-gird.onrender.com/api';

const apiEndpoints = [
    { method: 'POST', path: '/sensors/{channelId}/data', description: 'Send sensor data to a channel' },
    { method: 'GET', path: '/sensors/{channelId}/latest', description: 'Get latest data from a channel' },
    { method: 'GET', path: '/sensors/{channelId}/history', description: 'Get historical data from a channel' },
    { method: 'GET', path: '/channels/{channelId}', description: 'Get a single channel with history' },
    { method: 'PUT', path: '/channels/{channelId}', description: 'Update a channel' },
    { method: 'DELETE', path: '/channels/{channelId}', description: 'Delete a channel' },
];

export function ApiKeyClient({ apiKey }: { apiKey: string }) {
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const toggleVisibility = () => setIsKeyVisible(!isKeyVisible);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey).then(() => {
            setCopied(true);
            toast({ title: 'API Key copied to clipboard!' });
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex-1 space-y-4 pt-6">
             <div className="flex items-center justify-between space-y-2">
                <div>
                    <h1 className="text-2xl font-bold font-headline">API Documentation</h1>
                    <p className="text-muted-foreground">
                        Use your API key to interact with the RSensorGrid API.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your API Key</CardTitle>
                    <CardDescription>
                        This key is required for all API requests. Keep it secret and secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full max-w-md items-center space-x-2">
                        <Input
                            type={isKeyVisible ? 'text' : 'password'}
                            readOnly
                            value={apiKey}
                            className="font-mono"
                        />
                        <Button variant="ghost" size="icon" onClick={toggleVisibility} aria-label="Toggle API key visibility">
                            {isKeyVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy API key">
                            {copied ? <Check className="h-5 w-5 text-primary" /> : <Clipboard className="h-5 w-5" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>API Endpoints</CardTitle>
                    <CardDescription>
                        The base URL for all API endpoints is: <code className='font-mono bg-muted px-1 py-0.5 rounded-sm'>{API_URL_BASE}</code>.
                        All API requests must include the <code className='font-mono bg-muted px-1 py-0.5 rounded-sm'>x-api-key</code> header with your API key.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Method</TableHead>
                                <TableHead>Endpoint</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apiEndpoints.map((endpoint, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <span className={`font-semibold ${endpoint.method === 'GET' ? 'text-blue-600' : 
                                            endpoint.method === 'POST' ? 'text-green-600' :
                                            endpoint.method === 'PUT' ? 'text-yellow-600' :
                                            'text-red-600'}`}>
                                            {endpoint.method}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono">{endpoint.path}</TableCell>
                                    <TableCell>{endpoint.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
