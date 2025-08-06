
'use client';

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, MoreHorizontal, Rss, HelpCircle } from "lucide-react";
import type { Channel } from "@/types";
import { API_URL, API_KEY, AUTH_TOKEN_COOKIE_NAME } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

async function getChannels(token: string | undefined): Promise<Channel[]> {
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/channels`, {
      headers: {
        "x-api-key": API_KEY,
        "Authorization": `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error("Failed to fetch channels:", response.statusText);
      return [];
    }

    const channels = await response.json();
    return channels;
  } catch (error) {
    console.error("Error fetching channels:", error);
    return [];
  }
}

export default function DashboardPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [token, setToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`))
            ?.split('=')[1];
        setToken(cookieValue);
    }, []);

    useEffect(() => {
        if (token) {
            getChannels(token).then(setChannels);
        }
    }, [token]);

    const totalRequests = 0;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
                <p className="text-muted-foreground">
                    An overview of your channels and their latest activity.
                </p>
            </div>
            <div>
                <Button asChild>
                    <Link href="/channels">Manage Channels <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
                    <Rss className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{channels.length}</div>
                    <p className="text-xs text-muted-foreground">You have {channels.length} channels in total.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRequests}</div>
                    <p className="text-xs text-muted-foreground">Total data points from all channels.</p>
                </CardContent>
            </Card>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Channels</CardTitle>
          <CardDescription>
            A list of all your configured IoT channels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden lg:table-cell">Last Update</TableHead>
                <TableHead className="hidden lg:table-cell">Latest Data</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.length > 0 ? (
                channels.map((channel) => (
                  <TableRow key={channel.channel_id}>
                    <TableCell className="font-medium">{channel.projectName}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-xs">{channel.description}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {channel.lastUpdate ? new Date(channel.lastUpdate).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {channel.latestData ? (
                            Object.entries(channel.latestData).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="font-code">{`${key}: ${value}`}</Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground text-xs">No data yet</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Channel</DropdownMenuItem>
                          <DropdownMenuItem>View Data</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No channels found.
                    <Button variant="link" asChild><Link href="/channels">Create your first one!</Link></Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
