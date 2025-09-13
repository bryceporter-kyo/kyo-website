import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Music, Users, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

const newsItems = [
  {
    id: 1,
    title: 'KYO Hub Announces a New Season of Music and Growth',
    date: 'August 15, 2024',
    excerpt: 'We are thrilled to unveil our 2024-2025 season, packed with exciting concerts, new learning opportunities, and community events. Join us for another year of exceptional music-making!'
  },
  {
    id: 2,
    title: 'Meet Our Newest Instructor: Dr. Eleanor Vance',
    date: 'August 1, 2024',
    excerpt: 'We warmly welcome Dr. Eleanor Vance, a renowned cellist and educator, to our Lessons Program faculty. Her expertise and passion will be a great asset to our students.'
  },
  {
    id: 3,
    title: 'Successful Spring Gala Raises Funds for Scholarships',
    date: 'July 20, 2024',
    excerpt: 'A heartfelt thank you to all our supporters! Our recent Spring Gala was a resounding success, raising critical funds to support our student scholarship program.'
  }
]

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-concert');

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

        <section id="news" className="bg-secondary">
          <div className="container mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl">Latest News</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                Stay up-to-date with the latest happenings at KYO Hub.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((item) => (
                <Card key={item.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl font-headline">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{item.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="support" className="bg-background">
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
