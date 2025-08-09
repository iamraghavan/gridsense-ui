
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Cpu, Gauge, Share2, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MERKE Cloud: Your Real-Time IoT Data Visualization Platform',
  description: 'Welcome to MERKE Cloud. Start building your IoT application with our powerful and easy-to-use data visualization and management tools.',
};


const features = [
  {
    name: 'Real-Time Data Visualization',
    description: 'Instantly visualize data from your IoT devices with our fast and interactive charts. Monitor your systems as events happen.',
    icon: <Gauge className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Secure API & Data Ingestion',
    description: 'Use your secure API key to send data from any device. Our robust backend ensures your data is stored safely and reliably.',
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Scalable IoT Channels',
    description: 'Create and manage multiple data channels for different projects or devices. Our platform scales with your needs.',
    icon: <Share2 className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Powerful API Control',
    description: 'A comprehensive API allows you to not only send data but also manage channels and fetch historical data programmatically.',
    icon: <Cpu className="w-8 h-8 text-primary" />,
  },
];

const team = [
    {
        name: 'John Doe',
        role: 'CEO & Founder',
        bio: 'The visionary leader behind MERKE Cloud, driving the mission to simplify IoT for everyone.',
        imageUrl: 'https://placehold.co/400x400.png',
        aiHint: 'portrait man',
    },
    {
        name: 'Jane Smith',
        role: 'Lead Backend Engineer',
        bio: 'The architect of our robust and scalable infrastructure, ensuring your data is always safe and accessible.',
        imageUrl: 'https://placehold.co/400x400.png',
        aiHint: 'portrait woman',
    },
    {
        name: 'Alex Johnson',
        role: 'Lead Frontend Developer',
        bio: 'The creative mind behind our intuitive user interface, making complex data visualization feel effortless.',
        imageUrl: 'https://placehold.co/400x400.png',
        aiHint: 'portrait person',
    },
];

function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Logo className="h-8 w-auto text-primary" />
            <span className="text-xl font-bold">MERKE Cloud</span>
          </Link>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
           <a href="#features" className="text-sm font-semibold leading-6 text-foreground">
            Features
          </a>
          <a href="#about" className="text-sm font-semibold leading-6 text-foreground">
            About Us
          </a>
           <a href="#team" className="text-sm font-semibold leading-6 text-foreground">
            Our Team
          </a>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-4">
          <Button asChild variant="ghost">
             <Link href="/login">Log in <span aria-hidden="true">&rarr;</span></Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}

function HeroSection() {
    return (
        <div className="relative isolate px-6 pt-14 lg:px-8">
             <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3399FF] to-[#6666B2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
            </div>
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                    Real-time IoT data, simplified.
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    MERKE Cloud provides the tools to securely ingest, manage, and visualize your sensor data in real-time. Focus on your project, not the infrastructure.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Button asChild size="lg">
                        <Link href="/register">Get Started</Link>
                    </Button>
                    <Button asChild variant="link" size="lg">
                        <Link href="#features">Learn more <span aria-hidden="true">→</span></Link>
                    </Button>
                </div>
                </div>
            </div>
        </div>
    )
}

function AboutSection() {
    return (
        <div id="about" className="py-24 sm:py-32 bg-card border-t border-b">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <div>
                        <div className="text-base leading-7 text-muted-foreground lg:max-w-lg">
                            <p className="text-base font-semibold leading-7 text-primary">About MERKE Cloud</p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Built for Developers & Innovators
                            </h1>
                            <div className="max-w-xl">
                                <p className="mt-6">
                                    At MERKE Cloud, we believe that the power of IoT should be accessible to everyone, from individual hobbyists to large-scale enterprises. Our mission is to provide a robust, scalable, and user-friendly platform that removes the complexity of IoT data management.
                                </p>
                                <p className="mt-8">
                                    We handle the infrastructure—secure data ingestion, real-time processing, and reliable storage—so you can focus on what truly matters: building innovative products and gaining valuable insights from your data.
                                </p>
                            </div>
                        </div>
                    </div>
                     <div className="lg:pr-4">
                        <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted shadow-2xl">
                            <img className="absolute inset-0 h-full w-full object-cover" src="https://assets.grok.com/anon-users/0148fcfb-c5d0-480a-97fb-d36a58b12f84/generated/3d0809f7-4750-4406-94a2-57bfc8184151/image.jpg" alt="" data-ai-hint="smart home" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TeamSection() {
    return (
        <div id="team" className="py-24 sm:py-32">
            <div className="container mx-auto px-6 lg:px-8">
                 <div className="mx-auto max-w-2xl lg:text-center">
                    <p className="text-base font-semibold leading-7 text-primary">Our Team</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        The People Behind the Platform
                    </h1>
                     <p className="mt-6 text-lg leading-8 text-muted-foreground">
                       Meet the passionate individuals who are dedicated to making MERKE Cloud the best IoT platform for developers.
                    </p>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 lg:mx-0 lg:max-w-5xl lg:grid-cols-3">
                    {team.map((person) => (
                        <div key={person.name} className="flex flex-col items-center text-center">
                            <img className="h-48 w-48 rounded-full object-cover shadow-lg" src={person.imageUrl} alt={person.name} data-ai-hint={person.aiHint} />
                            <h3 className="mt-6 text-xl font-semibold leading-7 tracking-tight text-foreground">{person.name}</h3>
                            <p className="text-sm font-semibold leading-6 text-primary">{person.role}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{person.bio}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


function FeaturesSection() {
  return (
    <div id="features" className="py-24 sm:py-32 bg-card border-t border-b">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Your Data, Your Rules</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to manage your IoT platform
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            From secure data ingestion to powerful visualization tools, MERKE Cloud is designed to be flexible and dev-friendly.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}


function Footer() {
    const currentYear = new Date().getFullYear();
    const leftLinks = ['Terms and Condition', 'Privacy Notice', 'Site Terms', 'Cookie Policy'];
    const rightLinks = ['API Docs', 'Security', 'Accessibility', 'Support', 'Sitemap'];

    return (
         <footer className="bg-card border-t">
            <div className="container mx-auto px-6 py-8 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mb-4 md:mb-0">
                         {leftLinks.map(link => <Link key={link} href="#" className="hover:text-primary">{link}</Link>)}
                    </div>
                     <div className="order-first md:order-none mb-4 md:mb-0">
                         <p>&copy; {currentYear} MERKE Team. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
                        {rightLinks.map(link => <Link key={link} href="#" className="hover:text-primary">{link}</Link>)}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default function Home() {
  return (
    <div className="bg-background font-headline">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <TeamSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
