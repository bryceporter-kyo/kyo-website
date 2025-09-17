import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Award, Users, DollarSign, Group, GraduationCap, HeartHandshake, User, Briefcase } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import HorizontalTimeline from "@/components/shared/HorizontalTimeline";

const stats = [
    { number: '70+', label: 'Concerts Performed', icon: Award },
    { number: '700+', label: 'Musicians Supported', icon: Users },
    { number: '2,700+', label: 'Community Members Impacted', icon: Group },
    { number: '$70k+', label: 'Annual Subsidies Provided', icon: DollarSign },
];

const communityRoles = [
    { title: 'Students', description: 'Youth united by their passion for music, forging bonds, sharing laughter, and forming lasting friendships.', icon: GraduationCap },
    { title: 'Parents', description: 'Witnessing their children flourish, building connections through volunteer efforts and fundraising.', icon: HeartHandshake },
    { title: 'Instructors', description: 'Professional musicians who recognize that the joy of making music is a timeless treasure to be passed on.', icon: User },
    { title: 'Board & Donors', description: 'Dedicated individuals and businesses whose expertise and support advance our mission and sustain our programs.', icon: Briefcase },
]

export default function AboutPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-orchestras');
    const aboutImage = PlaceHolderImages.find(p => p.id === 'program-orchestra');
    const seasonsOfExcellence = new Date().getFullYear() - 2002;

    return (
        <div>
            <PageHeader
                title="Discover the Heart of KYO"
                subtitle="Where passion for music meets a community dedicated to nurturing the next generation of musicians."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-headline font-bold">{seasonsOfExcellence} Seasons of Excellence</h2>
                        <p className="text-muted-foreground text-lg">
                            Kawartha Youth Orchestra is a vibrant community organization offering music and orchestra training to youth from elementary to post-secondary levels. Drawing students from across the Kawartha Region, we provide opportunities for young musicians seeking to go beyond their school music programs.
                        </p>
                         <p className="text-muted-foreground text-lg">
                           As a registered non-profit, KYO proudly collaborates with local schools, private instructors, and community organizations to support and develop our student musicians under the guidance of seasoned conductors and faculty.
                        </p>
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
                        <h2 className="text-3xl font-headline font-bold">Our Impact</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                            For over two decades, we've been a cornerstone of arts education in the community.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map(stat => (
                            <Card key={stat.label} className="text-center">
                                <CardHeader className="items-center">
                                    <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                        <stat.icon className="w-8 h-8" />
                                    </div>
                                    <p className="text-4xl font-bold pt-4">{stat.number}</p>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground font-semibold">{stat.label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold">We Are a Community</h2>
                    <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                        KYO is a collective of passionate individuals dedicated to the power of music.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {communityRoles.map(role => (
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
            </section>

             <section className="bg-secondary">
                <HorizontalTimeline />
            </section>

            <section>
                 <div className="container mx-auto">
                    <div className="rounded-lg bg-primary text-primary-foreground p-8 md:p-12 text-center">
                        <h2 className="text-3xl font-headline font-bold">Support Our Future</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
                            Your contribution helps us continue to nurture young talent and enrich our community through music. Every donation makes a difference.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                            <Link href="/donate">Donate Today</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                            <Link href="/support">More Ways to Give</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
