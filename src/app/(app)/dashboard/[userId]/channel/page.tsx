
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
import { MoreHorizontal, PlusCircle, X, Trash2 } from "lucide-react";
import type { Channel, User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getChannels, createChannel, deleteChannel } from "@/services/channelService";


interface ChannelsPageProps {
  user: User; // Injected by AppLayout
  token: string; // Injected by AppLayout
}

function CreateChannelDialog({ onChannelCreated, token }: { onChannelCreated: () => void, token: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([{ name: "", unit: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddField = () => {
    if (fields.length < 8) {
      setFields([...fields, { name: "", unit: "" }]);
    }
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const handleFieldChange = (index: number, key: 'name' | 'unit', value: string) => {
    const newFields = fields.map((field, i) => i === index ? { ...field, [key]: value } : field);
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a channel." });
        return;
    }
    setIsSubmitting(true);
    try {
      const filteredFields = fields.filter(f => f.name.trim() !== "");
      if (!projectName || filteredFields.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Project Name and at least one Field are required.",
        });
        setIsSubmitting(false);
        return;
      }

      await createChannel({ projectName, description, fields: filteredFields }, token);
      toast({
        title: "Channel Created!",
        description: "Your new channel has been created successfully.",
      });
      onChannelCreated();
      setOpen(false);
      setProjectName("");
      setDescription("");
      setFields([{ name: "", unit: "" }]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Creating Channel",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
            <DialogDescription>
              Configure the details for your new data channel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fields (up to 8)</Label>
              {fields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Field ${index + 1} Name (e.g., temperature)`}
                    value={field.name}
                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder={`Unit (e.g., C)`}
                    value={field.unit}
                    onChange={(e) => handleFieldChange(index, 'unit', e.target.value)}
                    className="w-24"
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {fields.length < 8 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddField}
                  className="mt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteChannelDialog({ channel, token, onChannelDeleted }: { channel: Channel, token: string | undefined, onChannelDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!token) {
            toast({ variant: "destructive", title: "Authentication Error" });
            return;
        }
        setIsDeleting(true);
        try {
            await deleteChannel(channel.channel_id, token);
            toast({ title: "Channel Deleted", description: `The channel "${channel.projectName}" has been deleted.`});
            onChannelDeleted();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error deleting channel", description: error.message });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                 <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive w-full">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your channel
                        <span className="font-bold"> {channel.projectName} </span>
                        and all of its associated data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? "Deleting..." : "Continue"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function ChannelsPage({ user, token }: ChannelsPageProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

   const fetchChannels = useCallback(() => {
    if (user?.id && token) {
        setIsLoading(true);
        getChannels(user.id, token).then(data => setChannels(data.channels)).finally(() => setIsLoading(false));
    }
   }, [user?.id, token]);
  
  useEffect(() => {
    if (user && token) {
        fetchChannels();
    } else {
        setIsLoading(false); // Stop loading if no user/token
    }
  }, [user, token, fetchChannels]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Channels</CardTitle>
          <CardDescription>
            Manage your data channels for your IoT devices.
          </CardDescription>
        </div>
        <div>
            <CreateChannelDialog onChannelCreated={fetchChannels} token={token} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden md:table-cell">Fields</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                ))
            ) : channels.length > 0 ? (
                channels.map((channel) => (
                  <TableRow key={channel.channel_id}>
                    <TableCell className="font-medium">{channel.projectName}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-xs">{channel.description}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                            {channel.fields.map((field, index) => field.name ? <Badge key={field._id || index} variant="outline">{`${field.name} (${field.unit || 'N/A'})`}</Badge> : null)}
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(channel.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/${user.id}/channel/${channel.channel_id}`} className="w-full">
                                View Details & Chart
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>Edit (soon)</DropdownMenuItem>
                          <DeleteChannelDialog channel={channel} token={token} onChannelDeleted={fetchChannels} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No channels found. Create your first one to get started.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
