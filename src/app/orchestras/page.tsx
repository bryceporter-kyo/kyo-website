
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, HandHeart, Music } from 'lucide-react';

const orchestras = [
  {
    title: 'Junior Kawartha Youth Orchestra (JKYO)',
    schedule: 'Tuesdays, 6:15–7:30 PM | Starts September 17',
    description: 'The perfect first ensemble for young string, wind, and brass players. JKYO is designed for students who can confidently produce a sound and are ready to learn the fundamentals of playing in a group. We focus on rhythm, tone, and building confidence in a fun, supportive setting.',
  },
  {
    title: 'Intermediate Kawartha Youth Orchestra (IKYO)',
    schedule: 'Thursdays, 6:15–7:45 PM',
    description: 'Take your skills to the next level in a full orchestra! At IKYO, students who can read music and learn their parts with some independence will explore exciting classical and popular repertoire. Includes specialized coaching to help you grow.',
  },
  {
    title: 'Senior Kawartha Youth Orchestra (SKYO)',
    schedule: 'Sundays, 2:30–4:15 PM | Biweekly Sectionals',
    description: 'Our premier ensemble for advanced musicians ready for a challenge. SKYO performs professional-level orchestral music, from classical masterworks to modern film scores, offering top-tier training, mentorship, and performance opportunities.',
  },
];

const supplementaryEnsembles = [
    { title: 'Junior Folk Ensemble', schedule: 'Thursdays, 5:30–6:15 PM', description: 'Explore the vibrant worlds of Celtic and global folk traditions. This group is open to a wide range of instruments and is perfect for students who love lively, rhythmic music.'},
    { title: 'Senior Jazz Combo', schedule: 'Sundays, 4:30–5:30 PM', description: 'Dive into the heart of jazz. This combo explores swing, blues, Latin music, and more, with a focus on developing improvisation and accompaniment skills in a small group setting.'},
    { title: 'Senior Chamber Music', schedule: 'Sundays, 12:30–5:30 PM (biweekly)', description: 'Experience the art of small ensemble playing. Receive coaching from professional musicians and collaborate closely with peers to perform beautiful and intricate chamber music.'},
];


export default function OrchestrasPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-orchestras');

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
                <h2 className="text-3xl font-headline font-bold">The Heart of KYO: Join an Orchestra</h2>
                <p className="text-muted-foreground text-lg">
                    The Orchestras Program is our core educational initiative. It’s where individual talent blossoms into collective artistry. We offer a structured, progressive suite of ensembles designed to help young musicians advance their skills from their first notes to pre-professional levels.
                </p>
                <p className="text-muted-foreground text-lg">
                    With a focus on accessibility, we welcome youth from all backgrounds and experience levels into a safe, inclusive environment where they can make friends, build confidence, and share in the joy of making music. We believe music is for everyone, and we are committed to removing financial barriers so that every student has the chance to play.
                </p>
                <Button asChild size="lg">
                    <Link href="/register">Join an Ensemble</Link>
                </Button>
            </div>
             <Card className="bg-secondary">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Users className="w-8 h-8 text-primary"/>
                        <CardTitle className="font-headline text-2xl">Who is it For?</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Our orchestras serve over 120 youth annually, aged 7 to 22. While some ensembles require baseline skills, many are open to complete beginners. If you have a passion for music and a desire to learn, there’s a place for you here. No student is ever turned away due to financial need.</p>
                     <div className="flex items-start gap-4 pt-4">
                        <HandHeart className="w-12 h-12 text-accent mt-1"/>
                        <div>
                            <h4 className="font-bold">Our Commitment to Access</h4>
                            <p className="text-muted-foreground text-sm">We strive to remove financial barriers through universal subsidies and needs-based bursaries, ensuring every young person has the opportunity to participate.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Core Orchestras</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Our three core orchestras provide a clear path for students to grow as musicians, from their first notes to advanced symphonies. Find your place and start your journey today.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {orchestras.map((item) => (
                    <Card key={item.title} className="text-left flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{item.title}</CardTitle>
                            <CardDescription>{item.schedule}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                            <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                        <CardFooter>
                           <Button asChild className="w-full">
                                <Link href="/register">Register Now</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
      </section>

       <section>
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">Specialty Ensembles</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Ready to explore a new sound? Dive into different genres and styles of music in our smaller, specialized ensembles. These groups offer a chance to hone specific skills like improvisation and small-group collaboration.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {supplementaryEnsembles.map((item) => (
                    <Card key={item.title} className="text-left flex flex-col">
                         <CardHeader>
                            <div className="flex items-center gap-4">
                                <Music className="w-8 h-8 text-primary"/>
                                <CardTitle>{item.title}</CardTitle>
                            </div>
                            <CardDescription>{item.schedule}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                            <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                         <CardFooter>
                           <Button asChild className="w-full" variant="secondary">
                                <Link href="/register">Learn About Auditions</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}
