import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, Target, Users, GraduationCap, Music } from 'lucide-react';
import Image from 'next/image';

const programGoals = [
    {
        icon: GraduationCap,
        title: "Increase Access to Music",
        description: "Grow our capacity to deliver high-quality instrumental lessons for youth aged 6-18, from complete beginners to advanced players."
    },
    {
        icon: Target,
        title: "Strengthen Musical Pathways",
        description: "Integrate private instruction with our tiered ensembles, creating a clear path from beginner lessons to our advanced orchestras."
    },
    {
        icon: Users,
        title: "Build Confidence & Community",
        description: "Support musical progression and retention, ensuring lessons connect meaningfully with ensemble participation and long-term skill development."
    }
];

const instruments = [
  'Violin', 'Viola', 'Cello', 'Double Bass',
  'Flute', 'Clarinet', 'Saxophone', 'Oboe', 'Bassoon',
  'Trumpet', 'French Horn', 'Trombone', 'Tuba',
  'Percussion', 'Guitar'
]

export default function LessonsPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-lessons');
  const aboutImage = PlaceHolderImages.find(p => p.id === 'program-lessons');
  const studentImage = PlaceHolderImages.find(p => p.id === 'lessons-teacher-student');

  return (
    <div>
      <PageHeader
        title="Lessons Program"
        subtitle="Individual and group instruction to hone your skills and unlock your potential."
        image={headerImage}
      />

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold">A Foundation for Growth</h2>
                <p className="text-muted-foreground text-lg">
                    The KYO Lessons Program is a transformative investment in your musical future. We provide high-quality, inspiring, and affordable music education for youth across the region. Our lessons serve not just as musical instruction but as a bridge to ensemble performance, confidence-building, and lifelong engagement with the arts.
                </p>
                <p className="text-muted-foreground text-lg">
                    This initiative enables more youth to receive weekly, high-caliber music instruction delivered by professional and conservatory-trained teachers. We are deeply committed to making music education available, affordable, and inspiring for all youth, regardless of background or financial circumstances.
                </p>
                <Button asChild size="lg">
                    <Link href="/register">Start Your Musical Journey</Link>
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
            <h2 className="text-3xl font-headline font-bold">Our Goals: Your Success</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                Our program is designed to create a space where music drives personal growth, builds confidence, and opens doors to new opportunities.
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
              Our lessons program is designed to provide consistent, high-quality instruction throughout the school year. Students benefit from weekly one-hour lessons, opportunities to perform in public recitals and showcases, and a curriculum that aligns with our ensemble programs and the Royal Conservatory of Music (RCM) framework.
            </p>
            <p className="text-muted-foreground text-lg">
              The Lessons Program is a foundational pillar in the KYO’s broader ecosystem. It directly supports student progression into our many ensembles, including orchestras, jazz, wind, and chamber groups. This interconnected approach strengthens learning, builds peer connections, and improves retention over time.
            </p>
          </div>
        </div>
      </section>

      <section className='bg-secondary'>
        <div className="container mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-primary text-primary-foreground h-full flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4">
                <Music className="w-8 h-8 mt-1"/>
                <div>
                    <CardTitle className="font-headline text-2xl">A Pathway to Performance</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Every student has the opportunity to perform three times annually in studio recitals and KYO ensemble concerts.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>Ensemble participation provides real-world performance experience that reinforces learning goals and builds artistry. Lesson instruction is synchronized with our orchestra programming, creating a seamless path from individual growth to ensemble excellence.</p>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild variant="secondary">
                  <Link href="/orchestras">Explore Our Ensembles</Link>
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
                <p className="text-muted-foreground">Ready to take the next step? Register today to be matched with an instructor and schedule your first lesson. No prior experience is required for many of our beginner programs!</p>
                <Button asChild className="mt-4 w-full">
                  <Link href="/register">Register for Lessons</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
