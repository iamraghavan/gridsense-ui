
'use client';

import Link from "next/link";
import { useActionState, useFormStatus } from 'react';
import { login, type AuthState } from '@/lib/actions';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

export default function LoginPage() {
  const initialState: AuthState = {};
  const [state, dispatch] = useActionState(login, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="grid gap-4">
          {state.message && (
             <Alert variant="destructive">
               <Terminal className="h-4 w-4" />
               <AlertTitle>Heads up!</AlertTitle>
               <AlertDescription>
                {state.message}
               </AlertDescription>
             </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email.join(', ')}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password.join(', ')}</p>}
          </div>
          <SubmitButton />
        </CardContent>
      </form>
      <CardFooter className="text-sm">
        Don&apos;t have an account?
        <Button variant="link" asChild className="p-1">
            <Link href="/register">Sign up</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
