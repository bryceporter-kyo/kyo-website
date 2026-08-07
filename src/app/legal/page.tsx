import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageById } from "@/lib/image-service-server";
import { FileText, Shield, UserCheck, Accessibility, Info, Gavel, Scale, ExternalLink as ExternalLinkIcon, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fetchLegalPages } from "@/lib/legal-pages";
import { fetchLegalDocuments } from "@/lib/legal-documents";

const getIconForSlug = (slug: string) => {
  switch (slug) {
    case 'privacy-policy': return Shield;
    case 'terms-of-use': return Gavel;
    case 'terms-and-conditions': return Scale;
    case 'accessibility-policy': return Accessibility;
    case 'hiring-policy': return UserCheck;
    case 'information-accuracy-policy': return Info;
    default: return FileText;
  }
};

export default async function LegalIndexPage() {
  const headerImage = await getImageById('page-header-terms');
  
  // Dynamic fetches loaded server-side for complete SEO indexing
  const [managedPages, documents] = await Promise.all([
    fetchLegalPages(),
    fetchLegalDocuments()
  ]);

  const policies = managedPages.map(page => ({
    title: page.title,
    description: page.content.substring(0, 100).replace(/[#*`]/g, '') + '...',
    href: `/legal/${page.slug}`,
    icon: getIconForSlug(page.slug),
    lastUpdated: page.lastUpdated,
  }));

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="Legal & Policies"
        subtitle="The official legal documents and policies of the Kawartha Youth Orchestra."
        image={headerImage || undefined}
      />
      
      <section className="container mx-auto px-4 mt-12">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Policies Grid */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-headline mb-2 text-slate-800">Operational Policies</h2>
              <p className="text-muted-foreground text-sm">Rules and guidelines governing program participation and site usage.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.length === 0 ? (
                <Card className="col-span-full py-12 border-dashed flex flex-col items-center justify-center text-center">
                  <FileText className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-muted-foreground font-light">No policies found. Set them up in the admin console!</p>
                </Card>
              ) : (
                policies.map((policy) => (
                  <Link key={policy.href} href={policy.href} className="group">
                    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 group-hover:border-primary/50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                              <policy.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-1 rounded-md">
                                <Calendar className="w-3 h-3" />
                                {policy.lastUpdated ? format(new Date(policy.lastUpdated), "MMM d, yyyy") : "N/A"}
                            </div>
                        </div>
                        <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">
                          {policy.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-2 line-clamp-2">
                          {policy.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="text-sm font-medium text-primary inline-flex items-center group-hover:underline">
                          Read Policy
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-1 w-4 h-4"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
          
          {/* Governance Documents Section */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-headline mb-2 text-slate-800">Corporate Governance</h2>
              <p className="text-muted-foreground text-sm">
                Access our foundational organizational bylaws and compliance manuals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documents.length === 0 ? (
                <Card className="col-span-full py-12 border-dashed flex flex-col items-center justify-center text-center">
                  <FileText className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-muted-foreground font-light">No governance documents uploaded yet.</p>
                </Card>
              ) : (
                documents.map((docItem) => (
                  <Link key={docItem.id} href={docItem.url} target="_blank" rel="noopener noreferrer" className="group">
                      <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 group-hover:border-primary/50">
                        <CardHeader>
                          <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                            <FileText className="w-6 h-6" />
                          </div>
                          <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">
                            {docItem.name}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground mt-2">
                            {docItem.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <span className="text-sm font-medium text-primary inline-flex items-center group-hover:underline">
                            Download PDF
                            <ExternalLinkIcon className="ml-1 w-4 h-4" />
                          </span>
                        </CardContent>
                      </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
          
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-8 text-center">
              <h3 className="font-headline text-lg mb-2">Need assistance or have questions?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                If you have questions about any of our policies or need clarification on specific terms, please reach out to our administration team.
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Contact Administration
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
