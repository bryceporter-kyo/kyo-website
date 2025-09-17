import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function TermsOfUsePage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-terms');

  return (
    <div>
      <PageHeader
        title="Digital Terms of Use"
        subtitle="Last updated: October 26, 2023"
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Agreement to Terms</CardTitle>
            <CardDescription>
              By accessing and using our website, you agree to be bound by these Terms of Use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-bold text-lg font-headline">1. Use of Website</h3>
            <p className="text-muted-foreground">
              This website is provided for your personal and non-commercial use. You agree not to use this site for any unlawful purpose or in a way that could impair the performance, corrupt the content, or otherwise reduce the overall functionality of the website.
            </p>
            <h3 className="font-bold text-lg font-headline">2. Intellectual Property</h3>
            <p className="text-muted-foreground">
              All content, including text, graphics, logos, and images, is the property of KYO Hub and is protected by copyright laws. Unauthorized use, reproduction, or distribution of any material is strictly prohibited.
            </p>
            <h3 className="font-bold text-lg font-headline">3. Limitation of Liability</h3>
            <p className="text-muted-foreground">
             KYO Hub will not be liable for any indirect, incidental, or consequential damages arising out of the use of this website. We strive to keep the information on our website accurate and up-to-date, but we make no guarantees of its completeness or correctness.
            </p>
            <h3 className="font-bold text-lg font-headline">4. Links to Third-Party Websites</h3>
            <p className="text-muted-foreground">
              Our website may contain links to third-party websites. These links are provided for your convenience only. We have no control over the content of these websites and assume no responsibility for them.
            </p>
             <h3 className="font-bold text-lg font-headline">5. Changes to Terms</h3>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms of Use at any time. We will notify you of any changes by posting the new terms on this page. Your continued use of the website after such changes constitutes your acceptance of the new terms.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
