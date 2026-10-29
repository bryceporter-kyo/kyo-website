
"use client";

import { useState, useEffect } from 'react';
import { useImages } from '@/components/providers/ImageProvider';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, Target, Users, GraduationCap, Music } from 'lucide-react';
import Image from 'next/image';
import { getLinkById } from '@/lib/links';
import { fetchButtonsFromFirebase, ButtonConfig } from '@/lib/buttons';

// ButtonConfig imported from @/lib/buttons

const programGoals = [
    {
        icon: GraduationCap,
        title: "Increase Access to Music",
        description: "Our group lessons offer an affordable alternative to private lessons. As with all programs at KYO, we are committed to accessibility: our lessons program qualify for a wide range of scholarships and bursaries."
    },
    {
        icon: Target,
        title: "Strengthen Musical Pathways",
        description: "By integrating instrument specific instruction with our tiered ensembles, we are creating a clear path from beginner lessons to our advanced orchestras."
    },
    {
        icon: Users,
        title: "Build Confidence & Community",
        description: "Support musical progression through individualized mentorship, ensuring lessons connect meaningfully with ensemble participation and long-term skill development, and student driven goals."
    }
];

const instruments = [
  'Violin', 'Viola', 'Cello', 'Double Bass',
  'Flute', 'Clarinet', 'Saxophone',
  'Trumpet', 'French Horn', 'Trombone', 'Tuba',
  'Percussion'
];

export default function LessonsPage() {
  const { getImage } = useImages();
  const headerImage = getImage('page-header-lessons');
  const aboutImage = getImage('program-lessons');
  const studentImage = getImage('lessons-teacher-student');
  const orchestraImage = getImage('orchestra-kids-playing') || getImage('program-orchestra');
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);

  useEffect(() => {
    const loadButtons = async () => {
      const data = await fetchButtonsFromFirebase();
      setButtons(data);
    };
    loadButtons();
  }, []);

  const mainButtonConfig = buttons.find(b => b.id === 'lessons-register-main');
  const secondaryButtonConfig = buttons.find(b => b.id === 'lessons-register-secondary');

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

  const mainButton = getButtonProps(mainButtonConfig);
  const secondaryButton = getButtonProps(secondaryButtonConfig);

  return (
    <div>
      <PageHeader
        title="Lessons Program"
        subtitle="Group classes on a wide range of instruments with top caliber instructors."
        image={headerImage}
      />

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold">A Foundation for Growth</h2>
                <p className="text-muted-foreground text-lg">
                    Group instruction offers the perfect starting point for complete beginners and a cost effective option to help intermediate musicians hone their skills and unlock their potential. We provide high-quality, inspiring, and affordable music education for youth across the region. Our lessons serve not just as musical instruction but as a bridge to ensemble performance, confidence-building, and lifelong engagement with the arts.
                </p>
                <p className="text-muted-foreground text-lg">
                    Our small group classes allow for instrument specific and student individualized instruction at a fraction of the cost of private lessons. Small ensemble teaching adds the benefits of learning with a group of supportive peers and chamber performance opportunities at our twice yearly classes recitals.
                </p>
                {mainButton && (
                  <Button asChild size="lg">
                      <Link href={mainButton.href} target={mainButton.target} rel={mainButton.target === '_blank' ? 'noopener noreferrer' : ''}>{mainButton.text}</Link>
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
            <h2 className="text-3xl font-headline font-bold">Our Goals: Your Success</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                Our lessons program is designed to create a space where music drives personal growth, builds confidence, and opens doors to new opportunities.
            </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {programGoals.map(goal => (
                    <Card key={goal.title} className="text-center flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
      
      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {studentImage && (
            <div className="rounded-lg overflow-hidden shadow-xl md:order-last">
                <Image
                    src={studentImage.imageUrl}
                    alt={studentImage.description}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint={studentImage.imageHint}
                />
            </div>
          )}
          <div className="space-y-8">
            <h2 className="text-3xl font-headline font-bold">How Our Lessons Work</h2>
            <p className="text-muted-foreground text-lg">
              Our lessons program is designed to provide consistent, high-quality instruction throughout the school year. Students benefit from weekly one-hour lessons with expert teachers. Every student has the opportunity to perform twice annually in our lessons studio recitals, with small group or solo performance options.
            </p>
            <p className="text-muted-foreground text-lg">
              Our instrument lending library makes it easy to try out instruments and find the perfect fit.
            </p>
          </div>
        </div>
      </section>

      <section className='bg-secondary'>
        <div className="container mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-primary text-primary-foreground h-full flex flex-col justify-between overflow-hidden">
              <div>
                <CardHeader className="flex flex-row items-start gap-4">
                  <Music className="w-8 h-8 mt-1 shrink-0"/>
                  <div>
                      <CardTitle className="font-headline text-2xl">A Pathway to Performance</CardTitle>
                      <CardDescription className="text-primary-foreground/80">Every student has the opportunity to perform twice annually in our lessons recitals.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="leading-relaxed">
                    The Lessons Program is a foundational pillar in the KYO’s musical pathway. It directly supports student progression into our many ensembles, including orchestras, jazz, and folk. This interconnected approach strengthens learning, builds peer connections, and sets students up for a lifetime of music making.
                  </p>
                  {orchestraImage && (
                    <div className="rounded-lg overflow-hidden shadow-md max-h-64 relative w-full h-56">
                      <Image
                        src={orchestraImage.imageUrl}
                        alt={orchestraImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={orchestraImage.imageHint}
                      />
                    </div>
                  )}
                </CardContent>
              </div>
              <div className="p-6 pt-4">
                <Button asChild variant="secondary">
                  <Link href='/programs/orchestras'>Explore Our Ensembles</Link>
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="md:col-span-1 space-y-8">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Instruments Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 columns-2">
                    {instruments.map(inst => (
                        <li key={inst} className="flex items-center gap-2 text-muted-foreground">
                            <Check className="w-5 h-5 text-accent"/>
                            <span>{inst}</span>
                        </li>
                    ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Start Your Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Ready to take the next step? No prior experience is required for many of our beginner programs!</p>
                {secondaryButton && (
                  <Button asChild className="mt-4 w-full">
                    <Link href={secondaryButton.href} target={secondaryButton.target} rel={secondaryButton.target === '_blank' ? 'noopener noreferrer' : ''}>{secondaryButton.text}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
