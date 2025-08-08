
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateChannelAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChannelById } from '@/services/channelService';
import { getSession } from '@/lib/auth';
import type { Channel } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required.'),
  unit: z.string().min(1, 'Field unit is required.'),
});

const formSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  fields: z.array(fieldSchema).min(1, 'At least one field is required.'),
});

type FormData = z.infer<typeof formSchema>;


function EditChannelForm({ channel }: { channel: Channel }) {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const channelId = params.channelId as string;

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: channel.projectName || '',
      description: channel.description || '',
      fields: channel.fields.map(f => ({ name: f.name, unit: f.unit })) || [{ name: '', unit: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const result = await updateChannelAction(channelId, values);
      if (result?.success) {
        toast({
          title: 'Channel Updated Successfully',
          description: `The channel "${values.projectName}" has been updated.`,
        });
        router.push(`/dashboard/${userId}/channel/${channelId}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Updating Channel',
          description: result?.error || 'An unknown error occurred.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Industrial Cooling System" {...field} />
                        </FormControl>
                        <FormDescription>A descriptive name for your project or device.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Monitors temperature and humidity in the main cooling unit." className="resize-none" {...field} />
                        </FormControl>
                            <FormDescription>A brief summary of what this channel is for.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>

            <div className="space-y-4">
                <FormLabel>Sensor Fields</FormLabel>
                <FormDescription>Define the data fields your sensors will send. You need at least one.</FormDescription>
                <div className="space-y-4 rounded-lg border p-4">
                    {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4">
                        <FormField
                        control={form.control}
                        name={`fields.${index}.name`}
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormLabel className={cn(index !== 0 && "sr-only")}>Field Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Temperature" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`fields.${index}.unit`}
                        render={({ field }) => (
                            <FormItem  className="flex-grow">
                                    <FormLabel className={cn(index !== 0 && "sr-only")}>Unit</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., °C" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                        >
                        <Trash2 className="h-4 w-4" />
                        <span className='sr-only'>Remove field</span>
                        </Button>
                    </div>
                    ))}
                </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', unit: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add another field
                </Button>
            </div>
            </div>

            <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
            </div>
        </form>
    </Form>
  )
}

function PageLoader() {
    return (
         <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="space-y-4">
                         <div className="space-y-4 rounded-lg border p-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                    </div>
                 </div>
                 <div className="flex justify-end pt-4">
                    <Skeleton className="h-10 w-32" />
                 </div>
            </CardContent>
         </Card>
    )
}

export default function EditChannelPage() {
    const [channel, setChannel] = React.useState<Channel | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const params = useParams();
    const channelId = params.channelId as string;
    const userId = params.userId as string;

    useEffect(() => {
        async function fetchChannel() {
            try {
                // We need the token to fetch the channel data
                const session = await getSession();
                if (!session?.token) {
                    setError("Authentication failed.");
                    setLoading(false);
                    return;
                }
                const fetchedChannel = await getChannelById(channelId, session.token);
                if (fetchedChannel) {
                    setChannel(fetchedChannel);
                    document.title = `Edit ${fetchedChannel.projectName} | RSensorGrid`;
                } else {
                    setError("Channel not found.");
                }
            } catch (err) {
                setError("Failed to fetch channel data.");
            } finally {
                setLoading(false);
            }
        }
        fetchChannel();
    }, [channelId]);


  return (
    <div className="flex-1 space-y-4 pt-6">
        <Link href={`/dashboard/${userId}/channel`} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Channels
        </Link>
        {loading ? (
           <PageLoader />
        ) : channel ? (
             <Card>
                <CardHeader>
                    <CardTitle>Edit {channel.projectName}</CardTitle>
                    <CardDescription>Update the details for your data channel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EditChannelForm channel={channel} />
                </CardContent>
             </Card>
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                    <CardDescription>
                        {error || "An unexpected error occurred while loading the channel."}
                    </CardDescription>
                </CardHeader>
            </Card>
        )}
    </div>
  );
}
