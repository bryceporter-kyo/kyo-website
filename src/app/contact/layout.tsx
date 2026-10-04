import { fetchPageMetadataServer } from "@/lib/metadata-server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPageMetadataServer("/contact");
  
  const title = data?.title || "Contact Us | Kawartha Youth Orchestra";
  const description = data?.description || "Get in touch with the Kawartha Youth Orchestra. Connect with our artistic directors, administration, and program coordinators.";
  const ogDescription = data?.ogDescription || description;

  return {
    title,
    description,
    keywords: data?.keywords ? data.keywords.split(',').map(k => k.trim()) : ['contact KYO', 'Kawartha Youth Orchestra email', 'Peterborough music contacts'],
    robots: {
      index: data?.index ?? true,
      follow: data?.follow ?? true,
    },
    openGraph: {
      title,
      description: ogDescription,
      url: 'https://kyo.ca/contact',
      siteName: 'Kawartha Youth Orchestra',
      images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Contact Kawartha Youth Orchestra' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/og-default.jpg'],
    },
    alternates: {
      canonical: 'https://kyo.ca/contact',
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
