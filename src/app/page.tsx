
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Music, Users, GraduationCap, Heart, Handshake, Eye, HandCoins, UserCheck, DollarSign, Group, Quote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getAnnouncements } from '@/lib/announcements';
import { getLinkById } from '@/lib/links';

const programs = [
  {
    title: 'Orchestras',
    description: 'Our flagship program for dedicated young musicians to perform in a full orchestra setting.',
    href: '/orchestras',
    icon: Users,
    image: PlaceHolderImages.find(p => p.id === 'program-orchestra')
  },
  {
    title: 'Upbeat!',
    description: 'An inclusive and fun introduction to orchestral music for younger students.',
    href: '/upbeat',
    icon: Music,
    image: PlaceHolderImages.find(p => p.id === 'program-upbeat')
  },
  {
    title: 'Lessons Program',
    description: 'Individual and group lessons with our experienced instructors to hone your skills.',
    href: '/lessons',
    icon: GraduationCap,
    image: PlaceHolderImages.find(p => p.id === 'program-lessons')
  },
];

const coreValues = [
    {
        icon: Heart,
        title: "Our Mission",
        description: "We inspire our musicians and our instructors to develop and cultivate a love for music, and to share their music and passion with the community."
    },
    {
        icon: Handshake,
        title: "Our Philosophy",
        description: "Music is for everyone. We foster the development of individual and group skills in an atmosphere of inclusivity, openness, collaboration, and passion. KYO encourages excellence within a nurturing environment."
    },
    {
        icon: Eye,
        title: "Our Vision",
        description: "The Kawartha Youth Orchestra is much more than dedicated student musicians led by dynamic teaching artists – although that is pretty great. We are community."
    }
];

const testimonials = [
  {
    quote: "The KYO embraced my son with open arms and through its commitment to his development was able to further drive not only advancement in music but also confidence and life skills.",
    author: "Lynda",
    role: "KYO Parent"
  },
  {
    quote: "My daughter LOVED the UPBEAT pilot program. She provided rave reviews on every ride home and would look forward to each and every session. Congratulations on such a successful pilot!!",
    author: "Jennifer",
    role: "KYO Parent"
  },
  {
    quote: "Wow, where do I start? I was asked to write a two-line testimonial in support of Kawartha Youth Orchestra (KYO). That is impossible. To summarize how Incredible KYO is and the dedicated volunteers into two lines can’t be done",
    author: "Spyro",
    role: "KYO Parent"
  }
];


const impactStats = [
    { number: '700+', label: 'Musicians Supported', icon: Users },
    { number: '2,700+', label: 'Community Members Impacted', icon: Group },
    { number: '$70k+', label: 'Annual Subsidies Provided', icon: DollarSign },
];

