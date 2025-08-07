
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { getUserFromCache, saveUserToCache } from '@/lib/user-cache';

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
  const searchParams = useSearchParams();

  React.useEffect(() => {
    async function initializeSession() {
      console.log("AppLayout: Initializing session...");
      
      // Step 1: Check for user data in URL params (from login/register)
      const userParam = searchParams.get('user');
      if (userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          console.log("AppLayout: Found user data in URL. Caching and setting user.", userData);
          saveUserToCache(userData); // Cache it
          setUser(userData);
          // Clean the URL
          router.replace(pathname, { scroll: false });
          return; // Session is initialized
        } catch (e) {
          console.error("AppLayout: Failed to parse user from URL", e);
        }
      }

      // Step 2: If no URL param, try loading from cache
      const cachedUser = getUserFromCache();
      if (cachedUser) {
        console.log("AppLayout: Found user in cache.", cachedUser);
        setUser(cachedUser);
        return; // Session is initialized
      }

      // Step 3: If no cache, fetch from the BFF as a last resort
      console.log("AppLayout: No user in cache or URL, fetching from /api/auth/me...");
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          console.error("AppLayout: Auth failed from API, logging out...");
          await logout();
          return;
        }
        const data = await res.json();
        console.log("AppLayout: User data fetched successfully from API:", data);
        if (data.user && data.token) {
            setUser(data.user);
            setToken(data.token);
            saveUserToCache(data.user); // Cache the fresh data
        } else {
            console.error("AppLayout: User or token missing in API response, logging out.", data);
            await logout();
        }
      } catch (error) {
        console.error("AppLayout: Failed to fetch user from API, logging out.", error);
        await logout();
      }
    }

    initializeSession();
  }, [pathname, router, searchParams]);
  
  React.useEffect(() => {
    // This effect now only handles the loading state
    if (user) {
      console.log("AppLayout: User object is available. Finished loading.");
      setIsLoading(false);
    }
  }, [user]);

  const navItems = React.useMemo(() => {
    if (!user?.id) return [];
    return [
      { href: `/dashboard/${user.id}`, icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { href: `/dashboard/${user.id}/channel`, icon: Rss, label: 'Channels', exact: false },
      { href: `/dashboard/${user.id}/apikey`, icon: KeyRound, label: 'API Keys', exact: false },
    ];
  }, [user?.id]);
  
  if (isLoading || !user) {
    return <LoadingSkeleton />;
  }
  
  // The token is primarily handled by the BFF now, but we get it for client-side services.
  // We need to fetch it separately or cache it if it's not available. For simplicity,
  // we'll fetch it here if not available, but a more robust solution might cache it too.
  if (!token) {
    fetch('/api/auth/me').then(res => res.json()).then(data => setToken(data.token));
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
