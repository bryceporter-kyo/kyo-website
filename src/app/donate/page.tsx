"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useImages } from "@/components/providers/ImageProvider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Heart, Mail, Landmark, HandCoins, Guitar, ExternalLink, MessageCircle, Car, Calendar, Repeat, ShieldCheck, CreditCard, Sparkles, Star, Users, Shield, ArrowRight, Zap, Info, X, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getLinkById, ExternalLink as ExternalLinkType, fetchLinksFromFirebase } from "@/lib/links";

const monthlyTiers = [
  {
    title: 'Friend of KYO',
    amount: '$10',
    period: '/month',
    description: 'Provides a student with a season\'s worth of sheet music, unlocking new pieces to learn and master.',
    features: ['Supports core program needs'],
    linkId: 'donate-stripe-friend',
  },
  {
    title: 'Supporter',
    amount: '$25',
    period: '/month',
    description: 'Funds a group sectional coaching, giving students direct mentorship from a professional musician.',
    features: ['Enhances learning experiences', 'Provides expert instruction'],
    linkId: 'donate-stripe-supporter',
  },
  {
    title: 'Patron',
    amount: '$50',
    period: '/month',
    description: 'Contributes to a partial scholarship, making music education accessible for a deserving student.',
    features: ['Increases program accessibility', 'Empowers a young musician'],
    popular: true,
    linkId: 'donate-stripe-patron',
  },
  {
    title: 'Benefactor',
    amount: '$100+',
    period: '/month',
    description: 'Underwrites a full student scholarship for one year, transforming a young musician\'s life.',
    features: ['Provides a full year of music', 'Creates a lasting impact'],
    linkId: 'donate-stripe-benefactor',
  },
];

const otherDonationMethods = [
    {
        icon: Mail,
        title: "By Cheque",
        description: "Please make cheques payable to the Kawartha Youth Orchestra and mail to our P.O. Box.",
        details: "P.O. Box 53, 150 King Street, Peterborough ON K9J 6Y5",
    },
    {
        icon: HandCoins,
        title: "By E-Transfer",
        description: "Send E-Transfer donations to donations@thekyo.ca. Please include your full name and address in the notes for a tax receipt.",
        details: "donations@thekyo.ca",
    }
]

