
"use client";

import PageHeader from "@/components/shared/PageHeader";
import { useImages } from "@/components/providers/ImageProvider";
import { Award, Users, DollarSign, Group, GraduationCap, HeartHandshake, User, Briefcase, Music, Smile, TrendingUp, Handshake, Heart, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import HorizontalTimeline from "@/components/shared/HorizontalTimeline";
import React from "react";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import FadeIn from "@/components/shared/animations/FadeIn";
import SlideIn from "@/components/shared/animations/SlideIn";
import { StaggerContainer, StaggerItem } from "@/components/shared/animations/Stagger";
import ValuesOrbiter from "@/components/shared/ValuesOrbiter";

const values = [
    { 
        title: 'Artistry', 
        description: 'We are committed to musical excellence. We cultivate a deep love of music and inspire young musicians to pursue their craft with ambition, expression, and pride.',
        icon: Music,
        color: 'bg-blue-500'
    },
    { 
        title: 'Joy', 
        description: 'We believe music should be fun. We bring energy, positivity, and inspiration to everything we do, celebrating the joy of making music together.',
        icon: Smile,
        color: 'bg-yellow-500'
    },
    { 
        title: 'Inclusion', 
        description: 'We welcome every young person, regardless of background or experience. We are committed to accessibility, fairness, and building a community where everyone belongs.',
        icon: Users,
        color: 'bg-green-500'
    },
    { 
        title: 'Growth', 
        description: 'We support young musicians in developing not just their musical skills, but their confidence and resilience. We encourage responsibility, authenticity, and a commitment to continuous improvement on and off the stage.',
        icon: TrendingUp,
        color: 'bg-purple-500'
    },
    { 
        title: 'Connection', 
        description: 'We believe in the power of music to bring people together. Through collaboration, mentorship, and community partnerships, we create meaningful relationships that extend beyond the concert hall.',
        icon: Handshake,
        color: 'bg-orange-500'
    },
    { 
        title: 'Nurture', 
        description: 'We are a safe and caring community. We lead with encouragement and heart, supporting every young person in discovering what they are capable of.',
        icon: Heart,
        color: 'bg-red-500'
    },
];

const communityRoles = [
    { 
        title: 'Students', 
        description: 'Youth united by their passion for music, forging bonds, sharing laughter, and forming lasting friendships.', 
        icon: GraduationCap,
        imageKey: 'orchestra-kids-playing'
    },
    { 
        title: 'Parents', 
        description: 'Witnessing their children flourish, building connections through volunteer efforts and fundraising.', 
        icon: HeartHandshake,
        imageKey: 'support-volunteer'
    },
    { 
        title: 'Instructors', 
        description: 'Professional musicians who recognize that the joy of making music is a timeless treasure to be passed on.', 
        icon: User,
        imageKey: 'lessons-teacher-student'
    },
    { 
        title: 'Board & Donors', 
        description: 'Dedicated individuals and businesses whose expertise and support advance our mission and sustain our programs.', 
        icon: Briefcase,
        imageKey: 'page-header-support'
    },
]

export default function AboutPage() {
    const { getImage } = useImages();
    const headerImage = getImage('page-header-orchestras');
    const aboutImage = getImage('program-orchestra');
    const [seasonsOfExcellence, setSeasonsOfExcellence] = React.useState<number | null>(null);

    React.useEffect(() => {
        const startDate = new Date(2002, 8, 19); // September 19, 2002
        const today = new Date();
        let diffYears = today.getFullYear() - startDate.getFullYear();
        
        // Adjust if we haven't reached the anniversary date yet this year
        const hasReachedAnniversary = 
            today.getMonth() > startDate.getMonth() || 
            (today.getMonth() === startDate.getMonth() && today.getDate() >= startDate.getDate());
            
        if (!hasReachedAnniversary) {
            diffYears--;
        }
        
        setSeasonsOfExcellence(diffYears);
    }, []);

    return (
        <div>
            <PageHeader
                title="Discover the Heart of KYO"
                subtitle="Where passion for music meets a community dedicated to nurturing the next generation of musicians."
                image={headerImage}
            />
            <section className="container mx-auto overflow-hidden relative py-20 md:py-28">
                {/* Decorative background element */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
                
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <SlideIn direction="right" className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                                <Award className="w-3 h-3" /> Our Legacy
                            </div>
                            <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
                                {seasonsOfExcellence ? `${seasonsOfExcellence} Seasons of Excellence` : 'Seasons of Excellence'}
                            </h2>
                        </div>
                        <div className="space-y-6">
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Kawartha Youth Orchestra is a vibrant community organization offering music and orchestra training to youth from elementary to post-secondary levels. Drawing students from across the Kawartha Region, we provide opportunities for young musicians seeking to go beyond their school music programs.
                            </p>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                               As a registered non-profit, KYO proudly collaborates with local schools, private instructors, and community organizations to support and develop our student musicians under the guidance of seasoned conductors and faculty.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Button asChild variant="outline" className="group">
                                <Link href='/programs/orchestras' className="flex items-center gap-2">
                                    Explore Our Programs <Music className="w-4 h-4 transition-transform group-hover:rotate-12" />
                                </Link>
                            </Button>
                        </div>
                    </SlideIn>
                    
                    {aboutImage && (
                        <SlideIn direction="left" className="relative">
                            <div className="absolute -inset-4 bg-primary/5 rounded-3xl -rotate-3 -z-10" />
                            <div className="absolute -inset-4 border border-primary/10 rounded-3xl rotate-2 -z-10" />
                            <div className="rounded-2xl overflow-hidden shadow-2xl group relative aspect-[4/3]">
                                <Image
                                    src={aboutImage.imageUrl}
                                    alt={aboutImage.description}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    data-ai-hint={aboutImage.imageHint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </SlideIn>
                    )}
                </div>
            </section>
            
            <section className="bg-secondary relative overflow-hidden py-24">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                <div className="container mx-auto relative z-10">
                     <FadeIn className="text-center mb-24 md:mb-32">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                            <Sparkles className="w-3 h-3" /> Our Foundation
                        </div>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold">Our Core Values</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-6">
                            Interact with our values to see what drives the Kawartha Youth Orchestra.
                        </p>
                    </FadeIn>
                    
                    <FadeIn>
                        {/* Values Orbiter - Icons removed & layout fixed */}
                        <ValuesOrbiter values={values} />
                    </FadeIn>
                </div>
            </section>
            
            <section className="container mx-auto py-24 md:py-32 relative">
                {/* Decorative dots background */}
                <div className="absolute right-0 top-1/4 w-32 h-64 opacity-10 pointer-events-none hidden lg:block" 
                     style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                
                 <FadeIn className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-headline font-bold">We Are a Community</h2>
                    <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-6">
                        KYO is a collective of passionate individuals dedicated to the transformative power of music.
                    </p>
                </FadeIn>
                
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {communityRoles.map(role => {
                        const img = getImage(role.imageKey);
                        return (
                            <StaggerItem direction="up" key={role.title}>
                                <Card className="h-full border-primary/5 bg-white/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:bg-white group overflow-hidden flex flex-col">
                                    <div className="relative h-48 overflow-hidden">
                                        {img && (
                                            <Image 
                                                src={img.imageUrl} 
                                                alt={role.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                    <CardHeader className="pb-4 relative">
                                        <div className="absolute -top-6 right-6 w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                            <role.icon className="w-6 h-6"/>
                                        </div>
                                        <CardTitle className="font-headline text-2xl pt-2">{role.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-muted-foreground leading-relaxed">{role.description}</p>
                                    </CardContent>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                </Card>
                            </StaggerItem>
                        );
                   })}
                </StaggerContainer>
            </section>

             <section className="bg-secondary">
                <HorizontalTimeline />
            </section>

            <section className="py-24">
                 <FadeIn className="container mx-auto px-4 md:px-0">
                    <div className="relative rounded-[2.5rem] bg-[#0a3d2c] text-white p-10 md:p-20 text-center overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                        {/* Decorative background elements for CTA */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -ml-48 -mb-48" />
                        
                        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                            <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">Support Our Future</h2>
                            <p className="text-xl md:text-2xl text-green-50/80 leading-relaxed">
                                Your contribution helps us continue to nurture young talent and enrich our community through music. Every donation makes a difference.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                                <Button asChild size="xl" className="bg-white hover:bg-green-100 text-[#0a3d2c] font-bold h-14 px-10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <Link href='/support-us/donate'>Donate Today</Link>
                                </Button>
                                <Button asChild size="xl" variant="outline" className="bg-transparent border-white/40 text-white hover:text-white hover:bg-white/10 h-14 px-10 rounded-full backdrop-blur-sm transition-all duration-300">
                                    <Link href='/support-us/ways-to-give'>More Ways to Give</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </section>
        </div>
    );
}
