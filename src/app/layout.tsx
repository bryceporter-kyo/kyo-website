
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from '@/components/shared/CookieConsent';
import Analytics from '@/components/shared/Analytics';
import { ImageProvider } from '@/components/providers/ImageProvider';
import { DataProvider } from '@/components/providers/DataProvider';
import { fetchPageMetadata } from '@/lib/metadata';
import { Metadata } from 'next';
import { SpeedInsights } from "@vercel/speed-insights/next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPageMetadata("/");
  
  if (!data) {
    return {
      title: "Kawartha Youth Orchestra",
      description: "Nurturing the next generation of musicians.",
    };
  }

  return {
    title: data.title,
    description: data.description,
    robots: {
      index: data.index,
      follow: data.follow,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body 
        className={cn('font-body antialiased', 'min-h-screen bg-background')}
        suppressHydrationWarning
      >
        <Analytics />
        <DataProvider>
          <ImageProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
            <CookieConsent />
            <SpeedInsights />
          </ImageProvider>
        </DataProvider>
      </body>
    </html>
  );
}
