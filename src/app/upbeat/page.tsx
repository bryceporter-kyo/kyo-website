import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, HeartHandshake, Users, Award, Smile, BarChart, Check, Quote, HandCoins } from 'lucide-react';
import Image from 'next/image';

const programGoals = [
    {
        icon: Target,
        title: "Youth Development & Equitable Access",
        description: "Empowering young musicians by offering high-quality, accessible music education that fosters confidence, discipline, and emotional resilience."
    },
    {
        icon: HeartHandshake,
        title: "Social Support & Inclusion",
        description: "Providing a safe, structured, and nurturing after-school environment that promotes positive social interaction and a strong sense of belonging."
    },
    {
        icon: Users,
        title: "Cultural & Community Enrichment",
        description: "Deepening community engagement by bringing youth performances to schools, neighbourhood hubs, and public concerts."
    }
];

const impactStats = [
    { number: '87%', label: 'Youth Retention Rate', icon: Award, description: 'Significantly exceeding the 60% industry benchmark.' },
    { number: '92%', label: 'Participant Satisfaction', icon: Smile, description: 'Positive or highly positive experiences reported by students and families.' },
    { number: '100+', label: 'Students on Waitlist', icon: BarChart, description: 'Demonstrating a high demand for the program in our community.' },
];

const holisticSupports = [
    "Ensemble-Based String Instruction",
    "Music Literacy & Creative Exploration",
    "On-Site Social-Emotional Support",
    "Healthy Snacks at Every Session",
    "Free Transportation from Local Schools",
    "Multiple Public Performance Opportunities"
]

export default function UpbeatPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-upbeat');
  const aboutImage = PlaceHolderImages.find(p => p.id === 'program-upbeat');

  return (
    <div>
      <PageHeader
        title="UpBeat!"
        subtitle="Removing Barriers, Building Futures: Music, Mentorship, and Equity for Youth"
        image={headerImage}
      />

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold">What is UpBeat!?</h2>
                <p className="text-muted-foreground text-lg">
                    UpBeat! is the Kawartha Youth Orchestra’s fully subsidized after-school music and social development program for youth aged 8–14 who face barriers to accessing music education. Rooted in the transformative principles of El Sistema, UpBeat! combines ensemble string instruction, nutritional support, emotional wellness services, and free transportation—all at no cost.
                </p>
                    <p className="text-muted-foreground text-lg">
                    Running Tuesdays and Thursdays from 3:30 p.m. to 5:30 p.m. throughout the school year, the program cultivates both musical ability and personal growth, helping children develop confidence, empathy, and resilience in a safe and joyful environment.
                </p>
                <Button asChild size="lg">
                  <Link href="/register">Enroll in UpBeat!</Link>
                </Button>
            </div>
            {aboutImage && (
                <div className="rounded-lg overflow-hidden shadow-xl">
                    <Image
                        src={aboutImage.imageUrl}
                        alt={aboutImage.description}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full"
                        data-ai-hint={aboutImage.imageHint}
                    />
                </div>
            )}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto">
                <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Our Mission: Music, Growth, and Opportunity</h2>
                <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                    We are committed to creating a space where music drives personal growth, fosters inclusion, and enriches our entire community.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {programGoals.map(goal => (
                    <Card key={goal.title} className="text-center flex flex-col">
                        <CardHeader className="items-center">
                            <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                <goal.icon className="h-8 w-8" />
                            </div>
                            <CardTitle className="font-headline text-2xl pt-4">{goal.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{goal.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto">
            <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">Proven Impact</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                Our data-informed approach demonstrates measurable success in youth engagement, retention, and satisfaction. We are proud of the positive change we are creating together.
            </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {impactStats.map(stat => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <p className="text-5xl font-bold text-primary">{stat.number}</p>
                            <div className="bg-accent text-accent-foreground p-3 rounded-full">
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-lg">{stat.label}</p>
                            <p className="text-sm text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      <section className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
            <h2 className="text-3xl font-headline font-bold">More Than Music Lessons</h2>
            <p className="text-muted-foreground text-lg">
                To ensure every child can participate fully, UpBeat! eliminates common barriers by providing comprehensive, holistic support. This approach ensures students can focus on what matters most: learning, growing, and making music together. Everything is provided free of charge.
            </p>
             <ul className="space-y-3">
                {holisticSupports.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                        <Check className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
                        <span className="text-lg text-muted-foreground">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
        <Card className="bg-primary text-primary-foreground transform rotate-3">
            <CardHeader>
                <Quote className="w-12 h-12 text-primary-foreground/50" />
            </CardHeader>
            <CardContent>
                <blockquote className="text-2xl font-headline italic">
                    My daughter LOVED the UPBEAT pilot program. She provided rave reviews on every ride home and would look forward to each and every session.
                </blockquote>
            </CardContent>
            <CardFooter>
                 <p className="text-lg font-bold w-full text-right">- Jennifer, UpBeat! Parent</p>
            </CardFooter>
        </Card>
      </section>

        <section id="support" className="bg-secondary">
          <div className="container mx-auto">
            <div className="rounded-lg bg-primary text-primary-foreground p-8 md:p-12 text-center">
              <h2 className="text-3xl font-headline font-bold">Support the UpBeat! Program</h2>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-primary-foreground/80">
                UpBeat! is a fully subsidized program that relies on the generosity of our community. Your donation directly funds instruments, instruction, and essential support for young musicians. Help us change lives through the power of music.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                  <Link href="/donate">Donate Today</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/support">More Ways to Give</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
