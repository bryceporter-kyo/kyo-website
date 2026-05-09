
"use client";

import { useState, useEffect } from 'react';
import { useImages } from '@/components/providers/ImageProvider';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
    Users, 
    HandHeart, 
    Music, 
    Award, 
    GraduationCap, 
    Briefcase, 
    FileText, 
    Cpu, 
    Star, 
    Handshake, 
    School,
    ArrowRight,
    Sparkles,
    Trophy,
    HeartHandshake
} from 'lucide-react';
import Image from 'next/image';
import { getLinkById } from '@/lib/links';
import { fetchButtonsFromFirebase, ButtonConfig } from '@/lib/buttons';
import ProgramPathways from '@/components/shared/ProgramPathways';
import { motion } from 'framer-motion';

const orchestras = [
  {
    title: 'Junior KYO (JKYO)',
    description: 'A welcoming introduction to orchestral playing. Focused on building fundamental ensemble skills, rhythmic precision, and the joy of making music together.',
    experience: 'Beginner Level',
    imageId: 'orchestra-junior',
    icon: Music
  },
  {
    title: 'Intermediate KYO (IKYO)',
    description: 'Developing advanced techniques and expanding repertoire. Musicians explore complex harmonies and a diverse range of musical styles.',
    experience: 'Typically 2+ years experience',
    imageId: 'orchestra-intermediate',
    icon: Sparkles
  },
  {
    title: 'Senior KYO (SKYO)',
    description: 'Our flagship ensemble for advanced musicians. Tackling major symphonic works and professional-level repertoire with passion and precision.',
    experience: 'Typically 4+ years experience',
    imageId: 'orchestra-senior',
    icon: Trophy
  },
];

const financialAidOptions = [
    {
        icon: HandHeart,
        title: "Tuition Assistance",
        description: "We offer financial aid to help make our programs accessible to all families through tuition bursaries & multiple child discounts.",
        linkId: "contact-main",
        imageId: "aid-tuition"
    },
    {
        icon: Music,
        title: "Instrument Loans",
        description: "The KYO has a limited number of instruments available for loan to registered musicians for the entire season, free of charge.",
        linkId: "contact-main",
        imageId: "aid-instruments"
    }
]

const scholarships = [
    {
        icon: Award,
        title: "Bell Bassoons Ltd. Scholarship",
        description: "Encourages and supports bassoonists in the KYO. Open to youth musicians from any ensemble to support musical enrichment."
    },
    {
        icon: GraduationCap,
        title: "Helen Ball Leadership Award",
        description: "Recognizes a KYO youth musician who demonstrates exceptional commitment, leadership, and community support."
    }
]

const supplementaryEnsembles = [
    {
        title: "Folk Ensemble",
        description: "Explore Celtic and global folk traditions. Open to strings, flute, harp, guitar, percussion, and more.",
        imageId: 'ensemble-folk'
    },
    {
        title: "Jazz Combo",
        description: "Dive into swing, blues, and Latin music. Focus on improvisation and accompaniment in a small group setting.",
        imageId: 'ensemble-jazz'
    },
    {
        title: "Chamber Music",
        description: "Receive small ensemble coaching from professional musicians for confident classical players.",
        imageId: 'ensemble-chamber'
    }
];

