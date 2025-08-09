import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BodyWithHydrationSuppression } from '@/components/body-with-hydration-suppression';
import { Inter, Poppins, Source_Code_Pro } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    template: '%s | MERKE Cloud',
    default: 'MERKE Cloud - Real-Time IoT Data Platform',
  },
  description: 'Monitor, manage, and visualize your IoT sensor data in real-time. MERKE Cloud is the scalable solution for your IoT projects.',
  keywords: ['IoT', 'Sensor Data', 'Real-Time', 'Dashboard', 'Data Visualization', 'MQTT', 'API'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sourceCodePro.variable} ${poppins.variable}`}>
      <BodyWithHydrationSuppression>
        {children}
        <Toaster />
      </BodyWithHydrationSuppression>
    </html>
  );
}
