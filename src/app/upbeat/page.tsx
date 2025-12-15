
"use client";

import { useState, useEffect } from 'react';
import { useImages } from '@/components/providers/ImageProvider';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, HeartHandshake, Users, Award, Smile, BarChart, Quote, HandCoins, BookOpen, Truck, LifeBuoy, UsersRound, Star, GitCommitHorizontal, Group, GraduationCap, Check, ShieldCheck, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { getLinkById } from '@/lib/links';
import { fetchButtonsFromFirebase, ButtonConfig } from '@/lib/buttons';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

// ButtonConfig imported from @/lib/buttons

const programPillars = [
    {
        icon: UsersRound,
        title: "Youth Development & Equitable Access",
        description: "Empowering young musicians by fostering confidence, discipline, and emotional resilience through high-quality, accessible music education."
    },
    {
        icon: HeartHandshake,
        title: "Social Support & Inclusion",
        description: "Providing a safe, structured after-school environment with dedicated mentors to promote positive social interaction and a strong sense of belonging."
    },
     {
        icon: Group,
        title: "Cultural & Community Enrichment",
        description: "Deepening community engagement by showcasing youth performances that promote pride, celebration, and cross-cultural understanding."
    },
    {
        icon: Star,
        title: "Accessibility & Opportunity",
        description: "Eliminating all cost barriers, including instruments, transportation, and snacks, to ensure participation is open to all, regardless of family income."
    }
];

const impactStats = [
    { number: 87, suffix: '%', label: 'Youth Retention Rate', icon: Award, description: 'Significantly exceeding the 60% industry benchmark.' },
    { number: 92, suffix: '%', label: 'Participant Satisfaction', icon: Smile, description: 'Positive or highly positive experiences reported by students and families.' },
    { number: 100, suffix: '+', label: 'Students on Waitlist', icon: BarChart, description: 'Demonstrating high demand for the program.' },
];

const coreActivities = [
    { icon: GitCommitHorizontal, title: "Ensemble-Based String Instruction", description: "Students learn violin, viola, or cello in small group settings, developing both individual technique and ensemble skills." },
    { icon: BookOpen, title: "Music Literacy & Creative Exploration", description: "Activities in rhythm, movement, theory, and creative listening foster musical fluency and self-expression." },
    { icon: LifeBuoy, title: "Social-Emotional Support", description: "A full-time Wellness Coordinator is on site to offer guidance, conflict resolution, and mentoring." },
    { icon: HandCoins, title: "Holistic Supports", description: "Healthy snacks are provided daily, and free transportation is arranged from select local schools." },
    { icon: Award, title: "Performance Opportunities", description: "Students perform in public concerts and local outreach events, building confidence and community pride." }
];

const instructionalHighlights = [
    { icon: GraduationCap, title: "Professional Educators", description: "Our team consists of experienced professional musicians and educators, many with advanced music degrees." },
    { icon: Users, title: "Internal Leadership Pipeline", description: "Advanced KYO students are trained as assistant instructors, developing leadership skills and expanding our capacity." },
    { icon: Star, title: "Continuous Improvement", description: "Instructors receive regular performance reviews and collaborate to share best practices, ensuring program quality." },
    { icon: ShieldCheck, title: "Inclusive Pedagogy", description: "Staff receive training in trauma-informed and neurodivergent-inclusive practices to support every student." },
];

const challengesSolutions = [
    {
        id: "challenge-1",
        challenge: "Limited Instructor Availability",
        solution: "We developed an internal instructor pipeline using advanced KYO students as assistant teachers. This provides valuable mentorship opportunities for our senior students and builds our long-term staffing capacity."
    },
    {
        id: "challenge-2",
        challenge: "High Program Cost per Child",
        solution: "Through streamlined operations, increased enrollment, and improved use of technology, we’ve reduced per-student costs by 60% in two years without compromising the quality of instruction or support."
    },
    {
        id: "challenge-3",
        challenge: "Growing Waitlists",
        solution: "We have tripled our programming capacity since our pilot year, moved to a larger facility, and are actively expanding our donor base and seeking multi-year funding partners to meet the rising demand."
    }
];

const supporters = [
    'Ontario Trillium Foundation', 'F.K. Morrow Foundation', 'RBC',
    'Community Foundation of Greater Peterborough', 'City of Peterborough',
    'El Sistema Canada', 'Peterborough Symphony Orchestra', 'New Canadians Centre',
    'Kawartha Pine Ridge District School Board', 'Peterborough Children’s Chorus'
];


