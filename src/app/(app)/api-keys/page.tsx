
'use client'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Eye, EyeOff, PlusCircle, Trash2 } from "lucide-react";
import type { ApiKey, User } from "@/types";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_URL, API_KEY, AUTH_TOKEN_COOKIE_NAME, USER_DETAILS_COOKIE_NAME } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

async function getUserDetails(userId: string, token: string): Promise<User | null> {
    try {
        const res = await fetch(`${API_URL}/auth/user/${userId}`, {
            headers: {
                "x-api-key": API_KEY,
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });
        if (!res.ok) {
            console.error("Failed to fetch user data:", res.statusText);
            return null;
        }
        const userData = await res.json();
        return userData;
    } catch (error) {
        console.error("Error fetching user details:", error);
        return null;
    }
}


function ApiKeyCard({ apiKey, isLoading }: { apiKey: ApiKey | null, isLoading: boolean }) {
    const [isVisible, setIsVisible] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey.key);
            toast({
                title: "Copied to clipboard!",
                description: "The API key has been copied to your clipboard.",
            });
        }
    }
    
    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-10 w-full" />
                    <div className="flex items-center gap-2">
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!apiKey) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No API Key Found</CardTitle>
                    <CardDescription>We could not retrieve your API key.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please try refreshing the page or contact support.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{apiKey.name}</CardTitle>
                <CardDescription>Created on {new Date(apiKey.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Input readOnly type={isVisible ? 'text' : 'password'} value={apiKey.key} className="font-code tracking-wider" />
                    <Button variant="outline" size="icon" onClick={() => setIsVisible(!isVisible)}>
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-full" onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Key
                    </Button>
                    <Button variant="destructive" className="w-full" disabled>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke (soon)
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ApiKeysPage() {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`))
        ?.split('=')[1];
    setToken(cookieValue);

    const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${USER_DETAILS_COOKIE_NAME}=`))
        ?.split('=')[1];
    if (userCookie) {
        try {
            setUser(JSON.parse(decodeURIComponent(userCookie)));
        } catch (e) {
            console.error("Failed to parse user cookie:", e);
            setUser(null);
        }
    }
    if (!userCookie || !cookieValue) {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchKey = async () => {
        if (user?.id && token) {
            setIsLoading(true);
            const userDetails = await getUserDetails(user.id, token);
            if (userDetails && userDetails.apiKey) {
                setApiKey({
                    id: userDetails.id, // Or a specific key ID if available
                    name: "Your API Key",
                    key: userDetails.apiKey,
                    createdAt: userDetails.createdAt || new Date().toISOString()
                });
            }
            setIsLoading(false);
        }
    };
    if (user?.id && token) {
      fetchKey();
    }
  }, [user, token]);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">API Keys</h1>
                <p className="text-muted-foreground">
                    Your API key for programmatic access to your data.
                </p>
            </div>
            <div>
                <Button disabled>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Generate New Key (soon)
                </Button>
            </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <ApiKeyCard apiKey={apiKey} isLoading={isLoading} />
        </div>
    </div>
  );
}
