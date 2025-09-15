
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Check, Heart, Mail, Landmark, HandCoins, Guitar, ExternalLink, MessageCircle, Car, Calendar, Repeat } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const monthlyTiers = [
  {
    title: 'Friend of KYO',
    amount: '$10',
    period: '/month',
    description: 'Provides a student with a season\'s worth of sheet music, unlocking new pieces to learn and master.',
    features: ['Supports core program needs'],
    href: 'https://donate.stripe.com/4gM7sLdg83eKfxa6yHb3q07',
  },
  {
    title: 'Supporter',
    amount: '$25',
    period: '/month',
    description: 'Funds a group sectional coaching, giving students direct mentorship from a professional musician.',
    features: ['Enhances learning experiences', 'Provides expert instruction'],
    href: 'https://donate.stripe.com/aFa5kD4JC3eK84Ie19b3q06',
  },
  {
    title: 'Patron',
    amount: '$50',
    period: '/month',
    description: 'Contributes to a partial scholarship, making music education accessible for a deserving student.',
    features: ['Increases program accessibility', 'Empowers a young musician'],
    popular: true,
    href: 'https://donate.stripe.com/8x29ATb807v0bgUg9hb3q05'
  },
  {
    title: 'Benefactor',
    amount: '$100+',
    period: '/month',
    description: 'Underwrites a full student scholarship for one year, transforming a young musician\'s life.',
    features: ['Provides a full year of music', 'Creates a lasting impact'],
    href: 'https://donate.stripe.com/7sY6oH8ZSaHc3Ose19b3q04'
  },
];

const otherDonationMethods = [
    {
        icon: Mail,
        title: "By Cheque",
        description: "Please make cheques payable to the Kawartha Youth Orchestra and mail to our P.O. Box.",
        details: "P.O. Box 53, 150 King Street, Peterborough ON K9J 6Y5",
    },
    {
        icon: HandCoins,
        title: "By E-Transfer",
        description: "Send E-Transfer donations to donations@thekyo.ca. Please include your full name and address in the notes for a tax receipt.",
        details: "donations@thekyo.ca",
    }
]

export default function DonatePage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-donate');

  return (
    <div>
      <PageHeader
        title="Your Gift Creates Harmony"
        subtitle="Invest in the next generation and help us keep the music playing."
        image={headerImage}
      />
      <section className="container mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-headline font-bold">Why Your Support Matters</h2>
            <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                Tuition fees cover only 4% of what it takes to run our programs. The rest comes from the generosity of people like you. Your donation directly funds everything from sheet music and instrument repairs to scholarships and expert coaching, ensuring that every young person has the chance to experience the power of music.
            </p>
        </div>
        <Tabs defaultValue="monthly" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly"><Repeat className="mr-2"/>Monthly Donation</TabsTrigger>
            <TabsTrigger value="one-time"><Calendar className="mr-2"/>One-Time Donation</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {monthlyTiers.map((tier) => (
                <Card key={tier.title} className={`flex flex-col ${tier.popular ? 'border-primary shadow-2xl' : 'shadow-md'}`}>
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">{tier.title}</CardTitle>
                     <p className="text-4xl font-bold flex items-baseline">{tier.amount}<span className="text-lg font-medium text-muted-foreground">{tier.period}</span></p>
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
                    <Button asChild className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                      <Link href={tier.href}>Donate Monthly</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="one-time" className="mt-12">
            <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Make a One-Time Gift</CardTitle>
                    <CardDescription className="text-lg">
                        Every single donation, no matter the size, helps us provide essential musical opportunities to local youth. Thank you for your support!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground mb-6">Click the button below to make a secure one-time donation. You can choose the amount you'd like to give.</p>
                    <Button asChild size="lg">
                        <Link href="https://donate.stripe.com/fZufZhekc8z4gBebT1b3q08">Donate Today</Link>
                    </Button>
                </CardContent>
                 <CardFooter>
                    <p className="text-sm text-muted-foreground mx-auto">Donations over $20 qualify for a charitable tax receipt.</p>
                </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">More Ways to Give</h2>
                <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                    Choose the donation method that works best for you. Every contribution over $20 qualifies for a charitable tax receipt.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {otherDonationMethods.map(method => (
                    <Card key={method.title}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <method.icon className="w-8 h-8 text-primary"/>
                            <CardTitle className="font-headline text-xl">{method.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{method.description}</p>
                            <p className="font-mono text-sm bg-muted p-2 rounded-md mt-4">{method.details}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="text-center mt-12">
                <p className="text-muted-foreground">For the fastest tax receipt, we encourage supporters to donate online.</p>
            </div>
        </div>
      </section>

      <section className="container mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="bg-primary text-primary-foreground p-4 rounded-full w-fit">
                        <Landmark className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl pt-4">The Tenuto Trust</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">Contribute to our legacy fund for dependable, long-term support, managed by the Community Foundation of Greater Peterborough.</p>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="#">Visit the Trust <ExternalLink /></Link>
                    </Button>
                </CardFooter>
            </Card>
             <Card className="flex flex-col">
                <CardHeader>
                    <div className="bg-primary text-primary-foreground p-4 rounded-full w-fit">
                        <Guitar className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl pt-4">Donate an Instrument</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">Have an unused instrument? Let us put it to great use in the hands of a young musician who can't afford one of their own.</p>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="mailto:email@thekyo.ca">Contact Us <Mail /></Link>
                    </Button>
                </CardFooter>
            </Card>
             <Card className="flex flex-col">
                <CardHeader>
                    <div className="bg-primary text-primary-foreground p-4 rounded-full w-fit">
                        <Car className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl pt-4">Donate a Car</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">Donate your car, truck, RV, boat, or motorcycle through Donate a Car Canada. They handle all the details, making it easy for KYO to benefit, and you'll receive a tax receipt.</p>
                </CardContent>
                <CardFooter>
                     <Button asChild variant="outline">
                        <Link href="#">Learn More <ExternalLink /></Link>
                    </Button>
                </CardFooter>
            </Card>
             <Card className="flex flex-col">
                <CardHeader>
                    <div className="bg-primary text-primary-foreground p-4 rounded-full w-fit">
                        <MessageCircle className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl pt-4">Custom Donation</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">Have a specific way you'd like to contribute or a question about donations? We would love to hear from you.</p>
                </CardContent>
                <CardFooter>
                     <Button asChild variant="outline">
                        <Link href="mailto:email@thekyo.ca">Get in Touch <Mail /></Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </section>

      <section>
        <div className="container mx-auto">
            <div className="rounded-lg bg-primary text-primary-foreground p-8 md:p-12 text-center">
                <Heart className="w-16 h-16 mx-auto mb-6 text-white"/>
                <h2 className="text-3xl font-headline font-bold">Not Ready to Donate? Volunteer!</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
                   Your time and talent are just as valuable. By volunteering, you play a crucial role in our mission. Explore how you can make a lasting difference today.
                </p>
                <div className="mt-8 flex justify-center">
                    <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                        <Link href="/volunteer">Learn About Volunteering</Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}
