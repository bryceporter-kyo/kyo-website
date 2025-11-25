
"use client";

import { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, HandHeart, Music, Award, University, GraduationCap, Briefcase, FileText, Cpu, Library, Star, Handshake, School } from 'lucide-react';
import Image from 'next/image';
import { getLinkById } from '@/lib/links';
import buttonData from '@/lib/buttons.json';
import ProgramPathways from '@/components/shared/ProgramPathways';

type ButtonConfig = {
    id: string;
    location: string;
    text: string;
    link: { type: 'internal' | 'external', value: string };
    visible: boolean;
};

const orchestras = [
  {
    title: 'Junior KYO (JKYO)',
    description: 'For strings and flutes with basic instrument knowledge and experience.',
    experience: 'Beginner Level',
    imageId: 'orchestra-junior'
  },
  {
    title: 'Intermediate KYO (IKYO)',
    description: 'For strings, woodwinds, brass, and percussion.',
    experience: 'Typically 2+ years of ensemble experience',
    imageId: 'orchestra-intermediate'
  },
  {
    title: 'Senior KYO (SKYO)',
    description: 'For advanced strings, woodwinds, brass, and percussion.',
    experience: 'Typically 4+ years of ensemble experience',
    imageId: 'orchestra-senior'
  },
];

const financialAidOptions = [
    {
        icon: HandHeart,
        title: "Tuition Assistance",
        description: "We offer financial aid to help make our programs accessible to all families through tuition bursaries & multiple child discounts.",
        linkId: "contact-main",
        imageId: "aid-tuition"
    },
    {
        icon: Music,
        title: "Instrument Loans",
        description: "The KYO has a limited number of instruments available for loan to registered musicians for the entire season, free of charge.",
        linkId: "contact-main",
        imageId: "aid-instruments"
    }
]

const scholarships = [
    {
        icon: Award,
        title: "Bell Bassoons Ltd. Scholarship",
        description: "Encourages and supports bassoonists in the KYO. The award is open to youth musicians from any of the KYO ensembles, and is provided to help support musician enrichment."
    },
    {
        icon: GraduationCap,
        title: "Helen Ball Leadership Award",
        description: "Recognizes a KYO youth musician who demonstrates a high level of commitment, leadership, and support for music and the arts in the wider community."
    }
]

const supplementaryEnsembles = [
    {
        title: "Folk Ensemble",
        description: "Explore Celtic and global folk traditions. Open to strings, flute, harp, guitar, percussion, voice, and more.",
        imageId: 'ensemble-folk'
    },
    {
        title: "Jazz Combo",
        description: "Dive into swing, blues, and Latin music. Focus on improvisation and accompaniment in a small group setting.",
        imageId: 'ensemble-jazz'
    },
    {
        title: "Chamber Music",
        description: "Receive small ensemble coaching from professional musicians. For confident classical players, including piano and guitar.",
        imageId: 'ensemble-chamber'
    }
];

const creativeCourses = [
    {
        title: "Digital Music Production",
        description: "Learn to record, edit, and produce music in any genre using modern digital audio workstations (DAWs).",
        icon: Cpu
    },
    {
        title: "Music Theory",
        description: "Go beyond the basics with courses on harmony, form, analysis, and musical styles from different eras.",
        icon: FileText
    },
    {
        title: "Composition",
        description: "Write your own original music for soloists and chamber groups with guidance on score preparation and coaching.",
        icon: Briefcase
    }
];


