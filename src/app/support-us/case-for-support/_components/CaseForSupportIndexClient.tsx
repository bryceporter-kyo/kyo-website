"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useImages } from '@/components/providers/ImageProvider';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Download, 
  Check, 
  Users, 
  Heart, 
  Award, 
  Landmark, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Smile,
  HeartHandshake
} from 'lucide-react';
import CountUp from '@/components/shared/CountUp';

const CORE_VALUES = [
  {
    title: "Artistry",
    desc: "We are committed to musical excellence. We cultivate a deep love of music and inspire young musicians to pursue their craft with ambition, expression, and pride.",
    icon: Award,
  },
  {
    title: "Joy",
    desc: "We believe music should be fun. We bring energy, positivity, and inspiration to everything we do, celebrating the joy of making music together.",
    icon: Smile,
  },
  {
    title: "Inclusion",
    desc: "We welcome every young person, regardless of background or experience. We are committed to accessibility, fairness, and building a community where everyone belongs.",
    icon: Users,
  },
  {
    title: "Growth",
    desc: "We support young musicians in developing not just their musical skills, but their confidence and resilience. We encourage responsibility, authenticity, and a commitment to continuous improvement on and off the stage.",
    icon: TrendingUp,
  },
  {
    title: "Connection",
    desc: "We believe in the power of music to bring people together. Through collaboration, mentorship, and community partnerships, we create meaningful relationships that extend beyond the concert hall.",
    icon: HeartHandshake,
  },
  {
    title: "Nurture",
    desc: "We are a safe and caring community. We lead with encouragement and heart, supporting every young person in discovering what they are capable of.",
    icon: Heart,
  },
];

const CREDIBILITY_PARTNERS = [
  'New Canadians Centre of Peterborough',
  'El Sistema Canada',
  'Orchestras Canada',
  'Kawartha Pine Ridge District School Board',
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
} as const;

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, margin: "-100px" }
} as const;

