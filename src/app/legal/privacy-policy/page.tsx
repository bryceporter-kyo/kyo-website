import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function PrivacyPolicyPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-privacy');

  return (
    <div>
      <PageHeader
        title="Privacy & Cookie Policy"
        subtitle="Last updated: October 26, 2023"
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Our Commitment to Your Privacy</CardTitle>
            <CardDescription>
              This policy outlines how we collect, use, and protect your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-bold text-lg font-headline">1. Information We Collect</h3>
            <p className="text-muted-foreground">
              We may collect personal information such as your name, email address, phone number, and student information when you register for our programs, make a donation, or subscribe to our newsletter. We also collect non-personal information through cookies to improve your website experience.
            </p>
            <h3 className="font-bold text-lg font-headline">2. How We Use Your Information</h3>
            <p className="text-muted-foreground">
              Your information is used to process registrations, manage donations, communicate with you about our programs and events, and improve our services. We do not sell or share your personal information with third parties for their marketing purposes.
            </p>
            <h3 className="font-bold text-lg font-headline">3. Cookie Policy</h3>
            <p className="text-muted-foreground">
              Our website uses cookies to enhance functionality and analyze site traffic. Cookies are small text files stored on your device. You can control cookie preferences through your browser settings. Disabling cookies may affect your experience on our site.
            </p>
            <h3 className="font-bold text-lg font-headline">4. Data Security</h3>
            <p className="text-muted-foreground">
              We implement a variety of security measures to maintain the safety of your personal information. All sensitive information is transmitted via Secure Socket Layer (SSL) technology and encrypted into our databases.
            </p>
             <h3 className="font-bold text-lg font-headline">5. Your Rights</h3>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal information. If you wish to exercise these rights, please contact us at <a href="mailto:ContactUs@thekyo.ca" className="text-primary underline">ContactUs@thekyo.ca</a>.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