export default function OrchestrasPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-orchestras');
  const joinImage = PlaceHolderImages.find(p => p.id === 'orchestra-kids-playing');
  const communityImage = PlaceHolderImages.find(p => p.id === 'support-volunteer');
  const [buttons] = useState<ButtonConfig[]>(buttonData.buttons as ButtonConfig[]);

  const registerButtonConfig = buttons.find(b => b.id === 'orchestras-register');
  const auditionButtonConfig = buttons.find(b => b.id === 'orchestras-audition');

  const getButtonProps = (buttonConfig?: ButtonConfig) => {
    if (!buttonConfig || !buttonConfig.visible) return null;
    let href = '#';
    let target = '_self';
    if (buttonConfig.link.type === 'external') {
      const link = getLinkById(buttonConfig.link.value);
      if (link) {
        href = link.url;
        target = '_blank';
      }
    } else {
      href = buttonConfig.link.value;
    }
    return { href, target, text: buttonConfig.text };
  };

  const registerButton = getButtonProps(registerButtonConfig);
  const auditionButton = getButtonProps(auditionButtonConfig);


  return (
    <div>
      <PageHeader
        title="Find Your Ensemble"
        subtitle="Discover the orchestra or ensemble that’s the perfect fit for your passion and skill level."
        image={headerImage}
      />

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold">Join a Thriving Musical Community</h2>
                <p className="text-muted-foreground text-lg">
                    The Kawartha Youth Orchestra (KYO) welcomes students aged 8 to 28 from the Kawartha and Greater Peterborough areas. We offer a structured, progressive suite of ensembles designed to help young musicians advance their skills in a safe, inclusive environment.
                </p>
                <p className="text-muted-foreground text-lg">
                    To enhance their musical journey, we recommend that all KYO members pursue private lessons. Our team is ready to assist you with information on private instruction opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {registerButton && (
                    <Button asChild size="lg">
                        <Link href={registerButton.href} target={registerButton.target} rel={registerButton.target === '_blank' ? 'noopener noreferrer' : ''}>{registerButton.text}</Link>
                    </Button>
                  )}
                  {auditionButton && (
                    <Button asChild size="lg" variant="outline">
                        <Link href={auditionButton.href} target={auditionButton.target} rel={auditionButton.target === '_blank' ? 'noopener noreferrer' : ''}>{auditionButton.text}</Link>
                    </Button>
                  )}
                </div>
            </div>
             {joinImage && (
                <div className="rounded-lg overflow-hidden shadow-xl">
                    <Image
                        src={joinImage.imageUrl}
                        alt={joinImage.description}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full"
                        data-ai-hint={joinImage.imageHint}
                    />
                </div>
            )}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Our Orchestras</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Our three core orchestras provide a clear path for students to grow as musicians, from their first notes to advanced symphonies. Find your place and start your journey today.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {orchestras.map((item) => {
                    const image = PlaceHolderImages.find(p => p.id === item.imageId);
                    return (
                        <Card key={item.title} className="text-left flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                            {image && (
                                <div className="relative aspect-video">
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.description}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={image.imageHint}
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">{item.title}</CardTitle>
                                <CardDescription>{item.experience}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow">
                                <p className="text-muted-foreground">{item.description}</p>
                            </CardContent>
                            {registerButton && (
                              <CardFooter>
                                <Button asChild className="w-full">
                                      <Link href={registerButton.href} target={registerButton.target} rel={registerButton.target === '_blank' ? 'noopener noreferrer' : ''}>Register Now</Link>
                                  </Button>
                              </CardFooter>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
      </section>
      
      <ProgramPathways />

       <section>
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold">Our Philosophy</h2>
              <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                We believe in a holistic approach to music education that balances artistic achievement with a supportive and inspiring environment.
              </p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Library className="w-8 h-8 text-primary"/>
                  <CardTitle className="font-headline text-xl">A Diverse Musical Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Our repertoire is anchored in the classical tradition but embraces a broad range of styles, including pop arrangements, film music, and works by Canadian and emerging composers.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Star className="w-8 h-8 text-primary"/>
                  <CardTitle className="font-headline text-xl">Performance-Based Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Each orchestra performs in at least three public concerts per year. Public performance is key to building confidence, sharing progress, and connecting with our community.</p>
                </CardContent>
              </Card>
            </div>
          </div>
       </section>

       <section className="bg-secondary">
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Creative & Supplementary Programs</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Broaden your musical horizons with our specialized ensembles and creative courses, available for all ages with no prior experience necessary for many.
                </p>
            </div>
            <div className="space-y-12">
                 <div>
                    <h3 className="text-2xl font-headline font-bold text-center mb-8">Supplementary Ensembles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {supplementaryEnsembles.map((ensemble) => {
                             const image = PlaceHolderImages.find(p => p.id === ensemble.imageId);
                             return (
                             <Card key={ensemble.title} className="text-center flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                                {image && (
                                    <div className="relative aspect-video">
                                        <Image
                                            src={image.imageUrl}
                                            alt={image.description}
                                            fill
                                            className="object-cover"
                                            data-ai-hint={image.imageHint}
                                        />
                                    </div>
                                )}
                                <CardHeader className="items-center flex-grow">
                                    <CardTitle className="font-headline text-2xl pt-4">{ensemble.title}</CardTitle>
                                    <CardDescription className="pt-2">{ensemble.description}</CardDescription>
                                </CardHeader>
                                {registerButton && (
                                    <CardFooter className="justify-center">
                                         <Button asChild variant="outline">
                                            <Link href={registerButton.href} target={registerButton.target} rel={registerButton.target === '_blank' ? 'noopener noreferrer' : ''}>Register</Link>
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        )})}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-headline font-bold text-center mb-8">Creative Courses</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {creativeCourses.map((course) => (
                             <Card key={course.title} className="text-center flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="items-center">
                                    <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                        <course.icon className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="font-headline text-xl pt-4">{course.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground">{course.description}</p>
                                </CardContent>
                                {registerButton && (
                                    <CardFooter className="justify-center">
                                        <Button asChild variant="outline">
                                            <Link href={registerButton.href} target={registerButton.target} rel={registerButton.target === '_blank' ? 'noopener noreferrer' : ''}>Enroll Now</Link>
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section>
          <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Financial Aid & Scholarships</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Our two-tiered subsidy system, featuring a universal subsidy and additional income-based bursaries, ensures no student is turned away due to financial need.
                </p>
            </div>
            <div className="max-w-4xl mx-auto space-y-12">
                <div>
                    <h3 className="text-2xl font-headline font-bold text-center mb-8">Financial Support</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {financialAidOptions.map(option => {
                            const link = getLinkById(option.linkId);
                            const image = PlaceHolderImages.find(p => p.id === option.imageId);
                            return (
                                <Card key={option.title} className="transition-all duration-300 hover:shadow-lg hover:border-primary/50 overflow-hidden">
                                     {image && (
                                        <div className="relative aspect-video">
                                            <Image
                                                src={image.imageUrl}
                                                alt={image.description}
                                                fill
                                                className="object-cover"
                                                data-ai-hint={image.imageHint}
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <option.icon className="w-8 h-8 text-primary"/>
                                        <CardTitle className="font-headline text-xl">{option.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{option.description}</p>
                                        {link && (
                                            <Button asChild variant="link" className="p-0 h-auto mt-4">
                                                <Link href={link.url}>Contact us for more info</Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                 <div>
                    <h3 className="text-2xl font-headline font-bold text-center mb-8">Scholarship Opportunities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {scholarships.map(scholarship => (
                            <Card key={scholarship.title} className="transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <scholarship.icon className="w-8 h-8 text-primary"/>
                                    <CardTitle className="font-headline text-xl">{scholarship.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{scholarship.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
          </div>
      </section>

       <section className="bg-secondary">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-headline font-bold">Equity & Community Partnerships</h2>
              <p className="text-muted-foreground text-lg">
                The KYO strives to be an inclusive, anti-discriminatory space that reflects the diversity of our broader community. We foster safe, positive environments for all students, including marginalized and underrepresented youth.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <Handshake className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">New Canadians Centre Partnership</h4>
                    <p className="text-muted-foreground">Offering improved access to KYO programs for newcomer youth and families.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <School className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">School Outreach</h4>
                    <p className="text-muted-foreground">Providing instrumental coaching, masterclasses, and access to our instrument lending library for local schools.</p>
                  </div>
                </li>
              </ul>
            </div>
            {communityImage && (
              <div className="rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={communityImage.imageUrl}
                  alt={communityImage.description}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full"
                  data-ai-hint={communityImage.imageHint}
                />
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

    

