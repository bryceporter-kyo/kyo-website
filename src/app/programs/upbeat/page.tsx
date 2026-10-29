"use client";

import { useState, useEffect } from 'react';
import { useImages } from '@/components/providers/ImageProvider';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
    Target, 
    HeartHandshake, 
    Users, 
    Quote, 
    Star, 
    Group, 
    Check, 
    Heart, 
    Sparkles,
    Zap,
    Gift
} from 'lucide-react';
import Image from 'next/image';
import { getLinkById } from '@/lib/links';
import { fetchButtonsFromFirebase, ButtonConfig } from '@/lib/buttons';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const programPillars = [
    {
        icon: Users,
        title: "Youth Development",
        description: "Empowering young musicians by fostering confidence, discipline, and emotional resilience through high-quality music education.",
        accent: "bg-blue-500/10 text-blue-600"
    },
    {
        icon: HeartHandshake,
        title: "Social Support",
        description: "Providing a safe, structured after-school environment with staff and volunteers dedicated to the care and wellbeing of our participants.",
        accent: "bg-rose-500/10 text-rose-600"
    },
     {
        icon: Group,
        title: "Community and Belonging",
        description: "Ensemble music making means children develop accountability and learn how to support each other. This process helps children develop a strong sense of community.",
        accent: "bg-amber-500/10 text-amber-600"
    },
    {
        icon: Star,
        title: "Equitable Access",
        description: "Eliminating all cost barriers, including instruments, transportation, and providing food support with after-school snacks, to ensure participation for all.",
        accent: "bg-emerald-500/10 text-emerald-600"
    }
];

const coreActivities = [
    { 
        title: "String Instruction", 
        description: "Violin, viola or cello aren't easy instruments but in an environment that's fun, supportive, and led by world class instructors any child can learn and the challenge makes the process incredibly rewarding.", 
        imageId: "program-upbeat" 
    },
    { 
        title: "Music Literacy", 
        description: "Activities in rhythm, theory, and listening foster musical fluency. These skills are transferable to any instrument and set kids up for a lifetime of music.", 
        imageId: "upbeat-kids-smiling" 
    },
    { 
        title: "Social Development Through Music", 
        description: "Upbeat! uses music education as the medium to support children's growth and well-being. The ensemble method provides a sense of community and self worth. All while learning to focus and express themselves through music which leads to resilience and confidence.", 
        imageId: "support-volunteer" 
    },
    { 
        title: "Wellness Support", 
        description: "Our Wellness Coordinator and dedicated teachers offer guidance and mentoring. Beyond music, Upbeat! offers a safe social environment filled with games and soon-to-be life long friends.\n\nEvery Upbeat! begins with a healthy snack time, ensuring kids are nourished and ready to learn.", 
        imageId: "support-cta" 
    }
];

const testimonials = [
  {
    quote: "My daughter LOVED the UPBEAT program. She provided rave reviews on every ride home and would look forward to each and every session. It has changed her life.",
    author: "Jennifer",
    role: "Upbeat! Parent"
  },
  {
    quote: "Upbeat! isn’t just about music. It’s about creating a place where kids feel seen, supported, and inspired. For some, this is the first place where they’ve really felt they belonged.",
    author: "Colin McMahon",
    role: "Upbeat! Artistic Director"
  }
];


