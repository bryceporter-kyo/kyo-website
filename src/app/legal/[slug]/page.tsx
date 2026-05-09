
import { fetchLegalPageBySlug } from "@/lib/legal-pages";
import { notFound } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { getImageById } from "@/lib/image-service-server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Metadata } from "next";
import { cn } from "@/lib/utils";

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
        image={headerImage || undefined}
      />
      <section className="container mx-auto px-4 mt-12 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {page.content.split(/(?=^#{1,2} )/m).map((section, index) => {
            if (!section.trim()) return null;
            
            // Try to extract a title from the first line if it's a heading
            const lines = section.trim().split('\n');
            const firstLine = lines[0];
            const isHeading = /^#{1,2} /.test(firstLine);
            const title = isHeading ? firstLine.replace(/^#{1,2} /, '') : null;
            const content = isHeading ? lines.slice(1).join('\n') : section;

            return (
              <Card key={index} className="overflow-hidden border-primary/10 shadow-sm">
                {title && (
                  <CardHeader className="bg-muted/30 border-b border-primary/5">
                    <CardTitle className="font-headline text-2xl text-primary">{title}</CardTitle>
                  </CardHeader>
                )}
                <CardContent className={cn(
                  "prose prose-slate max-w-none dark:prose-invert prose-headings:font-headline prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground",
                  title ? "pt-6" : "pt-8"
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                  
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    Last updated: {format(new Date(page.lastUpdated), "MMMM d, yyyy")}
                  </div>
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Calendar className="w-3 h-3" />Last updated: October 26, 2023</div></CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
