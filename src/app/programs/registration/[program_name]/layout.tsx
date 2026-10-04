import { Metadata } from "next";

interface Props {
  params: Promise<{
    program_name: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata(props: { params: Promise<{ program_name: string }> }): Promise<Metadata> {
  const { program_name } = await props.params;
  const displayName = program_name === "upbeat" ? "Upbeat! Program" : program_name === "orchestras" ? "Orchestras" : program_name;
  const title = `Register for ${displayName} | Kawartha Youth Orchestra`;
  const description = `Online registration form for Kawartha Youth Orchestra's ${displayName}. Secure your spot for the upcoming season.`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `https://kyo.ca/programs/registration/${program_name}`,
      siteName: 'Kawartha Youth Orchestra',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://kyo.ca/programs/registration/${program_name}`,
    },
  };
}

export default function Layout({ children }: Props) {
  return <>{children}</>;
}
