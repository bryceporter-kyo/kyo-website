
import { fetchLegalPageBySlug } from "@/lib/legal-pages";
import { notFound } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageById } from "@/lib/image-service-server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Metadata } from "next";

interface LegalPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const page = await fetchLegalPageBySlug(params.slug);
  
  if (!page) return { title: "Not Found" };

  return {
    title: `${page.title} | Kawartha Youth Orchestra`,
    description: page.content.substring(0, 160).replace(/[#*`]/g, ''),
    robots: {
      index: page.index,
      follow: page.follow,
    },
    other: page.ageMetadata ? {
      "age-metadata": page.ageMetadata
    } : undefined
  };
}

export default async function DynamicLegalPage({ params }: LegalPageProps) {
  const { slug } = params;
  const page = await fetchLegalPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const headerImage = await getImageById(page.headerImageId || 'page-header-terms');

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title={page.title}
        subtitle={`Last updated: ${format(new Date(page.lastUpdated), "MMMM d, yyyy")}`}
        image={headerImage}
      />
      <section className="container mx-auto px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-8 prose prose-slate max-w-none dark:prose-invert prose-headings:font-headline prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {page.content}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