export default function CaseForSupportIndexClient() {
  const { getImage } = useImages();
  const [yearsOfService, setYearsOfService] = useState<number>(23);
  const [contactInfo, setContactInfo] = useState<{ email: string; phone: string } | null>(null);

  useEffect(() => {
    const startDate = new Date(2002, 8, 2); // September 2, 2002
    const today = new Date();
    let diffYears = today.getFullYear() - startDate.getFullYear();
    const hasReachedAnniversary = 
      today.getMonth() > startDate.getMonth() || 
      (today.getMonth() === startDate.getMonth() && today.getDate() >= startDate.getDate());
    if (!hasReachedAnniversary) {
      diffYears--;
    }
    setYearsOfService(diffYears);

    // Assemble contact info client-side so static HTML scrapers do not detect it
    const ePart1 = "contactus";
    const ePart2 = "thekyo.ca";
    const pPart1 = "705";
    const pPart2 = "410";
    const pPart3 = "4025";
    setContactInfo({
      email: `${ePart1}@${ePart2}`,
      phone: `(${pPart1})-${pPart2}-${pPart3}`
    });
  }, []);

  const dynamicStatStrip = [
    { value: `${yearsOfService} Years`, label: 'Serving the Kawarthas', icon: Award },
    { value: '700+ Youth', label: 'Supported since inception', icon: Users },
    { value: '3 Streams', label: 'Core program offerings', icon: Sparkles },
    { value: 'Regional', label: 'Peterborough & Kawarthas', icon: Landmark },
  ];
  
  const headerImage = getImage('page-header-support') || getImage('page-header-donate');
  const whyItMattersImage = getImage('donate-why-it-matters');

  return (
    <div className="relative overflow-hidden bg-background min-h-screen">
      {/* Ambient Background Blur Spots */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] -right-[5%] w-[45%] h-[45%] bg-secondary/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.015]" />
      </div>

      <PageHeader
        title="Case For Support"
        subtitle="Sustaining the vision of youth music and community instruction."
        image={headerImage}
      />

      {/* Dynamic Action Sticky Panel */}
      <div className="container mx-auto max-w-5xl px-4 pt-8 flex justify-end">
        <Button 
          asChild 
          variant="outline" 
          className="rounded-full px-6 border-primary/20 bg-white/80 backdrop-blur-md text-primary hover:bg-primary/5 font-semibold text-xs uppercase tracking-wider gap-2 shadow-sm transition-all duration-300 hover:scale-105"
        >
          <a href="/documents/kyo-case-for-support.pdf" download>
            <Download className="w-4 h-4" /> Download PDF Case
          </a>
        </Button>
      </div>

      {/* 1. The Case, Up Front */}
      <section className="py-20 px-4">
        <motion.div 
          className="container mx-auto max-w-4xl text-center space-y-6"
          {...fadeInUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Core Objective</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-slate-900 leading-tight">
            {yearsOfService} years of removing barriers to music education in the Kawarthas
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-light">
            The Kawartha Youth Orchestra provides accessible, high-quality music
            education and orchestral training to young people across
            Peterborough and the Kawartha Lakes region, regardless of income,
            background, or prior experience.
          </p>
        </motion.div>

        {/* Stats strip cards */}
        <div className="container mx-auto max-w-5xl mt-16">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {dynamicStatStrip.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
                className="cursor-pointer"
              >
                <Card
                  className="rounded-[2.2rem] border border-white/20 bg-white/60 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-center items-center text-center relative overflow-hidden group h-full"
                >
                  <div className="p-3 rounded-full bg-primary/5 text-primary mb-3 transition-transform duration-300 group-hover:scale-110">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-xl md:text-2xl font-headline font-bold text-slate-900">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. Letter from the Board Chair */}
      <section className="py-20 px-4 bg-primary/[0.01] border-y border-primary/5 relative">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            {...fadeInUp}
            className="rounded-[3rem] bg-white/70 backdrop-blur-lg border border-primary/10 p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] bg-primary rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
                A Letter from Our Board Chair
              </span>
              
              <div className="space-y-4 text-slate-600 font-light text-base md:text-lg leading-relaxed">
                <p>
                  Access to music education has become one of the clearest fault
                  lines in educational equity. As school music programs shrink
                  and private lessons become a luxury few families can afford,
                  young people without means are quietly shut out of
                  opportunities that shape confidence, connection, and creative
                  growth for a lifetime.
                </p>
                <p>
                  The Kawartha Youth Orchestra exists to close that gap. For
                  more than two decades, we have built a community where every
                  young musician belongs, supported by deeply subsidized
                  tuition, income-based bursaries, and a firm commitment that no
                  student is ever turned away due to financial need.
                </p>
                <p>
                  None of this is possible without funding partners who share
                  our belief that access to the arts is not a privilege. It is a
                  right. Thank you for taking the time to consider what our
                  programs make possible.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-headline text-lg font-bold text-slate-900">
                    Bryce Porter
                  </p>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                    Chair, Board of Directors, Kawartha Youth Orchestra
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                  <Heart className="w-6 h-6 fill-primary/10" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Why This Work Matters */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            
            <motion.div 
              className="md:col-span-7 space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" /> <span>Social Impact</span>
              </div>
              <h3 className="text-3xl font-headline font-bold text-slate-900">
                Why This Work Matters
              </h3>
              <div className="space-y-4 text-slate-600 font-light leading-relaxed">
                <p>
                  The loss of music specialists in public elementary schools,
                  particularly in low-income areas, combined with the rising cost
                  of private lessons, has walled off high school level music
                  programs and career pathways to those without the means for
                  extensive private training. This breaks social isolation,
                  widens skill gaps, and limits opportunities for holistic youth
                  development.
                </p>
                <p>
                  KYO was founded to directly counter these barriers, providing
                  youth with access to high-quality music education and orchestral
                  training in a safe, welcoming community where they can develop
                  artistry, build social connections, grow in confidence, and
                  foster a lifelong love of music.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="md:col-span-5 relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-3xl -z-10" />
              {whyItMattersImage && (
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-square relative hover:scale-[1.02] transition-transform duration-500">
                  <Image
                    src={whyItMattersImage.imageUrl}
                    alt={whyItMattersImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={whyItMattersImage.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
            </motion.div>

          </div>
        </div>

        {/* Core Values Cards Grid */}
        <div className="container mx-auto max-w-7xl mt-20 px-4">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {CORE_VALUES.map((val) => (
              <motion.div
                key={val.title}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.02 }}
                className="w-full flex"
              >
                <Card className="rounded-3xl border border-white/20 bg-white/60 backdrop-blur-md p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between w-full">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        <val.icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-headline font-bold text-lg text-slate-900">{val.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-light leading-relaxed">{val.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Credibility Strip - Forest Green Background */}
      <section className="py-20 px-4 bg-primary relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <motion.div variants={{ initial: { opacity: 0 }, whileInView: { opacity: 1 } }} className="space-y-1">
              <div className="text-5xl font-headline font-bold text-white">
                <CountUp value={`${yearsOfService}`} />
              </div>
              <div className="text-xs text-white/60 uppercase tracking-widest font-bold">Years in operation</div>
            </motion.div>
            <motion.div variants={{ initial: { opacity: 0 }, whileInView: { opacity: 1 } }} className="space-y-1">
              <div className="text-5xl font-headline font-bold text-white">
                <CountUp value="700+" />
              </div>
              <div className="text-xs text-white/60 uppercase tracking-widest font-bold">Youth served since inception</div>
            </motion.div>
            <motion.div variants={{ initial: { opacity: 0 }, whileInView: { opacity: 1 } }} className="space-y-1">
              <div className="text-5xl font-headline font-bold text-white">
                <CountUp value="4" />
              </div>
              <div className="text-xs text-white/60 uppercase tracking-widest font-bold">National & regional program partners</div>
            </motion.div>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-10 text-center">
            {CREDIBILITY_PARTNERS.map((partner) => (
              <span key={partner} className="text-sm text-white/80 font-medium">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Program Navigation tabs */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-primary/5 shadow-sm">
        <div className="container mx-auto max-w-4xl px-4 py-4 flex justify-center gap-6 md:gap-10 text-xs uppercase tracking-wider font-bold">
          <a href="#orchestras" className="text-slate-500 hover:text-primary transition-colors py-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" /> The Orchestras
          </a>
          <a href="#upbeat" className="text-slate-500 hover:text-primary transition-colors py-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" /> UpBeat!
          </a>
          <a href="#lessons" className="text-slate-500 hover:text-primary transition-colors py-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" /> Lessons Program
          </a>
        </div>
      </div>

      {/* 6. Programs */}
      <section className="py-24 px-4 space-y-24">
        {/* Orchestras */}
        <div id="orchestras" className="container mx-auto max-w-4xl">
          <ProgramSection
            title="The Orchestras Program"
            summary="A structured, progressive suite of orchestras, group lessons, and creative courses guiding youth from their first note to professional level performance."
            stats={[
              { value: '120+', label: 'Students served annually' },
              { value: '70%', label: 'Average fee reduction' },
              { value: '4 yrs', label: 'Average student tenure' },
            ]}
            whoWeServe="Serving youth ages 7 to 22, from complete beginners to advanced musicians preparing for post secondary music programs, with deeply subsidized tuition and income based bursaries so no student is turned away."
            investmentGoes={[
              'Instructor fees for professional musicians and educators',
              'Subsidized tuition and income based bursaries',
              'Instrument lending, maintenance, and insurance',
              'Facility and operational costs throughout the school year',
              'Outreach and partnership activities into schools and newcomer communities',
            ]}
            quote={{
              text: 'The KYO spirit of generosity and commitment, not only to music, but to the young people who make up all the KYO teams, has allowed me to share my knowledge and ability with others through mentorship.',
              author: 'Tabitha, SKYO Musician',
            }}
            href="/programs/orchestras"
          />
        </div>

        {/* UpBeat! */}
        <div id="upbeat" className="container mx-auto max-w-4xl">
          <ProgramSection
            title="UpBeat!"
            summary="A fully subsidized after school music and social development program for children ages 8 to 14 who face economic and systemic barriers to arts participation, rooted in the El Sistema model."
            stats={[
              { value: '87%', label: 'Retention rate' },
              { value: '50%+', label: 'Participants identifying as non-white' },
              { value: '60', label: 'Students served, twice weekly' },
            ]}
            whoWeServe="Serving children from newcomer families, low income households, Indigenous communities, and neurodivergent youth, with free instruments, a nutritious snack, transportation, and social emotional support at every session."
            investmentGoes={[
              'A full time Wellness Coordinator at every session',
              'Free instruments, instruction, and transportation',
              'Healthy snacks provided at every session',
              'Instructor training in trauma-informed and neurodiverse inclusive practice',
              'Continued growth toward serving more of the students on our waitlist',
            ]}
            quote={{
              text: 'UpBeat! isn’t just about music. It’s about creating a place where kids feel seen, supported, and inspired. For some, this is the first place where they’ve really felt they belonged.',
              author: 'Colin McMahon, Program Manager',
            }}
            href="/programs/upbeat"
          />
        </div>

        {/* Lessons Program */}
        <div id="lessons" className="container mx-auto max-w-4xl">
          <ProgramSection
            title="The Lessons Program"
            summary="Weekly instrumental instruction delivered by conservatory trained teachers, building the technical foundation that feeds directly into KYO's ensemble programs."
            stats={[
              { value: '15', label: 'Current instructors' },
              { value: '330+', label: 'New students planned over five years' },
              { value: '44', label: 'Lessons per year' },
            ]}
            whoWeServe="Serving youth ages 7 to 18 across the region at every stage of development, from complete beginners to students preparing for post secondary music study, with a universal subsidy and sliding scale bursaries."
            investmentGoes={[
              'Instructor fees for 15 current and up to 9 new teachers',
              'Subsidized tuition and income based bursaries',
              'Instrument acquisition, maintenance, and lending',
              'School based outreach delivery to reduce transportation barriers',
              'Community partnership activities reaching newcomer and equity deserving families',
            ]}
            quote={{
              text: 'Our teen aspires to be a professional musician and the KYO is helping her toward that goal. We are especially grateful for the orchestra’s subsidy program.',
              author: 'Jenny, SKYO Parent',
            }}
            href="/programs/lessons"
          />
        </div>
      </section>

      {/* 7. Impact Snapshot Cards */}
      <section className="py-24 px-4 bg-primary/[0.01] border-y border-primary/5 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] pointer-events-none" />
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            className="text-center space-y-4 mb-16"
            {...fadeInUp}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> <span>Measurable Change</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-headline font-bold text-slate-900">
              Impact at a Glance
            </h3>
            <p className="text-slate-500 font-light max-w-xl mx-auto text-sm md:text-base">
              A side-by-side comparison of how our three core programs address financial barriers and deliver musical training.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Orchestras */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              className="rounded-[2.5rem] bg-white/70 backdrop-blur-md border border-primary/10 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Orchestras</span>
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-2xl font-headline font-bold text-slate-900">Ensemble & Performance</h4>
                <div className="p-5 rounded-2xl bg-primary/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Youth Served</span>
                  <p className="text-2xl font-headline font-bold text-slate-900"><CountUp value="120+ / year" /></p>
                </div>
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block mb-1">Fee Model</span>
                    <p className="text-slate-600 font-light">70% average tuition reduction with extensive income-based bursaries.</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block mb-1">Track Record</span>
                    <p className="text-slate-600 font-light">23 years of orchestral operations and youth performances in the Kawarthas.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* UpBeat! */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              className="rounded-[2.5rem] bg-primary text-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-white rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">UpBeat!</span>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-2xl font-headline font-bold text-white">Social Development</h4>
                <div className="p-5 rounded-2xl bg-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Youth Served</span>
                  <p className="text-2xl font-headline font-bold text-white"><CountUp value="60 / year" /></p>
                </div>
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <span className="font-bold text-white/90 text-xs uppercase tracking-wider block mb-1">Fee Model</span>
                    <p className="text-white/80 font-light">Fully subsidized. 100% free instruments, tuition, food, and transport.</p>
                  </div>
                  <div>
                    <span className="font-bold text-white/90 text-xs uppercase tracking-wider block mb-1">Track Record</span>
                    <p className="text-white/80 font-light">Grown from an initial 14-student pilot to a permanent bi-weekly stream.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Lessons */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              className="rounded-[2.5rem] bg-white/70 backdrop-blur-md border border-primary/10 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Lessons</span>
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <Landmark className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-2xl font-headline font-bold text-slate-900">Technical Foundation</h4>
                <div className="p-5 rounded-2xl bg-primary/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Scale Target</span>
                  <p className="text-2xl font-headline font-bold text-slate-900"><CountUp value="330+ students" /></p>
                </div>
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block mb-1">Fee Model</span>
                    <p className="text-slate-600 font-light">Universal base subsidy with sliding-scale bursaries for private teachers.</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block mb-1">Track Record</span>
                    <p className="text-slate-600 font-light">23 years of delivering weekly conservatory-grade lessons to students.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 8. Closing gratitude */}
      <section className="py-24 px-4">
        <motion.div 
          {...fadeInUp}
          className="container mx-auto max-w-3xl text-center space-y-6"
        >
          <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
            <Heart className="w-6 h-6 fill-primary/10" />
          </div>
          <h3 className="text-3xl font-headline font-bold text-slate-900">
            A Message of Gratitude
          </h3>
          <p className="text-slate-600 font-light text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            On behalf of the Kawartha Youth Orchestra's Board of Directors,
            our instructors, and the more than 700 young people whose lives
            these programs have touched, thank you for your time and
            consideration. Your investment helps us reach more students,
            deepen our impact, and continue building a region where every
            young person, regardless of background, has the chance to thrive
            through music.
          </p>
          <div className="pt-4">
            <p className="font-headline text-lg font-bold text-slate-900">
              Bryce Porter
            </p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
              Chair, Board of Directors, Kawartha Youth Orchestra
            </p>
          </div>
        </motion.div>
      </section>

      {/* 9. Footer / next steps */}
      <section className="py-12 px-4 border-t border-slate-100">
        <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <div className="normal-case text-slate-500 font-light leading-relaxed">
            {contactInfo ? (
              <span>
                Considering granting to the KYO? Feel free to contact us by email at{' '}
                <a href={`mailto:${contactInfo.email}`} className="underline font-bold text-slate-700 hover:text-primary transition-colors">
                  {contactInfo.email}
                </a>{' '}
                or call us at{' '}
                <a href={`tel:${contactInfo.phone.replace(/[^0-9]/g, '')}`} className="underline font-bold text-slate-700 hover:text-primary transition-colors">
                  {contactInfo.phone}
                </a>.
              </span>
            ) : (
              <span>Considering granting to the KYO? Feel free to contact us by email or phone.</span>
            )}
          </div>
          <Button 
            asChild 
            variant="outline" 
            className="rounded-full px-6 border-primary/20 text-primary hover:bg-primary/5 font-bold text-xs uppercase tracking-wider gap-2 shadow-sm shrink-0"
          >
            <a href="/documents/kyo-case-for-support.pdf" download>
              <Download className="w-4 h-4" /> Download PDF Case
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}

type ProgramStat = { value: string; label: string };
type ProgramQuote = { text: string; author: string };

function ProgramSection({
  title,
  summary,
  stats,
  whoWeServe,
  investmentGoes,
  quote,
  href,
}: {
  title: string;
  summary: string;
  stats: ProgramStat[];
  whoWeServe: string;
  investmentGoes: string[];
  quote: ProgramQuote;
  href: string;
}) {
  return (
    <motion.div
      {...fadeInUp}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
      className="h-full"
    >
      <Card className="rounded-[2.5rem] border border-white/20 p-8 md:p-12 space-y-8 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:border-primary/20 transition-all duration-300 group h-full">
        <div className="space-y-3">
          <h3 className="text-3xl font-headline font-bold text-slate-900 transition-colors duration-150 group-hover:text-primary">{title}</h3>
          <p className="text-slate-600 font-light text-base leading-relaxed">{summary}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-headline font-bold text-primary">
                <CountUp value={stat.value} />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary/80">
            Who We Serve
          </h4>
          <p className="text-slate-600 font-light leading-relaxed text-sm md:text-base">{whoWeServe}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary/80">
            Where Investment Goes
          </h4>
          <ul className="space-y-3">
            {investmentGoes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-600 text-sm md:text-base leading-relaxed">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="font-light">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <blockquote className="border-l-4 border-primary/20 pl-4 italic text-slate-600 bg-slate-50/50 p-4 rounded-r-2xl font-light text-sm md:text-base">
          &ldquo;{quote.text}&rdquo;
          <footer className="text-xs font-bold text-primary uppercase tracking-widest mt-2 not-italic">
            — {quote.author}
          </footer>
        </blockquote>

        <div className="pt-2">
          <Button 
            asChild 
            variant="link" 
            className="px-0 text-primary hover:text-primary/80 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-sm"
          >
            <Link href={href}>
              Read the full {title} overview <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
