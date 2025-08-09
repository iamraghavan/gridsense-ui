
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { register } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Account
    </Button>
  );
}


export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(register, null);

  useEffect(() => {
    document.title = "Register | RSensorGrid";
    if (state?.success && state.user) {
      toast({
        title: 'Registration successful!',
        description: `Welcome, ${state.user.name}! Redirecting to your dashboard.`,
      });
      router.push(`/dashboard/${state.user._id}`);
    } else if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: state.error,
      });
    }
  }, [state, router, toast]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          Create your account to get started with MERKE Cloud.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            <SubmitButton />
        </form>
      </CardContent>
      <CardFooter className="text-sm">
          <p className="w-full text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
      </CardFooter>
    </Card>
  );
}
