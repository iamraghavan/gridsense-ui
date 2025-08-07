
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
  Book,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const USER_CACHE_KEY = 'rsg_user';
const TOKEN_CACHE_KEY = 'rsg_token';

function UserMenu({ user, onLogout }: { user: User, onLogout: () => void }) {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/dashboard/${user.id}/apikey`}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Book className="mr-2 h-4 w-4" />
                Docs
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
               </DropdownMenuItem>
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
                    {/* This space is intentionally left blank for the page title skeleton */}
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = React.useCallback(() => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(TOKEN_CACHE_KEY);
    }
    setUser(null);
    setToken(null);
    router.push('/login');
  }, [router]);

  React.useEffect(() => {
    function initializeSession() {
      console.log("AppLayout: Initializing session from localStorage...");
      try {
        const cachedUser = localStorage.getItem(USER_CACHE_KEY);
        const cachedToken = localStorage.getItem(TOKEN_CACHE_KEY);

        if (cachedUser && cachedToken) {
          const parsedUser: User = JSON.parse(cachedUser);
          // Ensure the user object has the 'id' field, which we use consistently client-side.
          if(!parsedUser.id) {
            parsedUser.id = parsedUser._id;
          }
          setUser(parsedUser);
          setToken(cachedToken);
          console.log("AppLayout: Session restored from cache for user:", parsedUser.name);
        } else {
          console.log("AppLayout: No session found in cache. Redirecting to login.");
          handleLogout();
        }
      } catch (e) {
        console.error("AppLayout: Failed to parse cached session, logging out.", e);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    }

    initializeSession();
  }, [handleLogout]);
  
  const navItems = React.useMemo(() => {
    if (!user?.id) return [];
    return [
      { href: `/dashboard/${user.id}`, icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { href: `/dashboard/${user.id}/channel`, icon: Rss, label: 'Channels', exact: false },
      { href: `/dashboard/${user.id}/apikey`, icon: KeyRound, label: 'API Keys', exact: false },
    ];
  }, [user?.id]);
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  const getPageTitle = () => {
    const currentPath = pathname.split('?')[0];
    if (currentPath.includes('/channel/')) {
        return "Channel Details";
    }
    const activeItem = navItems.find(item => {
        return item.exact ? currentPath === item.href : currentPath.startsWith(item.href);
    });
    return activeItem?.label || 'Dashboard';
  }

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { user, token });
    }
    return child;
  });

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                 <Link href={user ? `/dashboard/${user.id}`: '#'}>
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
                {/* This space is intentionally left blank for the user menu in the header */}
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="font-semibold text-lg capitalize">{getPageTitle()}</h1>
                </div>
                {user && <UserMenu user={user} onLogout={handleLogout} />}
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
                {user && token ? childrenWithProps : <p>Loading...</p>}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
