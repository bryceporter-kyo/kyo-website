"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Music, GraduationCap, Calendar, Heart, Mail, ArrowRight } from "lucide-react";
import FadeIn from "@/components/shared/animations/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/shared/animations/Stagger";

const popularLinks = [
  { title: "Home", href: "/", icon: Home, description: "Return to our homepage." },
  { title: "The Orchestras", href: "/programs/orchestras", icon: Music, description: "Learn about our flagship ensembles." },
  { title: "Upbeat!", href: "/programs/upbeat", icon: GraduationCap, description: "Discover our introductory program." },
  { title: "Calendar", href: "/programs/calendar", icon: Calendar, description: "See upcoming concerts and events." },
  { title: "Support Us", href: "/support-us/ways-to-give", icon: Heart, description: "Help us keep the music playing." },
  { title: "Contact", href: "/contact", icon: Mail, description: "Get in touch with our team." },
];

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 py-20 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 -ml-48" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 -mr-48" />
        
        <FadeIn className="text-center space-y-6 max-w-2xl mx-auto mb-16">
            <h1 className="text-9xl font-headline font-bold text-primary opacity-10">404</h1>
            <h2 className="text-4xl md:text-5xl font-headline font-bold mt-[-4rem] relative z-10">Lost in the Music?</h2>
            <p className="text-xl text-muted-foreground relative z-10">
                We couldn't find the page you're looking for. It might have moved, or the link might be broken.
            </p>
            <div className="pt-4 relative z-10">
                <Button asChild size="lg" className="rounded-full h-12 px-8 text-base">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Return Home
                    </Link>
                </Button>
            </div>
        </FadeIn>

        <div className="container mx-auto max-w-5xl relative z-10">
            <FadeIn>
                <h3 className="text-2xl font-headline font-semibold text-center mb-8">Let's help you find your way</h3>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularLinks.map((link) => (
                    <StaggerItem key={link.href} direction="up">
                        <Card className="h-full group hover:shadow-xl hover:border-primary/50 transition-all duration-300">
                            <CardHeader className="pb-3">
                                <div className="p-3 bg-primary/10 w-fit rounded-lg text-primary mb-2 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <link.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">{link.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">{link.description}</CardDescription>
                                <Button asChild variant="ghost" className="p-0 h-auto font-semibold text-primary group-hover:underline bg-transparent hover:bg-transparent">
                                    <Link href={link.href} className="flex items-center">
                                        Visit Page <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </div>
    </div>
  );
}
