import { fetchPageMetadataServer } from "@/lib/metadata-server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPageMetadataServer("/support-us/ways-to-give");
  
  const title = data?.title || "Ways to Give & Support | Kawartha Youth Orchestra";
  const description = data?.description || "Explore all ways to support Kawartha Youth Orchestra, including individual donations, corporate sponsorships, planned giving, and instrument donations.";
  const ogDescription = data?.ogDescription || description;

  return {
    title,
    description,
    keywords: data?.keywords ? data.keywords.split(',').map(k => k.trim()) : ['support youth orchestra', 'donate to music non-profit', 'corporate sponsorship Peterborough', 'instrument donation'],
    robots: {
      index: data?.index ?? true,
      follow: data?.follow ?? true,
    },
    openGraph: {
      title,
      description: ogDescription,
      url: 'https://kyo.ca/support-us/ways-to-give',
      siteName: 'Kawartha Youth Orchestra',
      images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Ways to Give | KYO' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/og-default.jpg'],
    },
    alternates: {
      canonical: 'https://kyo.ca/support-us/ways-to-give',
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
