import { fetchPageMetadataServer } from "@/lib/metadata-server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPageMetadataServer("/legal");
  
  const title = data?.title || "Legal, Policies & Governance | Kawartha Youth Orchestra";
  const description = data?.description || "Review Kawartha Youth Orchestra's governing policies, privacy practices, terms of service, accessibility standards, and child protection guidelines.";
  const ogDescription = data?.ogDescription || description;

  return {
    title,
    description,
    keywords: data?.keywords ? data.keywords.split(',').map(k => k.trim()) : ['KYO policies', 'privacy policy', 'accessibility policy Peterborough', 'child protection music organization'],
    robots: {
      index: data?.index ?? true,
      follow: data?.follow ?? true,
    },
    openGraph: {
      title,
      description: ogDescription,
      url: 'https://kyo.ca/legal',
      siteName: 'Kawartha Youth Orchestra',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
    },
    alternates: {
      canonical: 'https://kyo.ca/legal',
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
