
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, redirect } from 'next/navigation';
import {
  LayoutDashboard,
  KeyRound,
  Rss,
  PanelLeft,
  Search,
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
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { logout } from '@/lib/actions';
import type { User } from '@/types';
import { USER_DETAILS_COOKIE_NAME, AUTH_TOKEN_COOKIE_NAME } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

function NavLink({ href, icon: Icon, label, isActive }: { href: string; icon: React.ElementType; label: string, isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
        isActive ? 'text-primary bg-muted' : 'text-muted-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function UserMenu({ user }: { user: User }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
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

// Helper function to get a cookie by name
const getCookie = (name: string): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
};


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const pathname = usePathname();

  React.useEffect(() => {
    const userCookie = getCookie(USER_DETAILS_COOKIE_NAME);
    const tokenCookie = getCookie(AUTH_TOKEN_COOKIE_NAME);

    if (userCookie && tokenCookie) {
        try {
            const parsedUser = JSON.parse(decodeURIComponent(userCookie));
            setUser(parsedUser);
            setToken(tokenCookie);
        } catch (e) {
            console.error("Failed to parse user cookie:", e);
            // This case is handled by the middleware, but as a fallback:
            setUser(null);
            setToken(undefined);
        }
    }
    // No 'else' needed as middleware handles redirection for unauthenticated users.
    setIsLoading(false);
  }, []);

  const navItems = React.useMemo(() => {
    if (!user?.id) return [];
    return [
      { href: `/dashboard/${user.id}`, icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/channels', icon: Rss, label: 'Channels' },
      { href: '/api-keys', icon: KeyRound, label: 'API Keys' },
    ];
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:block p-4 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                <div className="w-full flex-1">
                    <Skeleton className="h-8 w-1/2" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </main>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    // This state should ideally not be reached due to middleware.
    // Returning a loader or null is better than attempting to render a broken layout.
    return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href={`/dashboard/${user.id}`}>
              <Logo />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map((item) => (
                    <NavLink key={item.href} {...item} isActive={pathname.startsWith(item.href)} />
                ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Logo />
                </Link>
                {navItems.map((item) => (
                    <NavLink key={item.href} {...item} isActive={pathname.startsWith(item.href)} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <UserMenu user={user} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
          {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                // @ts-ignore
                return React.cloneElement(child, { user, token });
              }
              return child;
          })}
        </main>
      </div>
    </div>
  );
}
