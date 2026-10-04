
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from '@/components/shared/CookieConsent';
import Analytics from '@/components/shared/Analytics';
import { Suspense } from 'react';
import AnnouncementPopup from '@/components/shared/AnnouncementPopup';
import { ImageProvider } from '@/components/providers/ImageProvider';
import { DataProvider } from '@/components/providers/DataProvider';
import { fetchPageMetadataServer } from '@/lib/metadata-server';
import { Metadata } from 'next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { OrganizationJsonLd } from '@/components/shared/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPageMetadataServer("/");
  
  const title = data?.title || "Kawartha Youth Orchestra | Music Education & Performance in Peterborough";
  const description = data?.description || "Nurturing the next generation of musicians in the Kawarthas through orchestral ensembles, the subsidized Upbeat! after-school program, and private music lessons.";
  const ogDescription = data?.ogDescription || description;

  return {
    metadataBase: new URL('https://kyo.ca'),
    title: {
      default: title,
      template: "%s | Kawartha Youth Orchestra",
    },
    description,
    keywords: data?.keywords ? data.keywords.split(',').map(k => k.trim()) : ['youth orchestra', 'music lessons', 'Peterborough', 'Kawartha Youth Orchestra', 'Upbeat program', 'classical music', 'youth music education'],
    robots: {
      index: data?.index ?? true,
      follow: data?.follow ?? true,
    },
    openGraph: {
      title,
      description: ogDescription,
      url: 'https://kyo.ca',
      siteName: 'Kawartha Youth Orchestra',
      images: [
        {
          url: '/og-default.jpg',
          width: 1200,
          height: 630,
          alt: 'Kawartha Youth Orchestra',
        },
      ],
      locale: 'en_CA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/og-default.jpg'],
    },
    alternates: {
      canonical: 'https://kyo.ca',
    },
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
        <OrganizationJsonLd />
      </head>
      <body 
        className={cn('font-body antialiased', 'min-h-screen bg-background')}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <VercelAnalytics />
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
            <AnnouncementPopup />
            <SpeedInsights />
          </ImageProvider>
        </DataProvider>
      </body>
    </html>
  );
}
