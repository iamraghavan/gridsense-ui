import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BodyWithHydrationSuppression } from '@/components/body-with-hydration-suppression';

export const metadata: Metadata = {
  title: 'New Project',
  description: 'A fresh start.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <BodyWithHydrationSuppression>
        {children}
        <Toaster />
      </BodyWithHydrationSuppression>
    </html>
  );
}
