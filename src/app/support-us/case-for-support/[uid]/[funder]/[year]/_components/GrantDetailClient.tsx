"use client";

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  GrantDetailsCard,
  ValuesAlignment,
  PastSupportSection,
  GrantQASection,
  BudgetBreakdownSection,
  TimelineSection,
  ReportingPlanSection,
  RecognitionPlanSection,
} from '@/components/case-for-support/FunderPageSections';
import { 
  Sparkles, 
  Download, 
  Users, 
  Heart, 
  Award, 
  Landmark, 
  TrendingUp,
  Smile,
  HeartHandshake
} from 'lucide-react';
import CountUp from '@/components/shared/CountUp';
import { GrantCase } from '@/lib/case-for-support';
import { ProgramSection, PROGRAM_CONTENT } from '@/components/case-for-support/ProgramSection';
import { DriveFolderLink } from '@/components/case-for-support/DriveFolderLink';

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

interface GrantDetailClientProps {
  grant: GrantCase;
}

export default function GrantDetailClient({ grant }: GrantDetailClientProps) {
  const [yearsOfService, setYearsOfService] = useState<number>(23);
  const [contactInfo, setContactInfo] = useState<{ email: string; phone: string } | null>(null);

  useEffect(() => {
    // 1. Calculate years of service
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

    // 2. Assemble contact info client-side so static HTML scrapers do not detect it
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

  const {
    funderName,
    grantName,
    amountRequested,
    grantCycleYear,
    primaryProgram,
    fundingType,
    numberOfYears,
    matchRequired,
    matchAmount,
    submissionDate,
    applicationDeadline,
    customLetterBody,
    valuesAlignment,
    reportingPlan,
    recognitionPlan,
    pastSupport,
    budgetBreakdown,
    timeline,
    grantQA,
    driveFolderUrl,
    caseForSupportPdfUrl,
    grantApplicationPdfUrl,
    contactName,
    contactEmail,
    signerName,
    signerTitle,
    headerImageUrl,
  } = grant;

  const resolvedSignerName = signerName || 'Bryce Porter';
  const resolvedSignerTitle = signerTitle || 'Chair, Board of Directors';
  const resolvedContactName = contactName || 'the KYO team';

  const caseForSupportHref = caseForSupportPdfUrl || '/documents/kyo-case-for-support.pdf';

  // Format currency
  const amountFormatted = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(amountRequested);

  // Map programOfSupport string value to content keys
  const progKey = primaryProgram === 'Orchestras' 
    ? 'orchestras' 
    : primaryProgram === 'Upbeat!' 
      ? 'upbeat' 
      : primaryProgram === 'Lessons' 
        ? 'lessons' 
        : 'general';

  const showAllPrograms = progKey === 'general';
  const singleProgram = !showAllPrograms ? PROGRAM_CONTENT[progKey] : null;

  const askSentence = showAllPrograms
    ? `KYO respectfully requests ${amountFormatted} in support of our programs${grantName ? ` through the ${grantName}` : ''}.`
    : `KYO respectfully requests ${amountFormatted} in support of ${singleProgram?.title}${grantName ? ` through the ${grantName}` : ''}.`;

  const dynamicStatStrip = [
    { value: `${yearsOfService} Years`, label: 'Serving the Kawarthas', icon: Award },
    { value: '700+ Youth', label: 'Supported since inception', icon: Users },
    { value: '3 Streams', label: 'Core program offerings', icon: Sparkles },
    { value: 'Regional', label: 'Peterborough & Kawarthas', icon: Landmark },
  ];

  return (
    <div className="relative overflow-hidden bg-background min-h-screen">
      <PageHeader
        title="Case For Support"
        subtitle={`Prepared for ${funderName}`}
        imageUrl={headerImageUrl || undefined}
      >
        <DriveFolderLink 
          driveFolderUrl={driveFolderUrl || null} 
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors border border-white/20" 
        />
        {grantApplicationPdfUrl && (
          <Button 
            asChild 
            variant="outline" 
            className="rounded-full px-6 py-5 text-sm font-semibold border-white/20 text-white hover:bg-white/10 bg-transparent backdrop-blur-sm shadow-sm"
          >
            <a href={grantApplicationPdfUrl} download>
              <Download className="w-4 h-4 mr-2" /> Download Grant Application
            </a>
          </Button>
        )}
        <Button 
          asChild 
          className="rounded-full px-6 py-5 text-sm font-semibold bg-white text-primary hover:bg-white/90 shadow-sm"
        >
          <a href={caseForSupportHref} download>
            <Download className="w-4 h-4 mr-2" /> Download Case for Support
          </a>
        </Button>
      </PageHeader>

      {/* Grant Details summary card */}
      <div className="container mx-auto max-w-4xl px-4 pt-8">
        <GrantDetailsCard
          funderName={funderName}
          grantName={grantName}
          grantCycleYear={grantCycleYear}
          amountRequested={amountFormatted}
          primaryProgram={progKey}
          fundingType={fundingType}
          numberOfYears={numberOfYears}
          matchRequired={matchRequired}
          matchAmount={matchAmount}
          submissionDate={submissionDate}
          applicationDeadline={applicationDeadline}
        />
      </div>

      {/* 1. The Ask */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mx-auto"
            {...fadeInUp}
          >
            <TrendingUp className="w-3.5 h-3.5" /> <span>Grant Proposal</span>
          </motion.div>
          <motion.h2 
            className="text-4xl md:text-5xl font-headline font-bold text-slate-900"
            {...fadeInUp}
          >
            A proposal to {funderName}
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed"
            {...fadeInUp}
          >
            {askSentence}
          </motion.p>

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
        </div>
      </section>

      {/* 2. Letter from the Board Chair, addressed to the funder */}
      <section className="py-24 px-4 bg-primary/[0.02] border-y border-primary/5">
        <div className="container mx-auto max-w-3xl">
          <motion.div 
            className="rounded-[3rem] bg-white/80 border border-primary/10 p-10 md:p-16 space-y-6 shadow-xl relative overflow-hidden backdrop-blur-md"
            {...fadeInUp}
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">
              A Letter from Our {resolvedSignerTitle.includes('Chair') ? 'Board Chair' : 'Team'}
            </h3>
            <div className="space-y-4 text-slate-600 font-light leading-relaxed text-base md:text-lg">
              {customLetterBody && customLetterBody.length > 0 ? (
                customLetterBody.map((paragraph, index) => (
                  <div key={index} className="prose prose-slate prose-p:leading-relaxed prose-a:text-primary max-w-none text-slate-600">
                    <ReactMarkdown>{paragraph}</ReactMarkdown>
                  </div>
                ))
              ) : (
                <>
                  <p>
                    Access to music education has become one of the clearest fault
                    lines in educational equity. As school music programs shrink
                    and private lessons become a luxury few families can afford,
                    young people without means are quietly shut out of
                    opportunities that shape confidence, connection, and creative
                    growth for a lifetime.
                  </p>
                  <p>
                    The Kawartha Youth Orchestra exists to close that gap, and{' '}
                    <strong>{funderName}</strong>&rsquo;s consideration of this request means a great
                    deal to the young musicians and families we serve. For more
                    than two decades, we have built a community where every young
                    musician belongs, supported by deeply subsidized tuition,
                    income based bursaries, and a firm commitment that no student
                    is ever turned away due to financial need.
                  </p>
                  <p>
                    None of this is possible without funding partners like <strong>{funderName}</strong> who share
                    our belief that access to the arts is not a privilege. It is a
                    right. Thank you for taking the time to consider what your support
                    would make possible.
                  </p>
                </>
              )}
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-headline text-lg font-bold text-slate-900">{resolvedSignerName}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  {resolvedSignerTitle}, Kawartha Youth Orchestra
                </p>
              </div>
              {grant.signerImageUrl ? (
                <div className="w-16 h-16 rounded-full overflow-hidden relative border-2 border-white shadow-sm shrink-0">
                  <Image 
                    src={grant.signerImageUrl} 
                    alt={resolvedSignerName} 
                    fill 
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Heart className="w-8 h-8 fill-primary/10" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Why This Work Matters */}
      <section className="py-24 px-4 bg-slate-50/50">
        <div className="container mx-auto max-w-6xl space-y-16">
          <motion.div 
            className="text-center space-y-4"
            {...fadeInUp}
          >
            <h3 className="text-3xl font-headline font-bold text-slate-900">
              Why This Work Matters
            </h3>
            <p className="text-slate-500 font-light max-w-2xl mx-auto text-base">
              KYO was founded to directly counter barriers to music education, providing youth with access to high quality instruction in a safe, welcoming community where they can thrive.
            </p>
          </motion.div>

          {/* Core Values Cards Grid */}
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
                <Card className="rounded-3xl border border-white/20 bg-white/60 backdrop-blur-md p-8 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between w-full">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                        <val.icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-headline font-bold text-xl text-slate-900">{val.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600 font-light leading-relaxed">{val.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Why KYO aligns with this funder */}
      <ValuesAlignment funderName={funderName} text={valuesAlignment} />

      {/* 5. Past support from this funder */}
      <PastSupportSection funderName={funderName} records={pastSupport} />

      {/* 6. Credibility Strip */}
      <section className="py-24 px-4 bg-primary relative overflow-hidden text-white">
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

      {/* 7. Programs */}
      <section className="py-24 px-4 space-y-20">
        {showAllPrograms ? (
          <div className="container mx-auto max-w-4xl space-y-16">
            <ProgramSection {...PROGRAM_CONTENT.orchestras} />
            <ProgramSection {...PROGRAM_CONTENT.upbeat} />
            <ProgramSection {...PROGRAM_CONTENT.lessons} />
          </div>
        ) : (
          <div className="container mx-auto max-w-4xl">
            {singleProgram ? (
              <ProgramSection {...singleProgram} />
            ) : (
              <p className="text-center text-slate-500 font-light">Program details unavailable.</p>
            )}
          </div>
        )}
      </section>

      {/* 8. Grant application Q&A */}
      <GrantQASection pairs={grantQA} />

      {/* 9. Budget breakdown */}
      <BudgetBreakdownSection items={budgetBreakdown} amountRequested={amountRequested} />

      {/* 10. Project timeline */}
      <TimelineSection milestones={timeline} />

      {/* 11. Reporting plan */}
      <ReportingPlanSection text={reportingPlan} />

      {/* 12. Recognition plan */}
      <RecognitionPlanSection text={recognitionPlan} />

      {/* 13. Closing gratitude */}
      <section className="py-24 px-4 bg-primary/[0.01] border-t border-primary/5">
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
            On behalf of the Kawartha Youth Orchestra&rsquo;s Board of Directors,
            our instructors, and the more than 700 young people whose lives
            these programs have touched, thank you to {funderName} for your time and
            consideration of {grantName ? <span>the <strong>{grantName}</strong></span> : "our request"}. Your support
            helps us reach more students, deepen our impact, and
            continue building a region where every young person, regardless
            of background, has the chance to thrive through music.
          </p>
          <div className="pt-4">
            <p className="font-headline text-lg font-bold text-slate-900">
              {resolvedSignerName}
            </p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
              {resolvedSignerTitle}, Kawartha Youth Orchestra
            </p>
          </div>
        </motion.div>
      </section>

      {/* 14. Footer / next steps */}
      <section className="py-12 px-4 border-t border-slate-100">
        <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <div className="normal-case text-slate-500 font-light leading-relaxed">
            {contactInfo ? (
              <span>
                Questions about this proposal? Contact {resolvedContactName} at{' '}
                <a href={contactEmail ? `mailto:${contactEmail}` : `mailto:${contactInfo.email}`} className="underline font-bold text-slate-700 hover:text-primary transition-colors">
                  {contactEmail || contactInfo.email}
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
            <a href={caseForSupportHref} download>
              <Download className="w-4 h-4" /> Download PDF Case
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
