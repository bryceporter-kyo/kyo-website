import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Music, Users, GraduationCap, Heart, Handshake, Eye, HandCoins, UserCheck, DollarSign, Group } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getAnnouncements } from '@/lib/announcements';

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
]

const impactStats = [
    { number: '700+', label: 'Musicians Supported', icon: Users },
    { number: '2,700+', label: 'Community Members Impacted', icon: Group },
    { number: '$70k+', label: 'Annual Subsidies Provided', icon: DollarSign },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-concert');
  const newsImage = PlaceHolderImages.find(p => p.id === 'home-news');
  const financialAidImage = PlaceHolderImages.find(p => p.id === 'home-financial-aid');
  const announcements = getAnnouncements().slice(0, 3);

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white p-0">
          {heroImage && (
             <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 container mx-auto px-4 md:px-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tight">
              Nurturing the Next Generation of Musicians
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-neutral-200">
              KYO Hub provides exceptional music education and performance opportunities to young people, fostering artistic excellence, personal growth, and a lifelong love of music.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-bold">
                <Link href="/register">Register Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link href="/support">Support Us</Link>
              </Button>
            </div>
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

        <section id="news" className="bg-background">
          <div className="container mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl">Latest News</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                Stay up-to-date with the latest happenings at KYO Hub.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2 grid grid-cols-1 gap-8">
                  {announcements.map((item) => (
                    <Card key={item.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-xl font-headline">{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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

        <section className="bg-secondary">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-headline font-bold">Financial Aid & Scholarships</h2>
                    <p className="text-muted-foreground md:text-lg">
                        We believe in nurturing the musical talents of all young individuals, regardless of their financial background. That’s why we offer a range of financial aid options and scholarships to support our aspiring musicians. Our scholarships are designed to recognize dedication, talent, and the pursuit of musical excellence, while our financial aid program ensures that no student misses out on the opportunity to grow and excel due to economic constraints. We invite you to explore these opportunities and join our community of passionate young artists.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                         <Card>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <HandCoins className="h-8 w-8 text-primary"/>
                                <p className="text-3xl font-bold">$100k+</p>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold">In annual bursaries</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <UserCheck className="h-8 w-8 text-primary"/>
                                <p className="text-3xl font-bold">120+</p>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold">Students supported annually</p>
                            </CardContent>
                        </Card>
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

        <section className="bg-background">
             <div className="container mx-auto text-center">
                <h2 className="text-3xl font-headline font-bold">Support Kawartha Youth Orchestra</h2>
                <p className="text-muted-foreground md:text-lg max-w-3xl mx-auto mt-4">
                    Support KYO’s mission through various means. Donate funds, volunteer your time, or gift instruments. Every contribution helps us nurture young musical talent and enrich our community.
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


        <section id="support" className="bg-secondary">
          <div className="container mx-auto">
            <div className="rounded-lg bg-primary text-primary-foreground p-8 md:p-12 text-center">
              <h2 className="text-3xl font-headline font-bold">Support Our Mission</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
                Your generosity empowers us to provide transformative musical experiences for young people. Help us continue our work by making a donation or learning about other ways to contribute.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                  <Link href="/donate">Donate Today</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/support">Ways to Give</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
