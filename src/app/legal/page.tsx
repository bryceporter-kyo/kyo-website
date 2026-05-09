
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageById } from "@/lib/image-service-server";
import { FileText, Shield, UserCheck, Accessibility, Info, Gavel, Scale, ExternalLink as ExternalLinkIcon, Briefcase } from "lucide-react";
import Link from "next/link";

import { fetchLegalPages } from "@/lib/legal-pages";

export default async function LegalIndexPage() {
  const headerImage = await getImageById('page-header-terms');
  const managedPages = await fetchLegalPages();

  const staticPolicies = [
    {
      title: "Privacy & Cookie Policy",
      description: "How we collect, use, and protect your personal data.",
      href: "/legal/privacy-policy",
      icon: Shield,
    },
    {
      title: "Terms of Use",
      description: "The rules for using our website and digital services.",
      href: "/legal/terms-of-use",
      icon: Gavel,
    },
    {
      title: "Terms and Conditions",
      description: "Standard legal agreement for program participants.",
      href: "/legal/terms-and-conditions",
      icon: Scale,
    },
    {
      title: "Accessibility Policy",
      description: "Our commitment to ensuring everyone can access KYO.",
      href: "/legal/accessibility-policy",
      icon: Accessibility,
    },
    {
      title: "Hiring Policy",
      description: "Guidelines and procedures for recruitment and employment.",
      href: "/legal/hiring-policy",
      icon: UserCheck,
    },
    {
      title: "Information Accuracy Policy",
      description: "How we ensure the integrity of the data we hold.",
      href: "/legal/information-accuracy-policy",
      icon: Info,
    },
    {
      title: "Protection of Children Policy",
      description: "Safeguarding procedures for children and vulnerable persons.",
      href: "/legal/protection-of-children-and-vulnerable-persons-policy",
      icon: FileText,
    },
  ];

  const policies = [
    ...staticPolicies,
    ...managedPages.map(page => ({
      title: page.title,
      description: page.content.substring(0, 100).replace(/[#*`]/g, '') + '...',
      href: `/legal/${page.slug}`,
      icon: FileText,
    }))
  ];

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="Legal & Policies"
        subtitle="The official legal documents and policies of the Kawartha Youth Orchestra."
        image={headerImage}
      />
      
      <section className="container mx-auto px-4 mt-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy) => (
              <Link key={policy.href} href={policy.href} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 group-hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <policy.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">
                      {policy.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
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
            ))}
          </div>
          
          <div className="mt-16 mb-8 text-center">
            <h2 className="text-2xl font-bold font-headline mb-4">Corporate Governance</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access our foundational organizational documents and governance policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="https://docs.google.com/document/d/1LBWfo3YOSOn7JJvfJiCwGWWTntUW8dAwLoz_Nuetfbk/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 group-hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <FileText className="w-6 h-6" />
                    </div>
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">
                      KYO By-Laws
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                      The foundational rules governing the operation of the Kawartha Youth Orchestra.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm font-medium text-primary inline-flex items-center group-hover:underline">
                      View Google Doc
                      <ExternalLinkIcon className="ml-1 w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
            </Link>

            <Link href="https://drive.google.com/a/thekyo.ca/open?id=1WFsMZhoSSsYpqtrEi8b6juUixMuTuH9Y7LlzvBPxlWY" target="_blank" rel="noopener noreferrer" className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 group-hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">
                      HR Policy Manual
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                      Comprehensive guidelines for human resources and organizational conduct.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm font-medium text-primary inline-flex items-center group-hover:underline">
                      View Google Drive
                      <ExternalLinkIcon className="ml-1 w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
            </Link>
          </div>
          
          <Card className="mt-12 bg-muted/30 border-dashed">
            <CardContent className="py-8 text-center">
              <h3 className="font-headline text-lg mb-2">Need legal assistance or have questions?</h3>
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
