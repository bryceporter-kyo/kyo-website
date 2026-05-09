import { fetchPageMetadata } from "@/lib/metadata";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPageMetadata('/programs/upbeat');
  
  if (!data) {
    return {
      title: "Upbeat | Kawartha Youth Orchestra",
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
