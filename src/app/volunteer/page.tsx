
"use client";

import { useState } from 'react';
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Heart, Handshake, Gift, Star, Ticket, Users, Camera, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getLinkById } from '@/lib/links';
import buttonData from '@/lib/buttons.json';

type ButtonConfig = {
    id: string;
    location: string;
    text: string;
    link: { type: 'internal' | 'external', value: string };
    visible: boolean;
};

const volunteerRoles = [
    {
        icon: Ticket,
        title: "Concert & Event Support",
        description: "Be the friendly face of KYO at our performances. Help with ushering, ticket-taking, and merchandise sales. Your support ensures our concerts run smoothly and our audiences have a wonderful experience.",
    },
    {
        icon: Users,
        title: "Program Assistance (Upbeat!)",
        description: "Lend a hand during our weekly Upbeat! program. Assist with student check-in, meal prep and service, and setup/teardown. Your presence helps create a safe and organized environment for our young musicians.",
    },
    {
        icon: Wrench,
        title: "Technical Skills",
        description: "Put your specific talents to use. We need help with instrument maintenance, photography, digital recording, and post-production. Your expertise amplifies our knowledge and enhances our programs.",
    },
    {
        icon: Handshake,
        title: "Operational & Admin Support",
        description: "Are you a whiz at bookkeeping, data management, or event coordination? Help our day-to-day operations run smoothly. Your organizational skills are invaluable to our mission's success.",
    },
]

export default function VolunteerPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-volunteer');
    const volunteerImage = PlaceHolderImages.find(p => p.id === 'support-volunteer');
    const volunteerCtaImage = PlaceHolderImages.find(p => p.id === 'volunteer-cta');
    const [buttons] = useState<ButtonConfig[]>(buttonData.buttons as ButtonConfig[]);

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

    const mainButton = getButtonProps(buttons.find(b => b.id === 'volunteer-signup'));
    const secondaryButton = getButtonProps(buttons.find(b => b.id === 'volunteer-signup-secondary'));

    return (
        <div>
            <PageHeader
                title="Volunteer With Us"
                subtitle="Share your time and talent to empower the next generation of musicians."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-headline font-bold">Be the Heartbeat of KYO</h2>
                        <p className="text-muted-foreground text-lg">
                            Volunteers are essential to everything we do. From concert halls to classrooms, your energy and dedication create a vibrant, supportive community where young musicians can thrive. Many minds and hands make light work of the numerous tasks required to sustain our programs.
                        </p>
                        <p className="text-muted-foreground text-lg">
                            By giving your time, you become a partner in our mission and a role model for our students. Whether you have specialized skills or simply a passion for music and community, there’s a place for you here.
                        </p>
                         {mainButton && (
                           <Button asChild size="lg">
                              <Link href={mainButton.href} target={mainButton.target} rel={mainButton.target === '_blank' ? 'noopener noreferrer' : ''}>{mainButton.text}</Link>
                          </Button>
                         )}
                    </div>
                    {volunteerImage && (
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={volunteerImage.imageUrl}
                                alt={volunteerImage.description}
                                width={600}
                                height={400}
                                className="object-cover w-full h-full"
                                data-ai-hint={volunteerImage.imageHint}
                            />
                        </div>
                    )}
                </div>
            </section>
            
            <section className="bg-secondary">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-headline font-bold">How You Can Help</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                            We have a variety of roles to match your skills, interests, and availability. Find the perfect fit and make a real difference.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {volunteerRoles.map(role => (
                             <Card key={role.title} className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="items-center">
                                     <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                        <role.icon className="w-8 h-8" />
                                    </div>
                                    <CardTitle className="font-headline text-xl pt-4">{role.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{role.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

             <section>
                 <div className="container mx-auto">
                    <div className="rounded-lg bg-primary text-primary-foreground p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center overflow-hidden">
                        <div className="text-center md:text-left relative z-10">
                            <h2 className="text-3xl font-headline font-bold">Ready to Make a Difference?</h2>
                            <p className="mt-4 max-w-xl mx-auto md:mx-0 text-lg text-primary-foreground/80">
                                Your contribution of time and expertise is one of the most valuable gifts you can give. Join our dedicated community and help us inspire the next generation of musicians.
                            </p>
                            <div className="mt-8 flex justify-center md:justify-start">
                                {secondaryButton && (
                                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                                      <Link href={secondaryButton.href} target={secondaryButton.target} rel={secondaryButton.target === '_blank' ? 'noopener noreferrer' : ''}>{secondaryButton.text}</Link>
                                  </Button>
                                )}
                            </div>
                        </div>
                         {volunteerCtaImage && (
                            <div className="relative h-64 md:h-full">
                                <Image
                                    src={volunteerCtaImage.imageUrl}
                                    alt={volunteerCtaImage.description}
                                    fill
                                    className="object-cover rounded-lg"
                                    data-ai-hint={volunteerCtaImage.imageHint}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

    