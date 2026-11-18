import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchAllGrants, getGrantsSettings } from "@/lib/grants/grants-service";
import { Grant } from "@/lib/grants/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, Building2, Calendar, DollarSign } from "lucide-react";

interface Props {
  params: Promise<{
    uid: string;
    year: string;
    funder: string;
    program?: string;
  }>;
}

// Spec §12: noindex, follow on every generated grant proposal page
export const metadata: Metadata = {
  title: "Case for Support Proposal — Kawartha Youth Orchestra",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function PublicGrantCaseForSupportPage(props: Props) {
  const { uid, year, funder, program } = await props.params;

  const allGrants = await fetchAllGrants();

  // Find matching published grant by year and funder slug (and optional program slug)
  const grant = allGrants.find((g) => {
    if (!g.published) return false;
    const grantYear = new Date(g.startedAt || g.createdAt || Date.now()).getFullYear().toString();
    const yearMatch = grantYear === year;
    const slugMatch = g.slug === funder;
    const progMatch = program ? g.programSlug === program : true;
    return yearMatch && slugMatch && progMatch;
  });

  if (!grant) {
    notFound();
  }

  const visibleQuestions = (grant.questions || []).filter(q => q.publicVisible !== false);

  return (
    <div className="min-h-screen bg-background">
      {/* Proposal Banner */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 max-w-4xl space-y-4">
          <Badge className="bg-primary text-white font-bold text-xs gap-1">
            <Sparkles className="w-3 h-3" /> Funding Proposal ({year})
          </Badge>

          <h1 className="text-3xl md:text-5xl font-bold font-headline text-foreground tracking-tight">
            Case for Support: {grant.funderName}
          </h1>

          <p className="text-muted-foreground text-base md:text-lg">
            Prepared by the Kawartha Youth Orchestra in support of <strong>{grant.programName}</strong>.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
            {grant.amountRequested ? (
              <span className="flex items-center gap-1.5 p-2 rounded-lg bg-card border">
                <DollarSign className="w-4 h-4 text-primary" />
                Requested: ${(grant.amountRequested).toLocaleString()}
              </span>
            ) : null}

            {grant.kyoPrograms && grant.kyoPrograms.length > 0 && (
              <span className="flex items-center gap-1.5 p-2 rounded-lg bg-card border">
                <Building2 className="w-4 h-4 text-primary" />
                Programs: {grant.kyoPrograms.join(", ")}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Q&A Document Rendering */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Application Questions &amp; Objectives</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Official application answers prepared for this grant cycle.
            </p>
          </div>

          <div className="space-y-6">
            {visibleQuestions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  Proposal answers are currently in review.
                </CardContent>
              </Card>
            ) : (
              visibleQuestions.map((q, idx) => (
                <Card key={q.id || idx} className="border border-border/80 shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-3">
                    <CardTitle className="text-base font-bold font-headline text-foreground">
                      {idx + 1}. {q.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {q.answerHtml || <em className="text-muted-foreground">Answer pending.</em>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