const heroSlides = [
    {
        title: "Nurturing the Next Generation of Musicians",
        subtitle: "The Kawartha Youth Orchestra provides exceptional music education and performance opportunities to young people, fostering artistic excellence, personal growth, and a lifelong love of music.",
        image: PlaceHolderImages.find(p => p.id === 'hero-concert'),
        buttons: [
            { text: "Learn More", href: "/about", variant: "default" as const },
            { text: "See Our Programs", href: "/orchestras", variant: "outline" as const }
        ]
    },
    {
        title: "Your Support Creates Harmony",
        subtitle: "Your generosity empowers young musicians, funds scholarships, and sustains our vibrant programs. Help us keep the music playing for generations to come.",
        image: PlaceHolderImages.find(p => p.id === 'page-header-donate'),
        buttons: [
            { text: "Donate Today", href: "/donate", variant: "default" as const },
            { text: "More Ways to Give", href: "/support", variant: "outline" as const }
        ]
    },
    {
        title: "Find Your Place on Stage",
        subtitle: "Auditions are open for our upcoming season. Join a community of passionate young musicians and take your skills to the next level.",
        image: PlaceHolderImages.find(p => p.id === 'orchestra-kids-playing'),
        buttons: [
            { text: "Register Now", href: "/register", variant: "default" as const, isExternal: true },
            { text: "Explore Ensembles", href: "/orchestras", variant: "outline" as const }
        ]
    },
];

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const newsImage = PlaceHolderImages.find(p => p.id === 'home-news');
  const financialAidImage = PlaceHolderImages.find(p => p.id === 'home-financial-aid');
  const announcements = getAnnouncements().slice(0, 3);
  const [registrationLink, setRegistrationLink] = useState<string | undefined>(undefined);

  useEffect(() => {
    const link = getLinkById('register');
    if (link) {
      setRegistrationLink(link.url);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % heroSlides.length);
    }, 7000); // Change slide every 7 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white p-0">
            {heroSlides.map((slide, index) => (
                slide.image && (
                <Image
                    key={slide.image.id}
                    src={slide.image.imageUrl}
                    alt={slide.image.description}
                    fill
                    className={`object-cover transition-opacity duration-1000 ease-in-out ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
                    priority={index === 0}
                    data-ai-hint={slide.image.imageHint}
                />
                )
            ))}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative container mx-auto px-4 md:px-6">
                {heroSlides.map((slide, index) => (
                <div
                    key={slide.title}
                    className={`absolute inset-0 flex flex-col justify-center items-center transition-opacity duration-1000 ease-in-out ${index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tight">
                        {slide.title}
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-neutral-200">
                        {slide.subtitle}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        {slide.buttons.map((button) => {
                        const href = button.isExternal ? registrationLink : button.href;
                        if (!href) return null;
                        
                        return (
                            <Button key={button.text} asChild size="lg" variant={button.variant === 'outline' ? 'outline' : 'default'} className={button.variant === 'outline' ? "bg-transparent border-white text-white hover:bg-white hover:text-primary" : "font-bold"}>
                            <Link href={href} target={button.isExternal ? "_blank" : "_self"} rel={button.isExternal ? "noopener noreferrer" : ""}>
                                {button.text}
                            </Link>
                            </Button>
                        )
                        })}
                    </div>
                </div>
                ))}
            </div>
        </section>

        <section id="programs" className="bg-background">
          <div className="container mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Programs</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                We offer a range of programs designed to meet students where they are, from beginners to advanced performers.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program) => (
                <Card key={program.title} className="flex flex-col overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  {program.image && (
                    <div className="aspect-video overflow-hidden">
                      <Image
                        src={program.image.imageUrl}
                        alt={program.image.description}
                        width={600}
                        height={400}
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint={program.image.imageHint}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <program.icon className="w-8 h-8 text-primary" />
                      <CardTitle className="font-headline text-2xl">{program.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{program.description}</CardDescription>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button asChild variant="link" className="p-0 h-auto">
                      <Link href={program.href} className="flex items-center gap-2">
                        Learn More <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-secondary">
            <div className="container mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold">Our Core Values</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {coreValues.map(role => (
                        <Card key={role.title}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <role.icon className="w-8 h-8 text-primary"/>
                                <CardTitle className="font-headline text-xl">{role.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{role.description}</p>
                            </CardContent>
                        </Card>
                   ))}
                </div>
            </div>
        </section>

        <section>
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold">What Our Community is Saying</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-4">
                We are proud to have the support of our incredible community of parents and students.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.author} className="flex flex-col">
                  <CardHeader>
                    <Quote className="w-10 h-10 text-primary mb-4" />
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <blockquote className="text-muted-foreground italic text-lg">
                      {testimonial.quote}
                    </blockquote>
                  </CardContent>
                  <CardFooter>
                    <p className="font-bold w-full text-right">- {testimonial.author}, <span className="font-normal text-muted-foreground">{testimonial.role}</span></p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>


        <section id="news" className="bg-secondary">
          <div className="container mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl">Latest News</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                Stay up-to-date with the latest happenings at the Kawartha Youth Orchestra.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2 grid grid-cols-1 gap-8">
                  {announcements.map((item) => (
                    <Card key={item.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-xl font-headline">{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{item.excerpt}</p>
                      </CardContent>
                       <div className="p-6 pt-0">
                        <Button asChild variant="link" className="p-0 h-auto">
                          <Link href="/calendar" className="flex items-center gap-2">
                            Read More <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
              {newsImage && (
                <div className="hidden md:block rounded-lg overflow-hidden shadow-lg aspect-[3/4]">
                   <Image
                      src={newsImage.imageUrl}
                      alt={newsImage.description}
                      width={600}
                      height={800}
                      className="object-cover w-full h-full"
                      data-ai-hint={newsImage.imageHint}
                    />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-background">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-headline font-bold">Financial Aid & Scholarships</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
                        <div className="bg-secondary p-6 rounded-lg">
                            <p className="text-4xl font-bold text-primary">$100k+</p>
                            <p className="text-sm text-muted-foreground mt-1">In Annual Bursaries</p>
                        </div>
                        <div className="bg-secondary p-6 rounded-lg">
                            <p className="text-4xl font-bold text-primary">120+</p>
                            <p className="text-sm text-muted-foreground mt-1">Students Supported</p>
                        </div>
                    </div>
                    <p className="text-muted-foreground md:text-lg">
                        We believe in nurturing musical talent regardless of financial background. Our goal is to ensure no student misses the opportunity to grow due to economic constraints. Explore our scholarships and aid programs to join our community of passionate young artists.
                    </p>
                    <div className="flex gap-4">
                        <Button asChild>
                            <Link href="/donate">Explore Aid</Link>
                        </Button>
                        {registrationLink && (
                          <Button asChild variant="outline">
                              <Link href={registrationLink} target="_blank" rel="noopener noreferrer">Register Now</Link>
                          </Button>
                        )}
                    </div>
                </div>
                {financialAidImage && (
                    <div className="rounded-lg overflow-hidden shadow-xl">
                        <Image
                            src={financialAidImage.imageUrl}
                            alt={financialAidImage.description}
                            width={600}
                            height={400}
                            className="object-cover w-full h-full"
                            data-ai-hint={financialAidImage.imageHint}
                        />
                    </div>
                )}
            </div>
          </div>
        </section>

        <section id="support" className="bg-secondary">
             <div className="container mx-auto text-center">
                <h2 className="text-3xl font-headline font-bold">Support Kawartha Youth Orchestra</h2>
                <p className="text-muted-foreground md:text-lg max-w-3xl mx-auto mt-4">
                    Your generosity empowers us to provide transformative musical experiences for young people. Help us continue our work by making a donation or learning about other ways to contribute.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-3xl mx-auto mt-8">
                    {impactStats.map(stat => (
                        <div key={stat.label}>
                            <p className="text-4xl font-bold text-primary">{stat.number}</p>
                            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Button asChild size="lg">
                        <Link href="/donate">Donate Now</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
