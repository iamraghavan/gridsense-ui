
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { API_KEY, API_URL } from "@/lib/constants";

const USER_CACHE_KEY = 'rsg_user';
const TOKEN_CACHE_KEY = 'rsg_token';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY, // Ensure correct casing
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }
      
      if (data.token && data._id) {
        // The API returns the full user object including the token.
        // We'll store the user object and token separately for easier access.
        const user = { ...data, id: data._id }; // Ensure id field for consistency
        const token = data.token;

        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_CACHE_KEY, token);

        console.log("Login successful, redirecting to dashboard for user:", user.name);
        router.push(`/dashboard/${user.id}`);

      } else {
        throw new Error('Login failed: Invalid response from server.');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
             <Alert variant="destructive">
               <Terminal className="h-4 w-4" />
               <AlertTitle>Heads up!</AlertTitle>
               <AlertDescription>
                {error}
               </AlertDescription>
             </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
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
