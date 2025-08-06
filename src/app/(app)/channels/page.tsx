
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
import { MoreHorizontal, PlusCircle, X } from "lucide-react";
import type { Channel } from "@/types";
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
import { useEffect, useState } from "react";
import { API_URL, API_KEY, AUTH_TOKEN_COOKIE_NAME } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

async function getChannels(token: string | undefined): Promise<Channel[]> {
  if (!token) return [];
  try {
    const res = await fetch(`${API_URL}/channels`, {
      headers: {
        "x-api-key": API_KEY,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
        console.error("Failed to fetch channels:", res.statusText);
        return [];
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch channels", error);
    return [];
  }
}

async function createChannel(channelData: {
    projectName: string;
    description: string;
    fields: { name: string; unit: string }[];
  }, token: string | undefined): Promise<any> {
  if (!token) throw new Error("Authentication token not found.");
  const res = await fetch(`${API_URL}/channels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(channelData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create channel.");
  }
  return res.json();
}

function CreateChannelDialog({ onChannelCreated }: { onChannelCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([{ name: "", unit: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [token, setToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`))
            ?.split('=')[1];
        setToken(cookieValue);
    }, []);


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
      onChannelCreated(); // Refresh the channel list
      setOpen(false); // Close the dialog
      // Reset form
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

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`))
            ?.split('=')[1];
        setToken(cookieValue);
    }, []);

  const fetchChannels = () => {
    if (token) {
        setIsLoading(true);
        getChannels(token).then(setChannels).finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    if (token) {
        fetchChannels();
    } else {
        setIsLoading(false);
    }
  }, [token]);

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
            <CreateChannelDialog onChannelCreated={fetchChannels} />
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
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        Loading channels...
                    </TableCell>
                </TableRow>
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
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Data</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
