
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createChannel } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required.'),
  unit: z.string().min(1, 'Field unit is required.'),
});

const formSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters long.'),
  channel_id: z.string().min(3, 'Channel ID must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  fields: z.array(fieldSchema).min(1, 'At least one field is required.'),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateChannelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      channel_id: '',
      description: '',
      fields: [{ name: '', unit: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const result = await createChannel(values);
      if (result?.success) {
        toast({
          title: 'Channel Created Successfully',
          description: `The channel "${values.projectName}" has been created.`,
        });
        router.push('/channel');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Creating Channel',
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
    <div className="flex-1 space-y-4 pt-6">
       <Link href="/channel" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Channels
        </Link>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Channel</CardTitle>
          <CardDescription>Fill out the details below to set up a new data channel.</CardDescription>
        </CardHeader>
        <CardContent>
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
                        name="channel_id"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Channel ID</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., temp_sensor_01" {...field} />
                            </FormControl>
                            <FormDescription>A unique, URL-safe identifier for this channel.</FormDescription>
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
                  Create Channel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
