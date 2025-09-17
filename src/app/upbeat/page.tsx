
"use client";

import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, HeartHandshake, Users, Award, Smile, BarChart, Check, Quote, HandCoins, BookOpen, Truck, LifeBuoy } from 'lucide-react';
import Image from 'next/image';
import { getLinkById } from '@/lib/links';
import React, { useEffect, useState } from 'react';
import type { ExternalLink } from '@/lib/links';


const programGoals = [
    {
        icon: Award,
        title: "Accessible Music Education",
        description: "Eliminating economic and logistical barriers by offering high-quality string education (violin, viola, and cello) completely free of charge to families."
    },
    {
        icon: HeartHandshake,
        title: "Holistic Youth Development",
        description: "Supporting social-emotional growth and youth wellbeing through mentorship, ensemble participation, and a trained Wellness Coordinator."
    },
     {
        icon: Users,
        title: "Equity & Inclusion",
        description: "Offering culturally responsive, trauma-informed, and neurodivergent-inclusive programming that reflects the diversity of our participants."
    },
    {
        icon: Target,
        title: "Pathways to Progression",
        description: "Preparing students for KYO’s Junior and Intermediate orchestras, aiming for RCM Grade 3 proficiency within their three-year UpBeat! trajectory."
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
  const kidsImage = PlaceHolderImages.find(p => p.id === 'upbeat-kids-smiling');
  const [registrationLink, setRegistrationLink] = useState<ExternalLink | undefined>(undefined);

  useEffect(() => {
    setRegistrationLink(getLinkById('register'));
  }, []);

  return (
    <div>
      <PageHeader
        title="UpBeat!"
        subtitle="An Investment in Equity, Belonging, and Youth Potential"
        image={headerImage}
      />

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold">What is UpBeat!?</h2>
                <p className="text-muted-foreground text-lg">
                    UpBeat! is KYO’s innovative after-school music and social development program for youth aged 8–14 facing economic and systemic barriers. It offers fully subsidized string instruction, holistic social-emotional supports, nutritious food, and transportation—all at no cost to families.
                </p>
                <p className="text-muted-foreground text-lg">
                    More than just music lessons, UpBeat! creates a safe, joyful, and inclusive environment where young people experience belonging, build confidence, and develop lifelong skills. For many, it is their first meaningful experience with organized music—an opportunity that, without UpBeat!, would remain out of reach.
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
                <h2 className="text-3xl font-headline font-bold">Our Mission: Music, Growth, and Opportunity</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    UpBeat! is guided by four interrelated goals that ensure both artistic excellence and deep social impact. We believe access to the arts is a right, not a privilege.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {programGoals.map(goal => (
                    <Card key={goal.title} className="text-center flex flex-col">
                        <CardHeader className="items-center">
                            <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                <goal.icon className="h-8 w-8" />
                            </div>
                            <CardTitle className="font-headline text-xl pt-4">{goal.title}</CardTitle>
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
             <div className="grid md:grid-cols-2 gap-12 items-center">
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
                <div className="space-y-6">
                    <h2 className="text-3xl font-headline font-bold">Proven Impact</h2>
                    <p className="text-muted-foreground text-lg">
                        Our data-informed approach demonstrates measurable success in youth engagement, retention, and satisfaction. We are proud of the positive change we are creating together.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {impactStats.slice(0, 2).map(stat => (
                            <Card key={stat.label}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <p className="text-4xl font-bold text-primary">{stat.number}</p>
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
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <p className="text-4xl font-bold text-primary">{impactStats[2].number}</p>
                            <div className="bg-accent text-accent-foreground p-3 rounded-full">
                                <impactStats[2].icon className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{impactStats[2].label}</p>
                            <p className="text-sm text-muted-foreground">{impactStats[2].description}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold">How It Works</h2>
                <p className="text-muted-foreground text-lg">
                    UpBeat! runs Tuesdays and Thursdays from 3:30 to 5:30 p.m. during the school year. Each session blends ensemble string instruction, theory games, movement-based learning, and creative group reflection.
                </p>
                 <div className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <BookOpen className="w-8 h-8 text-primary"/>
                            <CardTitle className="font-headline text-xl">Curriculum & Instruction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Students receive individualized attention in small groups, helping them build confidence and essential ensemble skills. Instruction is led by a diverse team of professional music educators.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Truck className="w-8 h-8 text-primary"/>
                             <CardTitle className="font-headline text-xl">Transportation & Nutrition</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">We provide free transportation from several local schools and offer a healthy snack at every session, removing key barriers to participation.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <LifeBuoy className="w-8 h-8 text-primary"/>
                            <CardTitle className="font-headline text-xl">Wellness & Support</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">A full-time Wellness Coordinator is always on site to help students with emotional regulation, relationship-building, and accessing further support.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Card className="bg-primary text-primary-foreground transform -rotate-2">
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
        </div>
      </section>

      <section id="support">
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
