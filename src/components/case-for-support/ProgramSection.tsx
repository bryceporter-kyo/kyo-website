import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import CountUp from '@/components/shared/CountUp';

export type ProgramStat = { value: string; label: string };
export type ProgramQuote = { text: string; author: string };

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
} as const;

export function ProgramSection({
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
          <h3 className="text-3xl font-headline font-bold text-slate-900 transition-colors duration-150 group-hover:text-primary">
            {title}
          </h3>
          <p className="text-slate-600 font-light text-base leading-relaxed">{summary}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-headline font-bold text-primary">
                <CountUp value={stat.value} />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                {stat.label}
              </div>
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

// Static content for each program, shared by both the general page and
// the dynamic funder pages so copy only needs to be maintained in one place.
export const PROGRAM_CONTENT: Record<
  'orchestras' | 'upbeat' | 'lessons',
  {
    title: string;
    summary: string;
    stats: ProgramStat[];
    whoWeServe: string;
    investmentGoes: string[];
    quote: ProgramQuote;
    href: string;
  }
> = {
  orchestras: {
    title: 'The Orchestras Program',
    summary:
      'A structured, progressive suite of orchestras, group lessons, and creative courses guiding youth from their first note to professional level performance.',
    stats: [
      { value: '120+', label: 'Students served annually' },
      { value: '70%', label: 'Average fee reduction' },
      { value: '4 yrs', label: 'Average student tenure' },
    ],
    whoWeServe:
      'Serving youth ages 7 to 22, from complete beginners to advanced musicians preparing for post secondary music programs, with deeply subsidized tuition and income based bursaries so no student is turned away.',
    investmentGoes: [
      'Instructor fees for professional musicians and educators',
      'Subsidized tuition and income based bursaries',
      'Instrument lending, maintenance, and insurance',
      'Facility and operational costs throughout the school year',
      'Outreach and partnership activities into schools and newcomer communities',
    ],
    quote: {
      text:
        'The KYO spirit of generosity and commitment, not only to music, but to the young people who make up all the KYO teams, has allowed me to share my knowledge and ability with others through mentorship.',
      author: 'Tabitha, SKYO Musician',
    },
    href: '/programs/orchestras',
  },
  upbeat: {
    title: 'UpBeat!',
    summary:
      'A fully subsidized after school music and social development program for children ages 8 to 14 who face economic and systemic barriers to arts participation, rooted in the El Sistema model.',
    stats: [
      { value: '87%', label: 'Retention rate' },
      { value: '50%+', label: 'Participants identifying as non-white' },
      { value: '60', label: 'Students served, twice weekly' },
    ],
    whoWeServe:
      'Serving children from newcomer families, low income households, Indigenous communities, and neurodivergent youth, with free instruments, a nutritious snack, transportation, and social emotional support at every session.',
    investmentGoes: [
      'A full time Wellness Coordinator at every session',
      'Free instruments, instruction, and transportation',
      'Healthy snacks provided at every session',
      'Instructor training in trauma informed and neurodiverse inclusive practice',
      'Continued growth toward serving more of the students on our waitlist',
    ],
    quote: {
      text:
        'UpBeat! isn\u2019t just about music. It\u2019s about creating a place where kids feel seen, supported, and inspired. For some, this is the first place where they\u2019ve really felt they belonged.',
      author: 'Colin McMahon, Program Manager',
    },
    href: '/programs/upbeat',
  },
  lessons: {
    title: 'The Lessons Program',
    summary:
      'Weekly instrumental instruction delivered by conservatory trained teachers, building the technical foundation that feeds directly into KYO\u2019s ensemble programs.',
    stats: [
      { value: '15', label: 'Current instructors' },
      { value: '330+', label: 'New students planned over five years' },
      { value: '44', label: 'Lessons per year' },
    ],
    whoWeServe:
      'Serving youth ages 7 to 18 across the region at every stage of development, from complete beginners to students preparing for post secondary music study, with a universal subsidy and sliding scale bursaries.',
    investmentGoes: [
      'Instructor fees for 15 current and up to 9 new teachers',
      'Subsidized tuition and income based bursaries',
      'Instrument acquisition, maintenance, and lending',
      'School based outreach delivery to reduce transportation barriers',
      'Community partnership activities reaching newcomer and equity deserving families',
    ],
    quote: {
      text:
        'Our teen aspires to be a professional musician and the KYO is helping her toward that goal. We are especially grateful for the orchestra\u2019s subsidy program.',
      author: 'Jenny, SKYO Parent',
    },
    href: '/programs/lessons',
  },
};