export default function OrchestrasPage() {
  const { getImage } = useImages();
  const headerImage = getImage('page-header-orchestras');
  const joinImage = getImage('orchestra-kids-playing');
  const communityImage = getImage('support-volunteer');
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);

  useEffect(() => {
    const loadButtons = async () => {
      const data = await fetchButtonsFromFirebase();
      setButtons(data);
    };
    loadButtons();
  }, []);

  const registerButtonConfig = buttons.find(b => b.id === 'orchestras-register');
  const auditionButtonConfig = buttons.find(b => b.id === 'orchestras-audition');

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

  const registerButton = getButtonProps(registerButtonConfig);
  const auditionButton = getButtonProps(auditionButtonConfig);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[15%] -right-[5%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] -left-[5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      <PageHeader
        title="Find Your Ensemble"
        subtitle="Discover the orchestra or ensemble that’s the perfect fit for your passion and skill level."
        image={headerImage}
      />

      {/* Intro Section */}
      <section className="container mx-auto py-24 px-4 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                    <Music className="w-4 h-4" />
                    Join the Legacy
                </div>
                <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">Join a Thriving Musical Community</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    The Kawartha Youth Orchestra (KYO) welcomes students aged 8 to 28. We offer a structured, progressive suite of ensembles designed to help young musicians advance their skills in a safe, inclusive environment.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  {registerButton && (
                    <Button asChild size="lg" className="rounded-full px-8 py-7 text-lg shadow-lg hover:shadow-primary/20 transition-all hover:scale-105">
                        <Link href={registerButton.href} target={registerButton.target}>{registerButton.text}</Link>
                    </Button>
                  )}
                  {auditionButton && (
                    <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-7 text-lg border-primary/20 hover:bg-primary/5 transition-all">
                        <Link href={auditionButton.href} target={auditionButton.target}>{auditionButton.text}</Link>
                    </Button>
                  )}
                </div>
            </motion.div>

            <motion.div 
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
            >
                {joinImage && (
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl group border-8 border-white">
                        <Image
                            src={joinImage.imageUrl}
                            alt={joinImage.description}
                            width={600}
                            height={450}
                            className="object-cover w-full aspect-[4/3] transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                )}
                {/* Decorative Element */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -z-10" />
            </motion.div>
        </div>
      </section>

      {/* Main Orchestras */}
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
                        <Users className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-headline font-bold">Our Core Orchestras</h2>
                    <p className="mx-auto max-w-3xl text-muted-foreground text-lg mt-4 font-light">
                        A clear musical pathway from first notes to symphonic mastery.
                    </p>
                </div>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
                {orchestras.map((item) => {
                    const image = getImage(item.imageId);
                    const Icon = item.icon;
                    return (
                        <motion.div key={item.title} variants={itemVariants}>
                            <Card className="group relative flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(10,61,44,0.12)] border-primary/5 bg-white/70 backdrop-blur-md hover:-translate-y-3">
                                {image && (
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        <Image
                                            src={image.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <div className="absolute bottom-4 left-6 text-white">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-primary/80 px-3 py-1 rounded-full backdrop-blur-sm">
                                                <Icon className="w-3 h-3" />
                                                {item.experience}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="pb-4">
                                    <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors duration-300">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground leading-relaxed italic font-serif">{item.description}</p>
                                </CardContent>
                                {registerButton && (
                                  <CardFooter className="pt-6 border-t border-primary/5">
                                    <Button asChild className="w-full rounded-full group-hover:scale-[1.02] transition-transform shadow-md">
                                        <Link href={registerButton.href}>Register Now <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
                                    </Button>
                                  </CardFooter>
                                )}
                            </Card>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
      </section>
      
      <ProgramPathways />

      {/* Philosophy Section */}
      <section className="py-24 px-4">
          <div className="container mx-auto">
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid lg:grid-cols-3 gap-12 items-center"
            >
                <div className="lg:col-span-1">
                    <h2 className="text-4xl font-headline font-bold mb-6">Our Philosophy</h2>
                    <p className="text-muted-foreground text-lg font-light leading-relaxed mb-8">
                        We believe in a holistic approach to music education that balances artistic achievement with a supportive and inspiring environment.
                    </p>
                    <div className="h-1 w-20 bg-primary/20 rounded-full" />
                </div>
                <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                    <Card className="bg-white/50 backdrop-blur-sm border-primary/5 hover:border-primary/20 transition-all p-2 shadow-sm hover:shadow-md">
                        <CardHeader className="flex flex-row items-center gap-5">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Star className="w-6 h-6" />
                            </div>
                            <CardTitle className="font-headline text-xl">Diverse Approach</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm leading-relaxed">Our repertoire embraces a broad range of styles, including classical works, pop arrangements, and film music.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/50 backdrop-blur-sm border-primary/5 hover:border-primary/20 transition-all p-2 shadow-sm hover:shadow-md">
                        <CardHeader className="flex flex-row items-center gap-5">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Award className="w-6 h-6" />
                            </div>
                            <CardTitle className="font-headline text-xl">Performance Based</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm leading-relaxed">Each orchestra performs in three public concerts per year, building confidence and community connection.</p>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
          </div>
       </section>

      {/* Supplementary Ensembles */}
       <section className="py-24 px-4 bg-secondary/30">
        <div className="container mx-auto">
            <div className="text-center mb-16">
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-secondary/20 rounded-2xl text-secondary-foreground mb-2">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-headline font-bold">Creative & Supplementary Programs</h2>
                    <p className="mx-auto max-w-2xl text-muted-foreground text-lg mt-4 font-light leading-relaxed">
                        Broaden your musical horizons with specialized training in diverse genres and modern techniques.
                    </p>
                </div>
            </div>
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
                {supplementaryEnsembles.map((ensemble) => {
                    const image = getImage(ensemble.imageId);
                    return (
                        <motion.div key={ensemble.title} variants={itemVariants}>
                            <Card className="group text-center flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-xl border-primary/5 bg-white/80 backdrop-blur-sm hover:-translate-y-2">
                                {image && (
                                    <div className="relative aspect-video overflow-hidden">
                                        <Image
                                            src={image.imageUrl}
                                            alt={ensemble.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <CardHeader className="items-center flex-grow">
                                    <CardTitle className="font-headline text-2xl pt-2 group-hover:text-primary transition-colors">{ensemble.title}</CardTitle>
                                    <CardDescription className="pt-2 italic line-clamp-3">{ensemble.description}</CardDescription>
                                </CardHeader>
                                {registerButton && (
                                    <CardFooter className="justify-center pt-4 border-t border-primary/5">
                                         <Button asChild variant="outline" className="rounded-full px-6 hover:bg-primary hover:text-white transition-all">
                                            <Link href={registerButton.href}>Enroll Now</Link>
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
      </section>

      {/* Aid Section */}
       <section className="py-24 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-2">
                        <HeartHandshake className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-headline font-bold">Financial Aid & Scholarships</h2>
                    <p className="mx-auto max-w-3xl text-muted-foreground text-lg mt-4 font-light">
                        Ensuring no student is turned away due to financial need.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {financialAidOptions.map(option => {
                        const link = getLinkById(option.linkId);
                        const image = getImage(option.imageId);
                        return (
                            <motion.div 
                                key={option.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full group transition-all duration-500 hover:shadow-2xl border-primary/5 overflow-hidden rounded-3xl">
                                    {image && (
                                        <div className="relative aspect-[16/9] overflow-hidden">
                                            <Image
                                                src={image.imageUrl}
                                                alt={option.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                                        </div>
                                    )}
                                    <CardHeader className="flex flex-row items-center gap-5 pt-8">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                            <option.icon className="w-6 h-6"/>
                                        </div>
                                        <CardTitle className="font-headline text-2xl">{option.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-8">
                                        <p className="text-muted-foreground leading-relaxed">{option.description}</p>
                                        {link && (
                                            <Button asChild variant="link" className="p-0 h-auto mt-6 text-primary font-bold group-hover:translate-x-2 transition-transform">
                                                <Link href={link.url}>Learn More <ArrowRight className="ml-2 w-4 h-4" /></Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {scholarships.map(scholarship => (
                        <motion.div 
                            key={scholarship.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full bg-white/50 backdrop-blur-sm border-primary/5 hover:border-primary/20 transition-all shadow-sm">
                                <CardHeader className="flex flex-row items-center gap-5">
                                    <div className="p-3 bg-secondary/20 rounded-xl text-secondary-foreground">
                                        <scholarship.icon className="w-6 h-6"/>
                                    </div>
                                    <CardTitle className="font-headline text-xl">{scholarship.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{scholarship.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
          </div>
      </section>

      {/* Community Section */}
       <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
              <h2 className="text-4xl font-headline font-bold leading-tight">Equity & Community Partnerships</h2>
              <p className="text-muted-foreground text-lg leading-relaxed font-light">
                The KYO strives to be an inclusive, anti-discriminatory space that reflects the diversity of our broader community.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-5 p-6 rounded-2xl bg-white/60 shadow-sm border border-white/40">
                  <Handshake className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">New Canadians Centre Partnership</h4>
                    <p className="text-muted-foreground text-sm">Offering improved access to KYO programs for newcomer youth and families.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 p-6 rounded-2xl bg-white/60 shadow-sm border border-white/40">
                  <School className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">School Outreach</h4>
                    <p className="text-muted-foreground text-sm">Providing instrumental coaching, masterclasses, and access to our instrument lending library for local schools.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="relative"
            >
                {communityImage && (
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl group border-[12px] border-white/50">
                        <Image
                        src={communityImage.imageUrl}
                        alt={communityImage.description}
                        width={600}
                        height={450}
                        className="object-cover w-full aspect-[4/3] transition-transform duration-1000 group-hover:scale-105"
                        />
                    </div>
                )}
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Join the Orchestra CTA */}
      <section className="py-32 px-4 bg-background">
        <div className="container mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-16 rounded-[3rem] bg-[#0a3d2c] text-white text-center relative overflow-hidden group shadow-[0_30px_100px_rgba(10,61,44,0.3)] border border-white/10"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent)] z-0" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-8">
                        <Sparkles className="w-4 h-4" />
                        Start Your Journey
                    </div>
                    <h3 className="text-4xl md:text-6xl font-headline font-bold mb-8">Ready to Play With Us?</h3>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                        Whether you're just starting out or ready for the big stage, there's a place for you in the KYO family.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button asChild size="lg" className="bg-white text-[#0a3d2c] hover:bg-forest-50 px-12 py-8 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-all duration-300">
                            <Link href="/contact">Apply to Join</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-12 py-8 rounded-full font-bold text-xl transition-all">
                            <Link href="/about">Learn More</Link>
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

    </div>
  );
}

    

    