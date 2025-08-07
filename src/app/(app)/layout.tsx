'use server';

import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

// This layout will wrap all pages that require authentication.
// It ensures that a valid session exists, otherwise it redirects to login.
// It fetches user and token data and makes it available to its children.

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user || !session?.token) {
    // This should not happen if middleware is set up correctly, but as a safeguard.
    return redirect('/login');
  }

  // We are not creating a full-blown context provider here for simplicity.
  // Instead, we can pass the user and token down to child server components
  // or have client components fetch them as needed.
  // For the dashboard, we will pass them down through page props.
  // A more robust solution for larger apps might use React Context.

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {/* We can add a sidebar or a top navigation bar here later */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
        </main>
    </div>
  );
}
