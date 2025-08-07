
'use server';

import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user || !session?.token) {
    return redirect('/login');
  }
  
  const user = session.user;
  const userInitials = user.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card px-4 shadow-sm md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href={`/dashboard/${user._id}`} className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Logo className="h-6 w-6" />
            <span className="sr-only">RSensorGrid</span>
          </Link>
          <Link href={`/dashboard/${user._id}`} className="text-foreground transition-colors hover:text-foreground whitespace-nowrap">
            Dashboard
          </Link>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap">
            Channels
          </Link>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap">
            API Docs
          </Link>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap">
            Support
          </Link>
        </nav>
        {/* Mobile menu can be added here later */}
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className='ml-auto'>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>API Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
