
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  KeyRound,
  Rss,
  LogOut,
  User as UserIcon,
  Settings,
  LifeBuoy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/logo';
import { logout } from '@/lib/actions';
import type { User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';

function UserMenu({ user }: { user: User }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.name || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={logout}>
                <button type="submit" className="w-full text-left">
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function LoadingSkeleton() {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:block">
            <div className="flex h-full max-h-screen flex-col gap-2 p-4">
                <div className="flex h-14 items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="mt-4 flex-1">
                    <nav className="grid items-start gap-2 text-sm font-medium">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </nav>
                </div>
            </div>
        </div>
        <div className="flex flex-col">
            <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                <Skeleton className="h-8 w-8 md:hidden" />
                <div className="w-full flex-1">
                    <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </main>
        </div>
      </div>
    );
}

// This is the new, robust layout for the authenticated part of the app.
export default function AppLayout({ children, params }: { children: React.ReactNode, params: { userId: string } }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    // Fetch user data from our secure BFF endpoint
    async function fetchUser() {
      console.log("AppLayout: Starting to fetch user...");
      try {
        const res = await fetch('/api/auth/me'); // This calls the new route handler
        if (!res.ok) {
          console.error("AppLayout: Auth failed, logging out...");
          await logout();
          return;
        }
        const data = await res.json();
        console.log("AppLayout: User data fetched successfully on client-side:", data);
        if (data.user && data.token) {
            setUser(data.user);
            setToken(data.token);

            // This is a crucial check. If the URL doesn't have the correct user ID,
            // we redirect to the correct one. This handles the generic /dashboard redirect.
            if (!pathname.includes(data.user.id)) {
                console.log(`AppLayout: Path is wrong (${pathname}), redirecting to /dashboard/${data.user.id}`);
                router.replace(`/dashboard/${data.user.id}`);
            }
        } else {
            console.error("AppLayout: User or token missing in /api/auth/me response, logging out.", data);
            await logout();
        }
      } catch (error) {
        console.error("AppLayout: Failed to fetch user, logging out.", error);
        await logout();
      } finally {
        console.log("AppLayout: Finished fetching user, setting isLoading to false.");
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [pathname, router]);

  const navItems = React.useMemo(() => {
    if (!user?.id) return [];
    return [
      { href: `/dashboard/${user.id}`, icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { href: `/dashboard/${user.id}/channel`, icon: Rss, label: 'Channels', exact: false },
      { href: `/dashboard/${user.id}/apikey`, icon: KeyRound, label: 'API Keys', exact: false },
    ];
  }, [user?.id]);

  if (isLoading || !user || !token) {
    return <LoadingSkeleton />;
  }
  
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { user, token, params });
    }
    return child;
  });
  
  const getPageTitle = () => {
    const currentPath = pathname.split('?')[0];
    const activeItem = navItems.find(item => currentPath.startsWith(item.href) && item.href !== `/dashboard/${user.id}`);
    
    if (pathname.includes('/channel/')) {
        // Check if it's the main channel list or a specific channel
        const pathSegments = pathname.split('/');
        if (pathSegments.length > 4 && pathSegments[4] !== '') {
             return "Channel Details";
        }
       return "Channels";
    }
    return activeItem?.label || 'Dashboard';
  }

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                 <Link href={`/dashboard/${user.id}`}>
                    <Logo />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                             <Link href={item.href} className="w-full">
                                <SidebarMenuButton
                                    isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                                    tooltip={{ children: item.label }}
                                >
                                    <item.icon />
                                    {item.label}
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
             <SidebarFooter>
                <UserMenu user={user} />
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                <SidebarTrigger />
                <h1 className="font-semibold text-lg capitalize">{getPageTitle()}</h1>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
                {childrenWithProps}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
