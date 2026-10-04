import { fetchPageMetadataServer } from "@/lib/metadata-server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPageMetadataServer("/programs/lessons");
  
  const title = data?.title || "Instrumental Music Lessons | Kawartha Youth Orchestra";
  const description = data?.description || "High-quality private and group instrumental music lessons for violin, viola, cello, bass, flute, clarinet, brass, and percussion in Peterborough.";
  const ogDescription = data?.ogDescription || description;

  return {
    title,
    description,
    keywords: data?.keywords ? data.keywords.split(',').map(k => k.trim()) : ['music lessons Peterborough', 'violin lessons Kawartha', 'cello lessons', 'private orchestra lessons'],
    robots: {
      index: data?.index ?? true,
      follow: data?.follow ?? true,
    },
    openGraph: {
      title,
      description: ogDescription,
      url: 'https://kyo.ca/programs/lessons',
      siteName: 'Kawartha Youth Orchestra',
      images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'KYO Music Lessons' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/og-default.jpg'],
    },
    alternates: {
      canonical: 'https://kyo.ca/programs/lessons',
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
