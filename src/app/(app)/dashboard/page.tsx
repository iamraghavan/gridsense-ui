
'use client';
import { redirect } from 'next/navigation';

export default function DashboardRedirectPage() {
  // This component is a placeholder to handle the redirect logic
  // which is now managed in the middleware.
  // If a user somehow lands here, we'll try to redirect them,
  // but the middleware should prevent this from happening.
  redirect('/login');
  return null;
}
