
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
import type { ApiKey } from "@/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const mockApiKeys: ApiKey[] = [
    { id: 'key_1', name: 'Primary Ingestion Key', key: 'a0ea2188-ee2f-46d2-9661-310bed43c3bf', createdAt: '2023-09-15T10:00:00Z' },
    { id: 'key_2', name: 'Grafana Dashboard Key', key: 'b1fb2299-ff3g-47e3-9772-310ced44d4cg', createdAt: '2023-10-20T11:20:00Z' },
    { id: 'key_3', name: 'Mobile App Key', key: 'c2gc3300-gg4h-48f4-9883-310dfd45e5dh', createdAt: '2023-11-01T15:45:00Z' },
];

function ApiKeyCard({ apiKey }: { apiKey: ApiKey }) {
    const [isVisible, setIsVisible] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey.key);
        toast({
            title: "Copied to clipboard!",
            description: "The API key has been copied to your clipboard.",
        });
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
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">API Keys</h1>
                <p className="text-muted-foreground">
                    Manage API keys for programmatic access to your data.
                </p>
            </div>
            <div>
                <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Generate New Key
                </Button>
            </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockApiKeys.map((key) => <ApiKeyCard key={key.id} apiKey={key} />)}
        </div>
    </div>
  );
}
