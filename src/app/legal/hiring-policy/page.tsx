import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function HiringPolicyPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-hiring');

  return (
    <div>
      <PageHeader
        title="Hiring & EEO Policy"
        subtitle="Committed to a fair and inclusive workplace."
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Equal Employment Opportunity</CardTitle>
            <CardDescription>
             KYO Hub is an equal opportunity employer and is committed to diversity, equity, and inclusion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-bold text-lg font-headline">1. Non-Discrimination</h3>
            <p className="text-muted-foreground">
                KYO Hub provides equal employment opportunities to all employees and applicants for employment without regard to race, color, religion, sex, national origin, age, disability, sexual orientation, gender identity, or any other characteristic protected by applicable federal, provincial, and local laws.
            </p>
            <h3 className="font-bold text-lg font-headline">2. Recruitment and Hiring</h3>
            <p className="text-muted-foreground">
                Our recruitment and hiring processes are designed to be fair and accessible. We actively seek to attract a diverse pool of qualified candidates. All hiring decisions are based on qualifications, merit, and organizational needs.
            </p>
            <h3 className="font-bold text-lg font-headline">3. Reasonable Accommodations</h3>
            <p className="text-muted-foreground">
                We will provide reasonable accommodations for qualified individuals with disabilities during the application process and in employment, in accordance with applicable laws. If you require an accommodation, please let us know.
            </p>
             <h3 className="font-bold text-lg font-headline">4. Reporting Violations</h3>
            <p className="text-muted-foreground">
                We are committed to maintaining a workplace free from discrimination and harassment. If you believe you have experienced or witnessed a violation of this policy, please report it to our leadership team. All reports will be investigated promptly and confidentially.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
