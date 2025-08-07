
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, BarChart, Rss, KeyRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page from the root.
    router.replace('/login');
  }, [router]);
  
  // Optional: Render a loading state or the homepage content briefly
  // before the redirect happens. A loading spinner is a good choice.
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Sense, Stream, Succeed.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              RSensorGrid is your all-in-one platform for managing IoT devices, visualizing data, and unlocking powerful insights from your sensor network.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">
                Create Your First Channel
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="bg-secondary py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">Powerful Features, Simple Interface</h2>
                    <p className="text-muted-foreground mt-2">Everything you need to get your IoT project off the ground.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                                <Rss className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle>Channel Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Easily create and configure channels for your various IoT devices and data streams.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                               <BarChart className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle>Data Visualization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Instantly visualize your incoming data with dynamic charts and graphs.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                                <KeyRound className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle>Secure API Keys</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Manage your API keys securely to control access to your data ingestion endpoints.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} RSensorGrid. All rights reserved.
      </footer>
    </div>
  );
}
