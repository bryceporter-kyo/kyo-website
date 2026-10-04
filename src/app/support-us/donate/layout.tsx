import { fetchPageMetadataServer } from "@/lib/metadata-server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPageMetadataServer("/support-us/donate");
  
  const title = data?.title || "Donate to Kawartha Youth Orchestra | Tax-Deductible Giving";
  const description = data?.description || "Make a secure, tax-deductible donation to Kawartha Youth Orchestra. Every gift directly provides bursaries, instruments, and music education to children in need.";
  const ogDescription = data?.ogDescription || description;

  return {
    title,
    description,
    keywords: data?.keywords ? data.keywords.split(',').map(k => k.trim()) : ['donate KYO', 'music charity donation Ontario', 'Peterborough arts donation', 'bursary fund youth orchestra'],
    robots: {
      index: data?.index ?? true,
      follow: data?.follow ?? true,
    },
    openGraph: {
      title,
      description: ogDescription,
      url: 'https://kyo.ca/support-us/donate',
      siteName: 'Kawartha Youth Orchestra',
      images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Donate to Kawartha Youth Orchestra' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/og-default.jpg'],
    },
    alternates: {
      canonical: 'https://kyo.ca/support-us/donate',
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
