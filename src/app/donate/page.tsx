import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Check } from "lucide-react";

const donationTiers = [
  {
    title: 'Friend',
    amount: '$50',
    description: 'Provides sheet music for one student for an entire season.',
    features: ['Supports core program needs']
  },
  {
    title: 'Supporter',
    amount: '$150',
    description: 'Funds a group sectional coaching with a professional musician.',
    features: ['Enhances learning experiences', 'Provides expert instruction']
  },
  {
    title: 'Patron',
    amount: '$500',
    description: 'Contributes to a partial scholarship for a student in need.',
    features: ['Increases program accessibility', 'Supports a deserving student'],
    popular: true,
  },
  {
    title: 'Benefactor',
    amount: '$1,000+',
    description: 'Underwrites a full student scholarship for one year.',
    features: ['Transforms a young musician\'s life', 'Major impact on our mission']
  },
];

export default function DonatePage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-donate');

  return (
    <div>
      <PageHeader
        title="Donate to KYO Hub"
        subtitle="Your contribution directly supports our young musicians."
        image={headerImage}
      />
      <section className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">Invest in the Future of Music</h2>
            <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
            Every donation, no matter the size, makes a difference. Your generosity helps us provide high-quality music education, purchase instruments and materials, offer scholarships, and create unforgettable performance opportunities.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {donationTiers.map((tier) => (
            <Card key={tier.title} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{tier.title}</CardTitle>
                <p className="text-4xl font-bold">{tier.amount}</p>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-1 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                  Donate {tier.amount}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-16">
            <h3 className="text-2xl font-headline font-bold">Give a Custom Amount</h3>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-lg mt-2">
            Want to give a different amount? We appreciate any and all support for our mission.
            </p>
            <Button size="lg" className="mt-6">
                Donate Now
            </Button>
        </div>
      </section>
    </div>
  );
}
