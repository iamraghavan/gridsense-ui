
'use server';

import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { UserNav } from './_components/user-nav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user || !session?.token) {
    return redirect('/login');
  }
  
  const user = session.user;

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
          <Link href={`/dashboard/${user._id}/channel`} className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap">
            Channels
          </Link>
          <Link href={`/dashboard/${user._id}/apikey`} className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap">
            API Docs
          </Link>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap">
            Support
          </Link>
        </nav>
        {/* Mobile menu can be added here later */}
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className='ml-auto flex items-center gap-4'>
                 <UserNav user={user} />
            </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
