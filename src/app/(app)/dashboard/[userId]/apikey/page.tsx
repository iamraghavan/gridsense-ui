import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ApiKeyClient } from './_components/api-key-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'API Key Management',
    description: 'View and manage your API keys for RSensorGrid.',
  };
}

export default async function ApiKeyPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return <ApiKeyClient apiKey={session.user.apiKey} />;
}
