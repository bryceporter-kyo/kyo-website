import { fetchPageMetadataServer } from "@/lib/metadata-server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPageMetadataServer("/programs/orchestras");
  
  const title = data?.title || "The Orchestras | Kawartha Youth Orchestra";
  const description = data?.description || "Explore KYO's tiered orchestral ensemble programs for beginner, intermediate, and advanced youth musicians in Peterborough and the Kawarthas.";
  const ogDescription = data?.ogDescription || description;

  return {
    title,
    description,
    keywords: data?.keywords ? data.keywords.split(',').map(k => k.trim()) : ['youth orchestra ensembles', 'Peterborough youth orchestra', 'symphony training', 'orchestral music education'],
    robots: {
      index: data?.index ?? true,
      follow: data?.follow ?? true,
    },
    openGraph: {
      title,
      description: ogDescription,
      url: 'https://kyo.ca/programs/orchestras',
      siteName: 'Kawartha Youth Orchestra',
      images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'KYO Orchestras' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/og-default.jpg'],
    },
    alternates: {
      canonical: 'https://kyo.ca/programs/orchestras',
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
