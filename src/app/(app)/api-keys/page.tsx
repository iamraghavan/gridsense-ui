
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
import type { User } from "@/types";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { USER_DETAILS_COOKIE_NAME } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

function ApiKeyCard({ apiKey, isLoading }: { apiKey: string | null, isLoading: boolean }) {
    const [isVisible, setIsVisible] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
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
                <CardTitle>Your API Key</CardTitle>
                <CardDescription>Use this key for programmatic access to the API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Input readOnly type={isVisible ? 'text' : 'password'} value={apiKey} className="font-code tracking-wider" />
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${USER_DETAILS_COOKIE_NAME}=`))
        ?.split('=')[1];

    if (userCookie) {
        try {
            const parsedUser = JSON.parse(decodeURIComponent(userCookie));
            setUser(parsedUser);
        } catch (e) {
            console.error("Failed to parse user cookie:", e);
            setUser(null);
        }
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">API Keys</h1>
                <p className="text-muted-foreground">
                    Your secret keys for programmatic access to RSensorGrid.
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
             <ApiKeyCard apiKey={user?.apiKey ?? null} isLoading={isLoading} />
        </div>
    </div>
  );
}