export default function DonatePage() {
    const { getImage, images } = useImages();
    const [fetchedLinks, setFetchedLinks] = useState<ExternalLinkType[]>([]);
    
    const headerImage = getImage('page-header-donate');
    const whyItMattersImage = getImage('donate-why-it-matters');
    const volunteerCtaImage = getImage('volunteer-cta');
    const supporterLogos = images.filter(p => p.category === 'Supporter Logo');
    
    // Special Fund Images - Using verified existing IDs
    const tenutoImage = getImage('hero-concert');
    const instrumentImage = getImage('aid-instruments');
    const carImage = getImage('page-header-donate');
    const customImage = getImage('page-header-support');

    useEffect(() => {
        fetchLinksFromFirebase().then(setFetchedLinks);
    }, []);

    const getLink = (id: string) => {
        return fetchedLinks.find(l => l.id === id) || getLinkById(id);
    };

    const tenutoTrustLink = getLink('tenuto-trust');

    return (
        <div className="relative overflow-hidden bg-background min-h-screen">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[15%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] -right-[5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <PageHeader
                title="Create Harmony"
                subtitle="Your gift ensures that every young musician in our community has a stage to call home."
                image={headerImage}
            />

            {/* Why Support Matters */}
            <section className="py-32 px-4">
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Impact & Trust</span>
                            </div>
                            <h2 className="text-5xl font-headline font-bold leading-tight">Your Support Keeps the Music Playing</h2>
                            <div className="space-y-6 text-muted-foreground text-lg font-light leading-relaxed">
                                <p>
                                    Tuition fees cover only <span className="text-primary font-bold">4%</span> of what it takes to run our programs. The rest comes from the generosity of people like you.
                                </p>
                                <p>
                                    Your donation directly funds everything from sheet music and instrument repairs to scholarships and expert coaching, ensuring that every young person has the chance to experience the power of music.
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-500">
                                    <Shield className="w-4 h-4 text-primary" />
                                    <span>Secure 256-bit SSL Transaction</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-500">
                                    <Star className="w-4 h-4 text-primary" />
                                    <span>Charitable Tax Receipts Provided</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-3xl -z-10" />
                            {whyItMattersImage && (
                                <div className="rounded-[3rem] overflow-hidden shadow-2xl aspect-video lg:aspect-square relative">
                                    <Image
                                        src={whyItMattersImage.imageUrl}
                                        alt={whyItMattersImage.description}
                                        fill
                                        className="object-cover transition-transform duration-700 hover:scale-105"
                                        data-ai-hint={whyItMattersImage.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Donation Methods Tabs */}
            <section className="py-32 bg-primary/[0.02]">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="monthly" className="w-full">
                        <div className="flex flex-col items-center mb-16 space-y-8">
                            <div className="text-center space-y-4">
                                <h2 className="text-5xl font-headline font-bold">Invest in a Student</h2>
                                <p className="text-xl text-muted-foreground font-light max-w-2xl">
                                    Choose the contribution level that resonates with your passion for youth music.
                                </p>
                            </div>
                            
                            <TabsList className="h-16 p-2 bg-white shadow-xl rounded-[2rem] border border-primary/10">
                                <TabsTrigger value="monthly" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
                                    <Repeat className="w-4 h-4 mr-2" /> Monthly Support
                                </TabsTrigger>
                                <TabsTrigger value="one-time" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
                                    <Heart className="w-4 h-4 mr-2" /> One-Time Gift
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="monthly">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {monthlyTiers.map((tier) => {
                                    const tierLink = getLink(tier.linkId);
                                    return (
                                        <motion.div
                                            key={tier.title}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                        >
                                            <Card className={cn(
                                                "h-full flex flex-col rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-primary/20",
                                                tier.popular ? "border-primary ring-2 ring-primary/20 bg-primary/[0.01]" : "border-primary/5"
                                            )}>
                                                <CardHeader className="p-8 pb-4">
                                                    {tier.popular && (
                                                        <Badge className="w-fit mb-4 bg-primary text-white hover:bg-primary border-none">Most Impactful</Badge>
                                                    )}
                                                    <CardTitle className="text-xl font-headline font-bold">{tier.title}</CardTitle>
                                                    <div className="flex items-baseline gap-1 pt-4">
                                                        <span className="text-5xl font-headline font-bold text-primary">{tier.amount}</span>
                                                        <span className="text-muted-foreground font-light">{tier.period}</span>
                                                    </div>
                                                    <CardDescription className="pt-4 text-sm leading-relaxed min-h-[80px]">
                                                        {tier.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="px-8 pb-8 flex-grow">
                                                    <div className="space-y-3 pt-6 border-t border-primary/5">
                                                        {tier.features.map((feature) => (
                                                            <div key={feature} className="flex items-start gap-3">
                                                                <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                    <Check className="w-3 h-3 text-primary" />
                                                                </div>
                                                                <span className="text-xs text-muted-foreground font-medium">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="p-8 pt-0">
                                                    {tierLink && (
                                                        <Button asChild className="w-full rounded-2xl py-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg">
                                                            <Link href={tierLink.url} target="_blank" rel="noopener noreferrer">Donate Monthly</Link>
                                                        </Button>
                                                    )}
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="one-time">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-3xl mx-auto"
                            >
                                <Card className="rounded-[3rem] border-primary/10 shadow-2xl overflow-hidden">
                                    <div className="bg-primary p-12 text-center text-white relative">
                                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/grid.svg')]" />
                                        <Heart className="w-16 h-16 mx-auto mb-6 opacity-80" />
                                        <CardTitle className="text-4xl font-headline font-bold mb-4">Support Our Season</CardTitle>
                                        <p className="text-white/80 text-lg font-light max-w-xl mx-auto">
                                            Every single donation, no matter the size, helps us provide essential musical opportunities to local youth.
                                        </p>
                                    </div>
                                    <CardContent className="p-12 text-center space-y-8 bg-white">
                                        <p className="text-muted-foreground text-lg">Your secure one-time gift will be put to work immediately supporting rehearsals, instrument repairs, and outreach.</p>
                                        <Button asChild size="lg" className="rounded-2xl px-12 py-8 bg-primary hover:bg-primary/90 text-white text-xl font-bold shadow-xl transition-all hover:scale-105">
                                            <Link href={getLink('donate-stripe-one-time')?.url || '#'} target="_blank" rel="noopener noreferrer">
                                                Donate Today
                                                <ArrowRight className="ml-2 w-6 h-6" />
                                            </Link>
                                        </Button>
                                        <p className="text-sm text-slate-400">Donations over $20 qualify for a charitable tax receipt.</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Online Giving Hub */}
            <section className="py-32 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <div className="flex justify-center items-center gap-2 text-primary">
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Digital Giving</span>
                        </div>
                        <h2 className="text-4xl font-headline font-bold">Trusted Giving Platforms</h2>
                        <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
                            Choose the secure platform that works best for your contribution style.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <Tabs defaultValue="canadahelps" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-14 p-1 rounded-2xl bg-slate-50 border border-slate-200">
                                <TabsTrigger value="canadahelps" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all font-bold text-base">
                                    <CreditCard className="w-4 h-4 mr-2" /> CanadaHelps (Card/PayPal)
                                </TabsTrigger>
                                <TabsTrigger value="securities" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all font-bold text-base">
                                    <Zap className="w-4 h-4 mr-2" /> Donate Securities
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="canadahelps" className="mt-8">
                                <Card className="rounded-[2.5rem] border-primary/5 bg-white shadow-xl overflow-hidden group min-h-[400px] flex">
                                    <div className="grid md:grid-cols-12 items-stretch w-full">
                                        <div className="md:col-span-7 p-12 space-y-8 flex flex-col justify-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <ShieldCheck className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-3xl font-headline font-bold">Donate via CanadaHelps</h3>
                                            </div>
                                            <p className="text-muted-foreground text-lg font-light leading-relaxed">
                                                Use CanadaHelps to make a secure one-time or monthly donation. It's a simple and effective way to support our mission and receive an instant tax receipt directly to your inbox.
                                            </p>
                                            <Button asChild variant="outline" className="rounded-xl border-primary/20 hover:bg-primary hover:text-white transition-all font-bold group-hover:scale-105 w-fit py-6 px-8">
                                                <Link href={getLink('donate-canadahelps-general')?.url || '#'} target="_blank" rel="noopener noreferrer">
                                                    Donate on CanadaHelps <ExternalLink className="ml-2 w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                        <div className="md:col-span-5 bg-slate-50 p-12 flex flex-col justify-center border-l border-slate-100 space-y-6">
                                            <div className="flex items-center gap-3 text-sm text-slate-500 font-bold uppercase tracking-widest">
                                                <Info className="w-5 h-5 text-primary" /> Benefits of CanadaHelps
                                            </div>
                                            <ul className="space-y-4">
                                                <li className="flex items-start gap-3 text-base text-slate-600">
                                                    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <span className="font-medium">Instant Tax Receipt for all gifts</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-base text-slate-600">
                                                    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <span className="font-medium">Accepts All Major Credit Cards & PayPal</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-base text-slate-600">
                                                    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <span className="font-medium">Industry-Leading Secure Encryption</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="securities" className="mt-8">
                                <Card className="rounded-[2.5rem] border-primary/5 bg-white shadow-xl overflow-hidden group min-h-[400px] flex">
                                    <div className="grid md:grid-cols-12 items-stretch w-full">
                                        <div className="md:col-span-7 p-12 space-y-8 flex flex-col justify-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Zap className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-3xl font-headline font-bold">Donate Securities & Mutual Funds</h3>
                                            </div>
                                            <p className="text-muted-foreground text-lg font-light leading-relaxed">
                                                Donating publicly traded securities is the most tax-efficient way to give. You will not pay capital gains tax on the appreciated value of your shares, meaning a larger gift for the arts.
                                            </p>
                                            <Button asChild variant="outline" className="rounded-xl border-primary/20 hover:bg-primary hover:text-white transition-all font-bold group-hover:scale-105 w-fit py-6 px-8">
                                                <Link href={getLink('donate-canadahelps-securities')?.url || '#'} target="_blank" rel="noopener noreferrer">
                                                    Donate Securities <ExternalLink className="ml-2 w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                        <div className="md:col-span-5 bg-amber-500/10 p-12 flex flex-col justify-center border-l border-amber-500/20 space-y-6">
                                            <div className="flex items-center gap-3 text-sm text-amber-700 font-bold uppercase tracking-widest">
                                                <Star className="w-5 h-5" /> Professional Philanthropy Tip
                                            </div>
                                            <p className="text-lg text-amber-900 font-medium italic leading-relaxed">
                                                "By donating shares directly, you bypass capital gains tax, increasing the value of your donation by up to 25%."
                                            </p>
                                            <div className="p-4 rounded-xl bg-white/50 border border-amber-200 text-xs text-amber-800">
                                                This is highly recommended for larger donations to maximize your tax credit.
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mt-12">
                        {otherDonationMethods.map((method) => (
                            <Card key={method.title} className="rounded-[2rem] border-primary/5 hover:border-primary/20 transition-all shadow-sm overflow-hidden bg-white">
                                <CardHeader className="p-8 pb-4 flex flex-row items-center gap-4">
                                    <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                        <method.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl font-headline font-bold">{method.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="px-8 pb-8 space-y-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">{method.description}</p>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs break-words text-slate-600">
                                        {method.details}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Special Funds & Gifts - Forest Green Background with White Cards */}
            <section className="py-32 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20 space-y-4">
                        <div className="flex justify-center items-center gap-2 text-white/60">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Legacy & Special Gifts</span>
                        </div>
                        <h2 className="text-4xl font-headline font-bold text-white">Ways to Shape Our Future</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { 
                                icon: Landmark, 
                                title: "The Tenuto Trust", 
                                desc: "Contribute to our legacy fund for dependable, long-term support.", 
                                img: tenutoImage,
                                action: (
                                    <Button asChild variant="link" className="px-0 text-primary font-bold h-auto py-0 group-hover:translate-x-2 transition-transform">
                                        <Link href={tenutoTrustLink?.url || '#'} target="_blank" rel="noopener noreferrer">
                                            Learn More <ArrowRight className="ml-2 w-4 h-4" />
                                        </Link>
                                    </Button>
                                )
                            },
                            { 
                                icon: Guitar, 
                                title: "Donate an Instrument", 
                                desc: "Let your unused instrument inspire a young musician.", 
                                img: instrumentImage,
                                action: (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="link" className="px-0 text-primary font-bold h-auto py-0 group-hover:translate-x-2 transition-transform">
                                                Learn More <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                                            <div className="relative h-48 w-full">
                                                <Image src={instrumentImage?.imageUrl || ''} alt="Instruments" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                                    <div className="text-center space-y-2">
                                                        <Guitar className="w-12 h-12 mx-auto opacity-80" />
                                                        <DialogTitle className="text-3xl font-headline font-bold">Donate Your Instrument</DialogTitle>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                                                <div className="space-y-4">
                                                    <DialogDescription className="text-lg leading-relaxed text-slate-900 font-medium">
                                                        Your unused instrument can inspire a young musician's journey.
                                                    </DialogDescription>
                                                    <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                                                        <p>
                                                            The Kawartha Youth Orchestra welcomes instrument donations — particularly string and brass instruments, which we are currently prioritizing. Donated instruments go directly toward supporting young musicians in our community, whether as loaners, spares, or additions to our teaching program.
                                                        </p>
                                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-xs font-medium">
                                                            Please note: We are unable to accept upright pianos at this time due to storage and moving constraints.
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                                                        <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
                                                    </div>
                                                    <Accordion type="single" collapsible className="w-full">
                                                        <AccordionItem value="receipts" className="border-slate-100">
                                                            <AccordionTrigger className="text-sm font-bold text-slate-900 hover:no-underline">
                                                                Will I receive a tax receipt?
                                                            </AccordionTrigger>
                                                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                                                Tax receipts are provided for instruments in like-new condition that are fully playable and require no repairs or servicing. If your instrument needs work, we still welcome the donation — however, to issue a receipt you will need to arrange an appraisal and service quote beforehand and include it with your donation. The receiptable amount will be the appraised value minus the cost of the quoted service.
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                        <AccordionItem value="types" className="border-slate-100">
                                                            <AccordionTrigger className="text-sm font-bold text-slate-900 hover:no-underline">
                                                                What instruments do you accept?
                                                            </AccordionTrigger>
                                                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                                                We accept most instruments regardless of type or condition, though we are currently prioritizing strings and brass. Please note that we are unable to accept upright pianos at this time. If you're unsure whether your instrument is a good fit, feel free to reach out.
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </div>

                                                <div className="pt-4 flex justify-end">
                                                    <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 shadow-lg shadow-primary/20">
                                                        <Link href="/contact">Contact Our Team to Donate</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )
                            },
                            { 
                                icon: Car, 
                                title: "Donate a Car", 
                                desc: "Turn your vehicle into musical opportunities.", 
                                img: carImage,
                                action: (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="link" className="px-0 text-primary font-bold h-auto py-0 group-hover:translate-x-2 transition-transform">
                                                Learn More <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                                            <div className="relative h-48 w-full">
                                                <Image src={carImage?.imageUrl || ''} alt="Car Donation" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                                    <div className="text-center space-y-2">
                                                        <Car className="w-12 h-12 mx-auto opacity-80" />
                                                        <DialogTitle className="text-3xl font-headline font-bold">Donate Your Car</DialogTitle>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-6">
                                                <DialogDescription className="text-lg leading-relaxed text-slate-600 font-medium">
                                                    Donate a Car Canada accepts vehicle donations for the Kawartha Youth Orchestra.
                                                </DialogDescription>
                                                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                                                    <p>
                                                        Free towing is provided in most areas across Canada, or you can drop off your vehicle to maximize your donation. When you donate your car, truck, RV, boat, or motorcycle to the Kawartha Youth Orchestra through <Link href="https://donatecar.ca/org/donate.php" target="_blank" className="text-primary font-bold hover:underline">Donate A Car Canada</Link>, it will either be recycled or sold at auction (depending on its condition, age and location).
                                                    </p>
                                                    <p>
                                                        Donate a Car Canada will look after all the details to make it easy for the Kawartha Youth Orchestra to benefit. After your vehicle donation is complete, you will receive a tax receipt and we will put your gift to good use.
                                                    </p>
                                                </div>
                                                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end">
                                                    <Button asChild variant="outline" className="rounded-xl font-bold border-primary/20">
                                                        <Link href="https://donatecar.ca/org/donate.php?charitypage=KawarthaYouthOrchestra" target="_blank" rel="noopener noreferrer">
                                                            Learn More <ExternalLink className="ml-2 w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
                                                        <Link href="https://donatecar.ca/org/donate.php?charitypage=KawarthaYouthOrchestra" target="_blank" rel="noopener noreferrer">
                                                            Donate a Vehicle <ArrowRight className="ml-2 w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )
                            },
                            { 
                                icon: MessageCircle, 
                                title: "Custom Donation", 
                                desc: "Have a specific way you'd like to contribute?", 
                                img: customImage,
                                action: (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="link" className="px-0 text-primary font-bold h-auto py-0 group-hover:translate-x-2 transition-transform">
                                                Contact Us <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                                            <div className="relative h-48 w-full">
                                                <Image src={customImage?.imageUrl || ''} alt="Other Ways to Give" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                                    <div className="text-center space-y-2">
                                                        <MessageCircle className="w-12 h-12 mx-auto opacity-80" />
                                                        <DialogTitle className="text-3xl font-headline font-bold">Other Ways to Give</DialogTitle>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                                                <div className="space-y-4">
                                                    <DialogDescription className="text-lg leading-relaxed text-slate-900 font-medium">
                                                        Support the KYO beyond monetary donations.
                                                    </DialogDescription>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        There are many ways to support the Kawartha Youth Orchestra beyond monetary donations, and we'd love to hear from you. Whether you have materials, services, or something unique to offer, your generosity helps us bring music education to young people across the Kawarthas.
                                                    </p>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-primary text-sm uppercase tracking-widest flex items-center gap-2">
                                                        <Star className="w-4 h-4" /> Examples of Contributions
                                                    </h4>
                                                    <ul className="space-y-4">
                                                        {[
                                                            { label: "Music & Sheet Music", desc: "Method books, repertoire, and educational materials" },
                                                            { label: "Equipment & Supplies", desc: "Stands, cases, rosin, strings, reeds, and other accessories" },
                                                            { label: "Professional Services", desc: "Instrument repair, printing, photography, web design, or other skilled trades" },
                                                            { label: "Food Donations", desc: "Non-perishable and packaged food items in original, unopened packaging (no homemade/cooked products)" }
                                                        ].map((item) => (
                                                            <li key={item.label} className="flex gap-3">
                                                                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-primary" />
                                                                </div>
                                                                <div className="text-sm">
                                                                    <span className="font-bold text-slate-900">{item.label}:</span>{" "}
                                                                    <span className="text-muted-foreground">{item.desc}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                                    This list is just a starting point. We're always open to creative partnerships and in-kind support of all kinds. Contact us to discuss how your gift can make a difference.
                                                </p>

                                                <div className="pt-4 flex justify-end">
                                                    <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 shadow-lg shadow-primary/20">
                                                        <Link href="/contact">Contact Our Team</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )
                            }
                        ].map((fund) => (
                            <Card key={fund.title} className="bg-white border-primary/5 hover:border-primary/20 transition-all rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-xl flex flex-col">
                                {fund.img ? (
                                    <div className="relative h-48 w-full">
                                        <Image src={fund.img.imageUrl} alt={fund.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        <div className="absolute bottom-4 left-6">
                                            <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center">
                                                <fund.icon className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 pb-0">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                                            <fund.icon className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-xl font-headline font-bold text-slate-900">{fund.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="px-8 pb-4 flex-grow">
                                    <p className="text-sm text-slate-600 font-light leading-relaxed">{fund.desc}</p>
                                </CardContent>
                                <CardFooter className="px-8 pb-8">
                                    {fund.action}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Corporate Thank You */}
            <section className="py-32 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <div className="flex justify-center items-center gap-2 text-primary">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Our Partners</span>
                        </div>
                        <h2 className="text-4xl font-headline font-bold">A Community of Support</h2>
                        <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
                            Our work is only possible because of the tremendous generosity of our community, corporate, and government supporters.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 items-center max-w-5xl mx-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        {supporterLogos.map((logo) => (
                            <div key={logo.id} className="flex justify-center transition-transform hover:scale-110">
                                <Image
                                    src={logo.imageUrl}
                                    alt={logo.description}
                                    width={160}
                                    height={80}
                                    className="object-contain max-h-16"
                                    data-ai-hint={logo.imageHint}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Volunteer CTA */}
            <section className="py-32 px-4">
                <div className="container mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-[4rem] overflow-hidden bg-primary text-white p-12 md:p-24 shadow-2xl"
                    >
                        {volunteerCtaImage && (
                            <div className="absolute inset-0 opacity-20 scale-105">
                                <Image
                                    src={volunteerCtaImage.imageUrl}
                                    alt={volunteerCtaImage.description}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={volunteerCtaImage.imageHint}
                                />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest">
                                    <Users className="w-3 h-3" />
                                    <span>Nurture the Mission</span>
                                </div>
                                <h2 className="text-5xl font-headline font-bold leading-tight">Not Ready to Donate?</h2>
                                <p className="text-xl text-white/80 font-light leading-relaxed max-w-xl mx-auto md:mx-0">
                                    Your time and talent are just as valuable. Join our dedicated volunteer team and play a crucial role in our mission.
                                </p>
                                <div className="pt-4">
                                    <Button asChild size="lg" className="rounded-2xl px-12 py-8 bg-white text-primary hover:bg-white/90 text-lg font-bold shadow-xl transition-all hover:scale-105">
                                        <Link href="/volunteer">
                                            Learn About Volunteering
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
    );
}
