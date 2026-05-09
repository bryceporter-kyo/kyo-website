
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { getImageById } from "@/lib/image-service-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Information Accuracy and Success Metrics Policy',
  robots: 'noindex, nofollow',
};

export default async function InformationAccuracyPolicyPage() {
  const headerImage = await getImageById('page-header-accuracy');

  return (
    <div>
      <PageHeader
        title="Information Accuracy & Success Metrics"
        subtitle="Our commitment to transparency and data integrity."
        image={headerImage || undefined}
      />
      <section className="container mx-auto">
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Purpose of Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        The Kawartha Youth Orchestra websites (including https://www.kawarthayouthorchestra.org and https://www.thekyo.ca) serve as platforms to showcase our programs, expertise, impact, and the benefits our programs provide to the community. All information, facts, and figures presented on this website are derived from a blend of precise, verifiable data and estimations or extrapolations made in good faith.
                    </p>
                    <p>
                        In cases where estimated data allows for a broad spectrum of potential outcomes, the Kawartha Youth Orchestra opts to utilize data representative of the 50th percentile. This choice aims to accurately portray a median outcome, assuming a normal distribution of potential results and considering estimated minimum and maximum values. These calculations are strictly intended for demonstration purposes, offering insights into the potential outcomes and achievements the Kawartha Youth Orchestra has been able to affect over the years.
                    </p>
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Calendar className="w-3 h-3" />Last updated: October 26, 2023</div></CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Success Metrics and Demonstrations</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        When presenting success metrics, budget calculations and financial information, or any quantifiable results from client engagements, the Kawartha Youth Orchestra relies on a combination of precise, verifiable data and estimations or extrapolations made in good faith. We may use data that is representative of the 50th percentile to illustrate median outcomes when a wide range of options or possible conclusions could be drawn using estimated data.
                    </p>
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Calendar className="w-3 h-3" />Last updated: October 26, 2023</div></CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Purpose of Demonstrations</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        The success metrics and demonstrations provided on our website are intended for demonstration purposes only. They serve to showcase potential outcomes, impacts, and successes the Kawartha Youth Orchestra has achieved. These demonstrations are not intended to guarantee impact, quality, or future organizational performance.
                    </p>
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Calendar className="w-3 h-3" />Last updated: October 26, 2023</div></CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">No Claims or Warranties</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        The Kawartha Youth Orchestra makes no claims or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is strictly at your own risk.
                    </p>
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Calendar className="w-3 h-3" />Last updated: October 26, 2023</div></CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        In no event will the Kawartha Youth Orchestra be liable for any loss or damage, including, without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
                    </p>
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Calendar className="w-3 h-3" />Last updated: October 26, 2023</div></CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Accuracy of Information</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        While we endeavour to keep the information up to date and correct, the Kawartha Youth Orchestra makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is, therefore, strictly at your own risk.
                    </p>
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Calendar className="w-3 h-3" />Last updated: October 26, 2023</div></CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Changes to Disclaimer</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        The Kawartha Youth Orchestra reserves the right to update or change this disclaimer at any time without prior notice. It is recommended to check this page periodically for any updates.
                    </p>
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Calendar className="w-3 h-3" />Last updated: October 26, 2023</div></CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Acceptance of Terms</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        By using this website, you agree to accept these terms and conditions in full. If you do not agree with any part of this disclaimer, do not use our website.
                    </p>
                  <div className="mt-8 pt-6 border-t border-primary/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Calendar className="w-3 h-3" />Last updated: October 26, 2023</div></CardContent>
            </Card>
        </div>
      </section>
    </div>
  );
}