const testimonials = [
  {
    quote: "My daughter LOVED the UPBEAT pilot program. She provided rave reviews on every ride home and would look forward to each and every session. Congratulations on such a successful pilot!!",
    author: "Jennifer",
    role: "Upbeat! Parent"
  },
  {
    quote: "Upbeat! isn’t just about music. It’s about creating a place where kids feel seen, supported, and inspired. For some, this is the first place where they’ve really felt they belonged.",
    author: "Colin McMahon",
    role: "Program Manager"
  }
];


export default function UpbeatPage() {
  const { getImage } = useImages();
  const headerImage = getImage('page-header-upbeat');
  const aboutImage = getImage('program-upbeat');
  const impactImage = getImage('upbeat-kids-smiling');
  const communityImage = getImage('support-volunteer');
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);

  useEffect(() => {
    const loadButtons = async () => {
      const data = await fetchButtonsFromFirebase();
      setButtons(data);
    };
    loadButtons();
  }, []);

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

  const enrollButton = getButtonProps(buttons.find(b => b.id === 'upbeat-enroll'));

  return (
    <div>
      <PageHeader
        title="Upbeat!"
        subtitle="Removing Barriers, Building Futures: Music, Mentorship, and Equity for Youth"
        image={headerImage}
      />

      <section>
        <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-headline font-bold">A Symphony of Opportunity</h2>
                    <p className="text-muted-foreground text-lg">
                        Upbeat! is the Kawartha Youth Orchestra’s fully subsidized after-school music and social development program for youth aged 8–14 who face barriers to accessing music education. Rooted in the transformative principles of El Sistema, Upbeat! combines ensemble string instruction, nutritional support, emotional wellness services, and free transportation—all provided at no cost to participants.
                    </p>
                    <p className="text-muted-foreground text-lg">
                        More than just music lessons, Upbeat! creates a safe, joyful, and inclusive environment where young people experience belonging, build confidence, and develop lifelong skills. It is a model of how the arts can drive systemic change in the lives of young people and their communities.
                    </p>
                    {enrollButton && (
                      <Button asChild size="lg">
                          <Link href={enrollButton.href} target={enrollButton.target} rel={enrollButton.target === '_blank' ? 'noopener noreferrer' : ''}>{enrollButton.text}</Link>
                      </Button>
                    )}
                </div>
                {aboutImage && (
                    <div className="rounded-lg overflow-hidden shadow-xl aspect-video">
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
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Our Four Pillars</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Upbeat! is built on four core principles that guide our mission to deliver artistic excellence and deep social impact.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {programPillars.map(pillar => (
                    <Card key={pillar.title} className="text-center flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <CardHeader className="items-center">
                            <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                <pillar.icon className="h-8 w-8" />
                            </div>
                            <CardTitle className="font-headline text-xl pt-4">{pillar.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{pillar.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>
      
       <section>
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Proven Impact, Real Results</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Our data-informed approach demonstrates measurable success in youth engagement, retention, and satisfaction. We are proud of the positive change we are creating together.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {impactStats.map(stat => (
                    <Card key={stat.label} className="text-center transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                        <CardHeader className="items-center">
                            <div className="bg-accent text-accent-foreground p-4 rounded-full">
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <AnimatedCounter target={stat.number} suffix={stat.suffix} className="text-5xl font-bold text-primary pt-4" />
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

      <section className="bg-secondary">
          <div className="container mx-auto">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                  {impactImage && (
                      <div className="rounded-lg overflow-hidden shadow-xl aspect-video">
                          <Image
                              src={impactImage.imageUrl}
                              alt={impactImage.description}
                              width={600}
                              height={400}
                              className="object-cover w-full h-full"
                              data-ai-hint={impactImage.imageHint}
                          />
                      </div>
                  )}
                  <div className="space-y-6">
                      <h2 className="text-3xl font-headline font-bold">Who We Serve: A Commitment to Equity</h2>
                      <p className="text-muted-foreground text-lg">
                          Inclusivity and accessibility are central to KYO’s mission. We are proud to serve a participant base that reflects significantly greater diversity than our surrounding community.
                      </p>
                      <ul className="space-y-4">
                          <li className="flex items-start gap-4">
                              <Check className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                              <div>
                                  <h4 className="font-bold">Cultural Diversity</h4>
                                  <p className="text-muted-foreground">Over 50% of participants identify as non-white in a region that is 93% white.</p>
                              </div>
                          </li>
                           <li className="flex items-start gap-4">
                              <Check className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                              <div>
                                  <h4 className="font-bold">Economic Diversity</h4>
                                  <p className="text-muted-foreground">Average family household income is ~60% of the national average, with nearly 60% of families relying on subsidies.</p>
                              </div>
                          </li>
                           <li className="flex items-start gap-4">
                              <Check className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                              <div>
                                  <h4 className="font-bold">Inclusive Community</h4>
                                  <p className="text-muted-foreground">Our students include Indigenous, newcomer, and neurodivergent youth, creating a rich and supportive learning environment for all.</p>
                              </div>
                          </li>
                      </ul>
                       <p className="text-muted-foreground text-sm italic">
                          No other organization in the region offers orchestral training as affordably—or with greater subsidies for families in need.
                      </p>
                  </div>
              </div>
          </div>
      </section>


     <section>
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">How Upbeat! Works</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Upbeat! runs twice weekly (Tuesdays and Thursdays, 3:30–5:30 p.m.) throughout the school year, providing a consistent, enriching, and supportive after-school experience.
                </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
                {coreActivities.map(activity => (
                    <Card key={activity.title} className="bg-secondary transition-all duration-300 hover:shadow-md hover:border-primary/30">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <activity.icon className="w-8 h-8 text-primary flex-shrink-0" />
                            <CardTitle className="font-headline text-lg">{activity.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">{activity.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="mt-12">
                <Tabs defaultValue="quality" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mx-auto max-w-xl">
                        <TabsTrigger value="quality">Instructional Quality</TabsTrigger>
                        <TabsTrigger value="participants">Community-Centered Design</TabsTrigger>
                    </TabsList>
                    <TabsContent value="quality" className="mt-12">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="font-headline text-2xl">Instructional Quality & Professional Development</CardTitle>
                                <CardDescription>
                                    Our program's success is built on the expertise and dedication of our teaching artists, who are committed to both musical excellence and student well-being.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                {instructionalHighlights.map(highlight => (
                                    <div key={highlight.title} className="flex items-start gap-4 p-4 rounded-lg">
                                        <highlight.icon className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold font-headline text-lg">{highlight.title}</h4>
                                            <p className="text-muted-foreground">{highlight.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="participants" className="mt-12">
                        <Card>
                             <CardHeader className="text-center">
                                <CardTitle className="font-headline text-2xl">Community-Centered by Design</CardTitle>
                                <CardDescription>
                                    Upbeat! is shaped by the community it serves. We actively listen to students, families, and partners, evolving the program to meet their needs. This has led to key innovations.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                                {communityImage && (
                                    <div className="rounded-lg overflow-hidden shadow-lg aspect-video">
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
                                <div className="space-y-4">
                                     <Accordion type="single" collapsible className="w-full">
                                        {challengesSolutions.map(item => (
                                            <AccordionItem value={item.id} key={item.id}>
                                                <AccordionTrigger>{item.challenge}</AccordionTrigger>
                                                <AccordionContent>
                                                {item.solution}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
      </section>
      
       <section className="bg-secondary">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold">Voices from Our Community</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.author} className="flex flex-col bg-card transform-gpu transition-all hover:scale-105 hover:shadow-lg">
                            <CardHeader>
                                <Quote className="w-10 h-10 text-primary mb-4" />
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <blockquote className="text-muted-foreground font-medium text-lg">
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
        
        <section>
            <div className="container mx-auto text-center">
                 <h2 className="text-3xl font-headline font-bold">Our Partners & Supporters</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4 mb-12">
                   Upbeat! is made possible by a dedicated network of granting bodies, community partners, and individual donors. We are deeply grateful for their commitment.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 max-w-4xl mx-auto">
                    {supporters.map(name => (
                        <Badge key={name} variant="secondary" className="text-md px-4 py-1">{name}</Badge>
                    ))}
                </div>
            </div>
        </section>

      <section id="support" className="bg-secondary">
          <div className="container mx-auto">
            <Card className="bg-primary text-primary-foreground p-8 md:p-12 text-center">
                <CardHeader className="items-center">
                    <div className="w-fit bg-primary-foreground/10 p-4 rounded-full">
                        <Heart className="w-12 h-12 text-white"/>
                    </div>
                    <CardTitle className="font-headline text-3xl pt-4">Help Us Change Lives Through Music</CardTitle>
                </CardHeader>
              <CardContent>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-primary-foreground/80">
                    Upbeat! is a fully subsidized program that relies on the generosity of our community. Your donation directly funds instruments, instruction, and essential support for young musicians.
                </p>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                  <Link href="/donate">Donate Today</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/support">More Ways to Give</Link>
                </Button>
              </CardFooter>
              <div className="mt-8 text-center text-primary-foreground/80">
                <p>
                    On behalf of the Kawartha Youth Orchestra Board of Directors, instructors, youth, and families, we thank you for your consideration of Upbeat!.
                </p>
                <p className="mt-4 font-bold font-headline text-lg">Bryce Porter, Chair, Board of Directors</p>
              </div>
            </Card>
          </div>
        </section>
    </div>
  );
}

    

    