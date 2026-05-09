"use client";

import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImages } from "@/components/providers/ImageProvider";
import { Gift, Handshake, Heart, ArrowRight, Sparkles, Star, Users, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const supportOptions = [
    {
        icon: Heart,
        title: "Volunteer Your Time",
        description: "We rely on dedicated volunteers to help with concerts, events, and administrative tasks. Whether you can help usher at a concert, assist with mailings, or serve on a committee, your time and talent are invaluable to us.",
        cta: "Become a Volunteer",
        color: "bg-rose-500",
        delay: 0.1
    },
    {
        icon: Briefcase,
        title: "Corporate Sponsorships",
        description: "Partner with KYO Hub to support the arts in our community while gaining visibility for your business. Align your brand with artistic excellence and youth development through our tailored sponsorship packages.",
        cta: "Learn About Sponsorship",
        color: "bg-amber-500",
        delay: 0.2
    },
    {
        icon: Gift,
        title: "In-Kind Donations",
        description: "Non-monetary contributions are a great way to support our mission. We welcome donations of instruments, office supplies, and professional services such as printing, marketing, or photography.",
        cta: "Make an In-Kind Gift",
        color: "bg-emerald-500",
        delay: 0.3
    }
];

export default function SupportPage() {
    const { getImage } = useImages();
    const headerImage = getImage('page-header-support');
    const supportImage = getImage('support-volunteer');
    const supportCtaImage = getImage('support-cta');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 20 }
        }
    };

    return (
        <div className="relative overflow-hidden bg-background min-h-screen">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <PageHeader
                title="Support KYO"
                subtitle="Join our community of supporters and help nurture the next generation of musical excellence."
                image={headerImage}
            />

            {/* Narrative Section */}
            <section className="py-32 px-4">
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10">
                                <Star className="w-3 h-3" />
                                <span>Impact Beyond Music</span>
                            </div>
                            <h2 className="text-5xl font-headline font-bold leading-tight">More Than Just a Donation</h2>
                            <div className="space-y-6 text-muted-foreground text-lg font-light leading-relaxed">
                                <p>
                                    Financial contributions are vital, but your support can come in many forms. By giving your time, resources, or expertise, you become a partner in our mission to nurture young musicians. Every act of support helps us create a vibrant and accessible musical community.
                                </p>
                                <p>
                                    Explore the options below to find the best way for you to make an impact. We are deeply grateful for our community of supporters who make our work possible.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <h4 className="text-3xl font-headline font-bold text-primary">100%</h4>
                                    <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Community Focused</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-3xl font-headline font-bold text-primary">
                                        {new Date().getFullYear() - 2002}+
                                    </h4>
                                    <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Years of Impact</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl -z-10" />
                            {supportImage && (
                                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-square">
                                    <Image 
                                        src={supportImage.imageUrl}
                                        alt={supportImage.description}
                                        fill
                                        className="object-cover transition-transform duration-700 hover:scale-105"
                                        data-ai-hint={supportImage.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-8 left-8 right-8 text-white">
                                        <p className="text-sm font-bold uppercase tracking-widest mb-1">Our Community</p>
                                        <p className="text-xl font-headline italic">"Every student deserves a stage and a spotlight."</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Ways to Give Section */}
            <section className="py-32 relative bg-primary/[0.02]">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <div className="flex justify-center items-center gap-2 text-primary mb-4">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Opportunities</span>
                        </div>
                        <h2 className="text-5xl font-headline font-bold mb-6">Ways to Give</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground text-xl font-light">
                            Find the perfect way to share your passion for music and community.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {supportOptions.map((option, idx) => (
                            <motion.div
                                key={option.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: option.delay }}
                            >
                                <Card className="group relative h-full flex flex-col border-primary/5 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-primary/20 rounded-[2.5rem] overflow-hidden">
                                    <div className={cn(
                                        "h-2 w-full transition-all duration-500 group-hover:h-3",
                                        option.color
                                    )} />
                                    <CardHeader className="pt-10 px-8 pb-4">
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                            option.color,
                                            "bg-opacity-10 text-opacity-100"
                                        )}>
                                            <option.icon className={cn("w-8 h-8", option.color.replace('bg-', 'text-'))} />
                                        </div>
                                        <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">{option.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8 flex-grow">
                                        <p className="text-muted-foreground leading-relaxed font-light">{option.description}</p>
                                    </CardContent>
                                    <div className="px-8 pb-10 mt-auto">
                                        <div className="flex items-center gap-2 text-primary font-bold group/link transition-all cursor-pointer">
                                            <span className="text-base group-hover/link:underline decoration-2 underline-offset-4">{option.cta}</span>
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover/link:translate-x-2" />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefactor CTA */}
            <section className="py-32 px-4">
                <div className="container mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-[4rem] overflow-hidden bg-primary text-white p-12 md:p-24 shadow-2xl"
                    >
                        {/* Background Image Overlay */}
                        {supportCtaImage && (
                            <div className="absolute inset-0 opacity-20 scale-105">
                                <Image
                                    src={supportCtaImage.imageUrl}
                                    alt={supportCtaImage.description}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={supportCtaImage.imageHint}
                                />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest">
                                    <Users className="w-3 h-3" />
                                    <span>Join the Legacy</span>
                                </div>
                                <h2 className="text-5xl font-headline font-bold leading-tight">Become a Benefactor</h2>
                                <p className="text-xl text-white/80 font-light leading-relaxed max-w-xl">
                                    Your contribution, whether time, talent, or a donation, is an investment in the future of arts and culture in our community. Join us and make a lasting impact.
                                </p>
                                <div className="pt-4">
                                    <Button asChild size="lg" className="rounded-2xl px-12 py-8 bg-white text-primary hover:bg-white/90 text-lg font-bold shadow-xl transition-all hover:scale-105">
                                        <Link href='/support-us/donate'>
                                            Donate Now
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
