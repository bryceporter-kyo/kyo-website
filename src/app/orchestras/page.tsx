import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Users, Leaf, HandHeart, Sparkles, HandCoins, GraduationCap } from 'lucide-react';

const orchestras = [
  {
    title: 'Junior Kawartha Youth Orchestra (JKYO)',
    schedule: 'Tuesdays, 6:15–7:30 PM | Starts September 17',
    fee: '$850/year',
    description: 'The first ensemble experience for young string, wind, and brass players, designed for those who can confidently produce a sound. Targets RCM Grades 1–2, focusing on rhythm, tone, and basic ensemble skills.',
  },
  {
    title: 'Intermediate Kawartha Youth Orchestra (IKYO)',
    schedule: 'Thursdays, 6:15–7:45 PM',
    fee: '$975/year',
    description: 'A full orchestra experience with classical and popular repertoire for students who can read music and learn parts semi-independently. Includes sectional instruction. Targets RCM Grades 3–5.',
  },
  {
    title: 'Senior Kawartha Youth Orchestra (SKYO)',
    schedule: 'Sundays, 2:30–4:15 PM | Biweekly Sectionals',
    fee: '$975/year',
    description: 'The premier KYO ensemble for advanced musicians (RCM Grade 6+). Plays orchestral standards, pop arrangements, and more, offering professional-level training and mentorship.',
  },
];

const beginnerLessons = [
  { title: 'Beginner Strings (Violin, Viola, Cello)', schedule: 'Tuesdays, 6:15–7:00 PM', fee: '$850/year' },
  { title: 'Beginner Brass (Trumpet, Trombone, etc.)', schedule: 'Wednesdays, 6:15–7:00 PM', fee: '$850/year' },
  { title: 'Beginner Flute', schedule: 'Thursdays, 6:15–7:00 PM', fee: '$850/year' },
  { title: 'Beginner Percussion (Age 10+)', schedule: 'Thursdays, 6:15–7:30 PM', fee: '$975/year', note: 'Includes performance integration with IKYO' },
  { title: 'Beginner Guitar', schedule: 'Sundays, 12:30–1:15 PM', fee: '$850/year', note: 'Students must provide their own instrument' },
];

const intermediateLessons = [
    { title: 'Intermediate Clarinet & Saxophone', schedule: 'Tuesdays, 6:00–6:45 PM', fee: '$850/year', description: 'Designed for youth preparing for entry into SKYO.' },
];

const supplementary = [
    { title: 'Junior Folk Ensemble', schedule: 'Thursdays, 5:30–6:15 PM', fee: '$975/year', description: 'Focus on Celtic and global folk traditions for a wide range of instruments.'},
    { title: 'Senior Jazz Combo', schedule: 'Sundays, 4:30–5:30 PM', fee: '$975/year', description: 'Repertoire includes swing, blues, Latin, and more; instruction in improvisation and accompaniment.'},
    { title: 'Senior Chamber Music', schedule: 'Sundays, 12:30–5:30 PM (biweekly)', fee: '$600/year', description: 'Small ensemble coaching with professionals. Available to confident classical musicians.'},
];

const courses = [
    { title: 'Digital Music Production', schedule: 'Term 1: Thursdays, 7:30–8:15 PM', fee: '$500/term', description: 'Learn recording, DAW use, and production skills in any genre.'},
    { title: 'Theory', schedule: 'Term 2: Thursdays, 7:30–8:15 PM', fee: '$500/term', description: 'Covers harmony, form, analysis, and styles beyond classical.'},
    { title: 'Composition', schedule: 'Term 3: Thursdays, 7:30–8:15 PM', fee: '$500/term', description: 'Write original music for soloists and chamber groups; includes coaching and score preparation.'},
]

const outcomes = [
    "Build progressive musical and ensemble skills",
    "Develop confidence, discipline, and creative expression",
    "Learn diverse musical styles and cultural approaches to music",
    "Engage in mentorship with professional musicians and peers",
    "Access pathways to performance, teaching, and post-secondary music study",
    "Foster lifelong engagement with music"
]

