

import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, HandHeart, Music, Award, University, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import { getLinkById } from '@/lib/links';

const orchestras = [
  {
    title: 'Junior KYO (JKYO)',
    description: 'For strings and flutes with basic instrument knowledge and experience.',
    experience: 'Beginner Level'
  },
  {
    title: 'Intermediate KYO (IKYO)',
    description: 'For strings, woodwinds, brass, and percussion.',
    experience: 'Typically 2+ years of ensemble experience'
  },
  {
    title: 'Senior KYO (SKYO)',
    description: 'For advanced strings, woodwinds, brass, and percussion.',
    experience: 'Typically 4+ years of ensemble experience'
  },
];

const financialAidOptions = [
    {
        icon: HandHeart,
        title: "Tuition Assistance",
        description: "We offer financial aid to help make our programs accessible to all families through tuition bursaries & multiple child discounts.",
        linkId: "contact-info"
    },
    {
        icon: Music,
        title: "Instrument Loans",
        description: "The KYO has a limited number of instruments available for loan to registered musicians for the entire season, free of charge.",
        linkId: "contact-info"
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

export default function OrchestrasPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-orchestras');
  const joinImage = PlaceHolderImages.find(p => p.id === 'orchestra-kids-playing');
  const registrationLink = getLinkById('register');

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
                  {registrationLink && (
                    <>
                      <Button asChild size="lg">
                          <Link href={registrationLink.url} target="_blank" rel="noopener noreferrer">Register for 2025-2026</Link>
                      </Button>
                      <Button asChild size="lg" variant="outline">
                          <Link href={registrationLink.url} target="_blank" rel="noopener noreferrer">Sign Up for an Audition</Link>
                      </Button>
                    </>
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
                {orchestras.map((item) => (
                    <Card key={item.title} className="text-left flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{item.title}</CardTitle>
                            <CardDescription>{item.experience}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                            <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                        {registrationLink && (
                          <CardFooter>
                            <Button asChild className="w-full">
                                  <Link href={registrationLink.url} target="_blank" rel="noopener noreferrer">Register Now</Link>
                              </Button>
                          </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
        </div>
      </section>

       <section>
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Supplemental Courses</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Broaden your musical horizons with our digital courses. These flexible online classes are available for all ages with no prior experience necessary.
                </p>
            </div>
            <Card className="max-w-3xl mx-auto transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                <CardHeader className="items-center text-center">
                    <div className="bg-primary text-primary-foreground p-4 rounded-full w-fit">
                        <University className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl pt-4">Digital Courses for All Ages</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-6">Explore topics like Composition, Music Theory, Instrument Practice, and Film Scoring from the comfort of your home. These courses are designed to complement your ensemble experience and deepen your musical understanding.</p>
                     {registrationLink && (
                        <Button asChild size="lg">
                          <Link href={registrationLink.url} target="_blank" rel="noopener noreferrer">Register for a Course</Link>
                      </Button>
                     )}
                </CardContent>
            </Card>
        </div>
      </section>

      <section className="bg-secondary">
          <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Financial Aid & Scholarships</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    We are committed to making music education accessible. Explore the financial support options available to our students.
                </p>
            </div>
            <div className="max-w-4xl mx-auto space-y-12">
                <div>
                    <h3 className="text-2xl font-headline font-bold text-center mb-8">Financial Support</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {financialAidOptions.map(option => {
                            const link = getLinkById(option.linkId);
                            return (
                                <Card key={option.title} className="transition-all duration-300 hover:shadow-lg hover:border-primary/50">
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
    </div>
  );
}
