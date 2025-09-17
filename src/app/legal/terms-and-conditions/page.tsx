import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function TermsAndConditionsPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-conditions');

  return (
    <div>
      <PageHeader
        title="Terms & Conditions"
        subtitle="Last updated: October 26, 2023"
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Program & Service Conditions</CardTitle>
            <CardDescription>
              These terms govern your participation in our programs and use of our services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-bold text-lg font-headline">1. Registration and Payment</h3>
            <p className="text-muted-foreground">
              By registering for a program, you agree to pay all applicable fees by the specified deadlines. Financial aid and payment plans may be available and are subject to a separate application process and approval.
            </p>
            <h3 className="font-bold text-lg font-headline">2. Code of Conduct</h3>
            <p className="text-muted-foreground">
              All students, parents, and guardians are expected to adhere to our code of conduct, which promotes a respectful, inclusive, and safe environment. Failure to comply may result in dismissal from the program without a refund.
            </p>
            <h3 className="font-bold text-lg font-headline">3. Cancellations and Refunds</h3>
            <p className="text-muted-foreground">
             Our cancellation and refund policy varies by program. Please refer to the specific program details for information on deadlines and refund eligibility. In general, processing fees are non-refundable.
            </p>
            <h3 className="font-bold text-lg font-headline">4. Media Release</h3>
            <p className="text-muted-foreground">
              By participating in our programs, you grant KYO Hub permission to use photographs and videos of students in promotional materials, including our website, social media, and print publications, without compensation.
            </p>
            <h3 className="font-bold text-lg font-headline">5. Liability</h3>
            <p className="text-muted-foreground">
             While we prioritize safety, participation in our programs involves inherent risks. You agree to release and hold harmless KYO Hub, its staff, and its volunteers from any and all liability for injuries or damages sustained during program activities.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
