
"use client";

import { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, HeartHandshake, Users, Award, Smile, BarChart, Quote, HandCoins, BookOpen, Truck, LifeBuoy, UsersRound, Star, Check, GitCommitHorizontal, Group } from 'lucide-react';
import Image from 'next/image';
import { getLinkById } from '@/lib/links';
import type { ExternalLink } from '@/lib/links';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const programGoals = [
    {
        icon: UsersRound,
        title: "Youth Development & Equitable Access",
    },
    {
        icon: HeartHandshake,
        title: "Social Support & Inclusion",
    },
     {
        icon: Group,
        title: "Cultural & Community Enrichment",
    },
    {
        icon: Star,
        title: "Accessibility & Opportunity",
    }
];

const coreActivities = [
    { icon: GitCommitHorizontal, text: "Ensemble-Based String Instruction" },
    { icon: BookOpen, text: "Music Literacy & Creative Exploration" },
    { icon: LifeBuoy, text: "Social-Emotional Support" },
    { icon: HandCoins, text: "Holistic Supports (Snacks & Transport)" },
    { icon: Award, text: "Public Performance Opportunities" },
]

const impactStats = [
    { number: 87, suffix: '%', label: 'Youth Retention Rate', icon: Award, description: 'Significantly exceeding the 60% industry benchmark.' },
    { number: 92, suffix: '%', label: 'Participant Satisfaction', icon: Smile, description: 'Positive or highly positive experiences reported by students and families.' },
    { number: 100, suffix: '+', label: 'Students on Waitlist', icon: BarChart, description: 'Demonstrating a high demand for the program in our community.' },
];

const testimonials = [
  {
    quote: "My daughter LOVED the UPBEAT pilot program. She provided rave reviews on every ride home and would look forward to each and every session. Congratulations on such a successful pilot!!",
    author: "Jennifer",
    role: "UpBeat! Parent"
  },
  {
    quote: "UpBeat! isn’t just about music. It’s about creating a place where kids feel seen, supported, and inspired. For some, this is the first place where they’ve really felt they belonged.",
    author: "Colin McMahon",
    role: "Program Manager"
  }
];


export default function UpbeatPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-upbeat');
  const aboutImage = PlaceHolderImages.find(p => p.id === 'program-upbeat');
  const kidsImage = PlaceHolderImages.find(p => p.id === 'upbeat-kids-smiling');
  const [registrationLink, setRegistrationLink] = useState<ExternalLink | undefined>(undefined);

  useEffect(() => {
    setRegistrationLink(getLinkById('register'));
  }, []);

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
                <h2 className="text-3xl font-headline font-bold">Project Summary</h2>
                <p className="text-muted-foreground text-lg">
                    UpBeat! is the Kawartha Youth Orchestra’s fully subsidized after-school music and social development program for youth aged 8–14 who face barriers to accessing music education. Rooted in the transformative principles of El Sistema and designed for equity, UpBeat! combines ensemble string instruction, nutritional support, emotional wellness services, and free transportation—all provided at no cost to participants.
                </p>
                <p className="text-muted-foreground text-lg">
                    Running twice weekly throughout the school year, UpBeat! is a model of how the arts can drive systemic change in the lives of young people and their communities.
                </p>
                {registrationLink && (
                  <Button asChild size="lg">
                    <Link href={registrationLink.url} target="_blank" rel="noopener noreferrer">Enroll in UpBeat!</Link>
                  </Button>
                )}
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
                <h2 className="text-3xl font-headline font-bold">Program Goals</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    UpBeat! is designed to empower young musicians, provide holistic support, enrich our community, and create lasting opportunities.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {programGoals.map(goal => (
                    <Card key={goal.title} className="text-center flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <CardHeader className="items-center">
                            <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                <goal.icon className="h-8 w-8" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="font-headline text-xl">{goal.title}</CardTitle>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>
      
      <section>
        <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 md:order-last">
                    <h2 className="text-3xl font-headline font-bold">Who Participates?</h2>
                    <p className="text-muted-foreground text-lg">
                        UpBeat! is a social equity initiative at its heart. We welcome youth aged 8-14 who face barriers to traditional music programs, including students from newcomer, low-income, and underrepresented communities. No prior experience is required—just excitement and a willingness to collaborate.
                    </p>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">A Diverse Community</CardTitle>
                            <CardDescription>2024-2025 Demographics</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <p className="text-muted-foreground"><strong className="text-primary">>50%</strong> of participants identify as non-white in a region that is 93% white.</p>
                             <p className="text-muted-foreground">Average family household income is <strong className="text-primary">~60%</strong> of the national average.</p>
                             <p className="text-muted-foreground"><strong className="text-primary">~60%</strong> of participants receive additional individual support or subsidy beyond base programming.</p>
                        </CardContent>
                    </Card>
                </div>
                 {kidsImage && (
                    <div className="rounded-lg overflow-hidden shadow-xl">
                        <Image
                            src={kidsImage.imageUrl}
                            alt={kidsImage.description}
                            width={600}
                            height={400}
                            className="object-cover w-full h-full"
                            data-ai-hint={kidsImage.imageHint}
                        />
                    </div>
                )}
            </div>
        </div>
      </section>


      <section className="bg-secondary">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold">Program Structure & Activities</h2>
                <p className="text-muted-foreground text-lg">
                    UpBeat! runs Tuesdays and Thursdays from 3:30 to 5:30 p.m. during the school year, providing a consistent and enriching after-school experience for up to 60 students annually.
                </p>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Core Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {coreActivities.map(activity => (
                                <li key={activity.text} className="flex items-center gap-4">
                                    <activity.icon className="w-6 h-6 text-primary flex-shrink-0"/>
                                    <span className="text-muted-foreground">{activity.text}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold text-center">Proven Impact</h2>
                {impactStats.map(stat => (
                    <Card key={stat.label} className="transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                             <AnimatedCounter target={stat.number} suffix={stat.suffix} className="text-4xl font-bold text-primary" />
                            <div className="bg-accent text-accent-foreground p-3 rounded-full">
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{stat.label}</p>
                            <p className="text-sm text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>
      
       <section>
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold">Voices from the Community</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {testimonials.map((testimonial) => (
                    <Card key={testimonial.author} className="flex flex-col bg-primary text-primary-foreground transform rotate-1">
                        <CardHeader>
                            <Quote className="w-10 h-10 text-primary-foreground/80 mb-4" />
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <blockquote className="text-primary-foreground/90 font-medium text-lg">
                            {testimonial.quote}
                            </blockquote>
                        </CardContent>
                        <CardFooter>
                            <p className="font-bold w-full text-right">- {testimonial.author}, <span className="font-normal text-primary-foreground/80">{testimonial.role}</span></p>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
            </div>
        </section>

      <section id="support" className="bg-secondary">
          <div className="container mx-auto">
            <div className="rounded-lg bg-primary text-primary-foreground p-8 md:p-12 text-center">
                <div className="w-fit mx-auto bg-primary-foreground/10 p-4 rounded-full mb-6">
                    <HandCoins className="w-12 h-12 text-white"/>
                </div>
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