export default function OrchestrasPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-orchestras');

  return (
    <div>
      <PageHeader
        title="The Orchestras"
        subtitle="Supporting Youth Music Education Through Ensemble, Instruction, and Accessibility."
        image={headerImage}
      />

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold">Our Core Educational Initiative</h2>
                <p className="text-muted-foreground text-lg">
                    The Orchestras Program is the KYO’s core educational initiative: a structured, progressive suite of orchestras, group lessons, and creative music education courses that help youth advance their skills from beginner to professional level.
                </p>
                <p className="text-muted-foreground text-lg">
                    With built-in universal subsidies and additional income-based bursaries, the program is designed to be inclusive and accessible—no student is turned away due to financial need. Youth from all backgrounds, musical traditions, and experience levels are welcomed into a safe and inclusive environment where they can grow musically and personally.
                </p>
                <Button asChild size="lg">
                    <Link href="/register">Register Now</Link>
                </Button>
            </div>
             <Card className="bg-secondary">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Users className="w-8 h-8 text-primary"/>
                        <CardTitle className="font-headline text-2xl">Who We Serve</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">The KYO serves over 120 youth annually, aged 7 to 22. While some programs require a baseline skill level, many are open to complete beginners with no prior experience.</p>
                     <div className="flex items-start gap-4 pt-4">
                        <HandHeart className="w-12 h-12 text-accent mt-1"/>
                        <div>
                            <h4 className="font-bold">Accessibility & Inclusion</h4>
                            <p className="text-muted-foreground text-sm">We remove financial barriers through subsidies, offer free instrument loans, and foster a safe, inclusive environment for all students, including partnerships with the New Canadians Centre.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-headline font-bold">Our Programs</h2>
            <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                We offer a wide range of ensembles, lessons, and courses to meet students at every stage of their musical journey. All programs operate weekly throughout the school year (September to June).
            </p>
            <Tabs defaultValue="orchestras" className="mt-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 md:grid-cols-5 h-auto">
                <TabsTrigger value="orchestras">Orchestras</TabsTrigger>
                <TabsTrigger value="beginner">Beginner Lessons</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="ensembles">Ensembles</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>
            <TabsContent value="orchestras" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orchestras.map((item) => (
                        <Card key={item.title} className="text-left">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.schedule}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{item.description}</p>
                                <p className="font-bold text-lg">{item.fee}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="beginner" className="mt-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {beginnerLessons.map((item) => (
                        <Card key={item.title} className="text-left">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.schedule}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-lg font-bold">{item.fee}</p>
                                {item.note && <p className="text-sm text-muted-foreground italic">{item.note}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="intermediate" className="mt-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-lg mx-auto">
                    {intermediateLessons.map((item) => (
                        <Card key={item.title} className="text-left">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.schedule}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{item.description}</p>
                                <p className="font-bold text-lg">{item.fee}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
             <TabsContent value="ensembles" className="mt-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {supplementary.map((item) => (
                        <Card key={item.title} className="text-left">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.schedule}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{item.description}</p>
                                <p className="font-bold text-lg">{item.fee}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="courses" className="mt-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((item) => (
                        <Card key={item.title} className="text-left">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.schedule}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <p className="text-muted-foreground">{item.description}</p>
                                <p className="font-bold text-lg">{item.fee}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
            </Tabs>
        </div>
      </section>

      <section>
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold">Artistic Vision & Philosophy</h2>
                <p className="text-muted-foreground text-lg">
                    Our program is anchored in the classical tradition but embraces a broad repertoire, including pop, film music, and works by Canadian composers. We follow an RCM equivalency model to track student progression, and our experienced instructors meet students where they are to inspire growth. Public performance is a key element, with at least three public concerts per year.
                </p>
                 <ul className="space-y-3">
                    {outcomes.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                            <Check className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
                            <span className="text-lg text-muted-foreground">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="space-y-8">
                 <Card>
                    <CardHeader className="flex-row items-center gap-4">
                        <GraduationCap className="w-8 h-8 text-primary"/>
                        <CardTitle>Outcomes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Our vision is to produce not just skilled musicians, but empowered young people who are confident, expressive, and socially engaged. The program contributes to stronger community ties and helps foster lifelong engagement with music.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center gap-4">
                        <HandCoins className="w-8 h-8 text-primary"/>
                        <CardTitle>Budget & Sustainability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">All program fees are subsidized by up to 65% compared to private lessons, and income-based bursaries are available to ensure no student is excluded. This accessible model is made possible by the generous support of our donors and grantors.</p>
                         <Button asChild variant="secondary" className="mt-4">
                            <Link href="/donate">Support Our Mission</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </section>

    </div>
  );
}