export default function UpbeatPage() {
  const { getImage } = useImages();
  const headerImage = getImage('page-header-upbeat');
  const aboutImage = getImage('program-upbeat');
  const impactImage = getImage('upbeat-kids-smiling');
  const communityImage = getImage('support-volunteer');
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);

  useEffect(() => {
    const loadButtons = async () => {
      const data = await fetchButtonsFromFirebase();
      setButtons(data);
    };
    loadButtons();
  }, []);

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

  const enrollButton = getButtonProps(buttons.find(b => b.id === 'upbeat-enroll'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  } as const;

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      <PageHeader
        title="Upbeat!"
        subtitle="Removing Barriers, Building Futures: Offering transformative music education to children from grades 3-8."
        image={headerImage || undefined}
      />

      {/* Intro Section */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-20 items-center">
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                        <Zap className="w-4 h-4" />
                        El Sistema Powered
                    </div>
                    <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">A Symphony of Opportunity</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed font-light">
                        Upbeat! is the Kawartha Youth Orchestra’s fully subsidized after-school music and social development program. Rooted in the transformative principles of El Sistema, it combines ensemble string instruction, nutritional support, and emotional wellness—all at no cost to families.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5">
                      {enrollButton && (
                        <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg shadow-xl hover:scale-105 transition-all bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20 font-bold">
                            <Link href={enrollButton.href} target={enrollButton.target}>{enrollButton.text}</Link>
                        </Button>
                      )}
                      <Button asChild size="lg" variant="outline" className="rounded-full px-10 py-7 text-lg hover:scale-105 transition-all font-bold border-primary/30">
                          <Link href="/programs/upbeat/gift-catalogue">
                              <Gift className="w-5 h-5 mr-2" />
                              Holiday Gift Catalogue
                          </Link>
                      </Button>
                    </div>
                </motion.div>
                <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    {aboutImage?.imageUrl ? (
                        <div className="rounded-[3rem] overflow-hidden shadow-2xl group border-8 border-white bg-white">
                            <Image
                                src={aboutImage.imageUrl}
                                alt="Upbeat! Program"
                                width={600}
                                height={450}
                                className="object-cover w-full aspect-[4/3] transition-transform duration-1000 group-hover:scale-110"
                            />
                        </div>
                    ) : null}
                </motion.div>
            </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-24 px-4 bg-primary/[0.02]">
        <div className="container mx-auto">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-20"
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-2">
                        <Target className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-headline font-bold">Our Four Pillars</h2>
                    <p className="mx-auto max-w-3xl text-muted-foreground text-lg mt-4 font-light leading-relaxed">
                        Built on principles that guide our mission to deliver artistic excellence and deep social impact.
                    </p>
                </div>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
                {programPillars.map(pillar => (
                    <motion.div key={pillar.title} variants={itemVariants}>
                        <Card className="group text-center flex flex-col items-center h-full transition-all duration-500 hover:shadow-2xl border-primary/5 bg-white/70 backdrop-blur-md hover:-translate-y-3">
                            <CardHeader className="items-center pb-2">
                                <div className={cn("p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", pillar.accent)}>
                                    <pillar.icon className="h-8 w-8" />
                                </div>
                                <CardTitle className="font-headline text-xl pt-6 group-hover:text-primary transition-colors">{pillar.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow pt-4">
                                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </section>
      

      {/* Equity Section */}
      <section className="py-24 px-4 bg-secondary/30">
          <div className="container mx-auto">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                  <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      className="relative"
                  >
                      {impactImage?.imageUrl ? (
                          <div className="rounded-[3rem] overflow-hidden shadow-2xl group border-[12px] border-white bg-white">
                              <Image
                                  src={impactImage.imageUrl}
                                  alt="Impact"
                                  width={600}
                                  height={450}
                                  className="object-cover w-full aspect-[4/3] transition-transform duration-1000 group-hover:scale-105"
                              />
                          </div>
                      ) : null}
                      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
                  </motion.div>

                  <motion.div 
                      initial={{ x: 50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="space-y-8"
                  >
                      <h2 className="text-4xl font-headline font-bold leading-tight">Who We Serve: A Commitment to Equity</h2>
                      <p className="text-muted-foreground text-lg leading-relaxed font-light">
                          Inclusivity is central to our mission. We are proud to serve a base that reflects the true diversity of our broader community.
                      </p>
                      <div className="space-y-6">
                          <div className="flex items-start gap-5 p-6 rounded-2xl bg-white/60 border border-white/40 shadow-sm transition-all hover:shadow-md">
                              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                <Check className="w-6 h-6" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-lg">Cultural Diversity</h4>
                                  <p className="text-muted-foreground text-sm">Over 50% of participants identify as non-white, creating a rich multicultural environment.</p>
                              </div>
                          </div>
                           <div className="flex items-start gap-5 p-6 rounded-2xl bg-white/60 border border-white/40 shadow-sm transition-all hover:shadow-md">
                              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                <Check className="w-6 h-6" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-lg">Economic Diversity</h4>
                                  <p className="text-muted-foreground text-sm">Nearly 60% of families rely on full subsidies to ensure no child is left behind.</p>
                              </div>
                          </div>
                      </div>
                       <p className="text-muted-foreground text-sm italic font-serif leading-relaxed pt-4 border-t border-primary/10">
                          "No other organization in the region offers orchestral training as affordably—or with greater subsidies for families in need."
                      </p>
                  </motion.div>
              </div>
          </div>
      </section>

     {/* How it Works Section */}
     <section className="py-24 px-4">
        <div className="container mx-auto">
            <div className="text-center mb-20">
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-2">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-headline font-bold">How Upbeat! Works</h2>
                    <p className="mx-auto max-w-3xl text-muted-foreground text-lg mt-4 font-light">
                        A consistent, enriching after-school experience designed to support the whole child.
                    </p>
                </div>
            </div>

            <div className="relative space-y-32 mb-32">
                {/* Visual Path Line (Desktop Only) */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 -translate-x-1/2 hidden lg:block" />

                {coreActivities.map((activity, index) => {
                    const isEven = index % 2 === 0;
                    const image = getImage(activity.imageId);
                    const Icon = activity.icon;

                    return (
                        <div key={activity.title} className="relative">
                            {/* Step Indicator */}
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex w-10 h-10 rounded-full bg-white border-4 border-primary/20 items-center justify-center shadow-md">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>

                            <div className={cn(
                                "flex flex-col gap-12 items-center",
                                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                            )}>
                                {/* Image Container */}
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                    className="w-full lg:w-1/2"
                                >
                                    <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-2xl group bg-slate-900/10">
                                        {image?.imageUrl ? (
                                            <Image
                                                src={image.imageUrl}
                                                alt={activity.title}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        ) : null}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                    </div>
                                </motion.div>

                                {/* Content Container */}
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: 0.1 }}
                                    className="w-full lg:w-1/2 space-y-6 lg:px-12"
                                >
                                    <h3 className="text-3xl font-headline font-bold">{activity.title}</h3>
                                    <div className="h-1.5 w-12 bg-primary/20 rounded-full" />
                                    <p className="text-muted-foreground text-lg leading-relaxed font-normal whitespace-pre-line">
                                        {activity.description}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </section>
      
      {/* Testimonials */}
       <section className="py-24 px-4 bg-[#0a3d2c]/[0.02]">
            <div className="container mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-headline font-bold">Voices from Our Community</h2>
                    <div className="h-1 w-20 bg-primary/20 rounded-full mx-auto mt-6" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div 
                            key={testimonial.author}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                        >
                            <Card className="h-full flex flex-col bg-white border-primary/5 shadow-lg rounded-[2rem] p-4 group hover:shadow-2xl transition-all duration-500">
                                <CardHeader>
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <Quote className="w-8 h-8" />
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <blockquote className="text-muted-foreground font-light text-2xl leading-relaxed italic font-serif">
                                        "{testimonial.quote}"
                                    </blockquote>
                                </CardContent>
                                <CardFooter className="pt-8 border-t border-primary/5">
                                    <div className="w-full flex items-center justify-between">
                                        <div className="h-px flex-grow bg-primary/10 mr-6" />
                                        <p className="font-bold font-headline whitespace-nowrap">
                                            {testimonial.author} <span className="font-normal text-muted-foreground text-sm ml-2">/ {testimonial.role}</span>
                                        </p>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

      {/* Support CTA */}
      <section id="support" className="py-32 px-4">
          <div className="container mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-16 rounded-[4rem] bg-[#0a3d2c] text-white text-center relative overflow-hidden group shadow-[0_40px_120px_rgba(10,61,44,0.3)] border border-white/10"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent)] z-0" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-[0.2em] mb-10">
                        <Heart className="w-4 h-4" />
                        Join the Mission
                    </div>
                    <h3 className="text-4xl md:text-6xl font-headline font-bold mb-8">Help Us Change Lives Through Music</h3>
                    <p className="text-xl text-neutral-100 max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
                        Upbeat! is a fully subsidized program that relies on the generosity of our community. Your gift directly funds instruments, professional instruction, and essential wellness support.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Button asChild size="lg" className="bg-white text-[#0a3d2c] hover:bg-forest-50 px-12 py-8 rounded-full font-bold text-2xl shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                            <Link href='/support-us/donate'>Donate Today</Link>
                        </Button>
                        <Button asChild size="lg" className="bg-white/15 border border-white/40 text-white hover:bg-white/25 px-12 py-8 rounded-full font-bold text-xl transition-all w-full sm:w-auto">
                            <Link href='/programs/upbeat/gift-catalogue'>
                                <Gift className="w-5 h-5 mr-2" />
                                Holiday Gift Catalogue
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-12 py-8 rounded-full font-bold text-xl transition-all w-full sm:w-auto">
                            <Link href='/support-us/ways-to-give'>More Ways to Give</Link>
                        </Button>
                    </div>
                    
                    <div className="mt-20 pt-12 border-t border-white/10 text-center max-w-3xl mx-auto">
                        <p className="text-white/60 font-light leading-relaxed">
                            "On behalf of the Kawartha Youth Orchestra Board, instructors, youth, and families, we thank you for your support of Upbeat!."
                        </p>
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <div className="h-px w-12 bg-white/30 mb-4" />
                            <p className="font-bold font-headline text-2xl">Bryce Porter</p>
                            <p className="text-white/50 text-sm uppercase tracking-widest">Chair, Board of Directors</p>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>
        </section>
    </div>
  );
}