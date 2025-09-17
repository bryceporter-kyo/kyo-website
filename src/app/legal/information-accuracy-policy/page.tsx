
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Information Accuracy and Success Metrics Policy',
  robots: 'noindex, nofollow',
};

export default function InformationAccuracyPolicyPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-accuracy');

  return (
    <div>
      <PageHeader
        title="Information Accuracy & Success Metrics"
        subtitle="Our commitment to transparency and data integrity."
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Information Accuracy and Success Metrics Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            
            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Purpose of Information</h3>
                <p>
                    The Kawartha Youth Orchestra websites (including https://www.kawarthayouthorchestra.org, https://www.thekyo.ca, and https://www.upbeat.com) serve as platforms to showcase our programs, expertise, impact, and the benefits our programs provide to the community. All information, facts, and figures presented on this website are derived from a blend of precise, verifiable data and estimations or extrapolations made in good faith.
                </p>
                <p>
                    In cases where estimated data allows for a broad spectrum of potential outcomes, the Kawartha Youth Orchestra opts to utilize data representative of the 50th percentile. This choice aims to accurately portray a median outcome, assuming a normal distribution of potential results and considering estimated minimum and maximum values. These calculations are strictly intended for demonstration purposes, offering insights into the potential outcomes and achievements the Kawartha Youth Orchestra has been able to affect over the years.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Success Metrics and Demonstrations</h3>
                <p>
                    When presenting success metrics, budget calculations and financial information, or any quantifiable results from client engagements, the Kawartha Youth Orchestra relies on a combination of precise, verifiable data and estimations or extrapolations made in good faith. We may use data that is representative of the 50th percentile to illustrate median outcomes when a wide range of options or possible conclusions could be drawn using estimated data.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Purpose of Demonstrations</h3>
                <p>
                    The success metrics and demonstrations provided on our website are intended for demonstration purposes only. They serve to showcase potential outcomes, impacts, and successes the Kawartha Youth Orchestra has achieved. These demonstrations are not intended to guarantee impact, quality, or future organizational performance.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">No Claims or Warranties</h3>
                <p>
                    The Kawartha Youth Orchestra makes no claims or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is strictly at your own risk.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Limitation of Liability</h3>
                <p>
                    In no event will the Kawartha Youth Orchestra be liable for any loss or damage, including, without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
                p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Accuracy of Information</h3>
                <p>
                    While we endeavour to keep the information up to date and correct, the Kawartha Youth Orchestra makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is, therefore, strictly at your own risk.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Changes to Disclaimer</h3>
                <p>
                    The Kawartha Youth Orchestra reserves the right to update or change this disclaimer at any time without prior notice. It is recommended to check this page periodically for any updates.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Acceptance of Terms</h3>
                <p>
                    By using this website, you agree to accept these terms and conditions in full. If you do not agree with any part of this disclaimer, do not use our website.
                </p>
            </div>

          </CardContent>
        </Card>
      </section>
    </div>
  );
}
