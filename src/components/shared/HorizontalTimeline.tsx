"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Milestone {
  year: string;
  title: string;
  content: string;
  highlight?: string;
}

const timelineData: Milestone[] = [
  {
    year: "2007-2012",
    title: "The Founding Years",
    content: "KYO was established by Karen Lauder, Ben Bell, and Steven Brown, with Michael Newnham of the Peterborough Symphony Orchestra as the first conductor. This first iteration of the orchestra grew to a tight knit group of 30 players but further growth was slow as local school music programs were reduced.",
    highlight: "Initial orchestra of 30 youth players established with Peterborough Symphony Orchestra leadership."
  },
  {
    year: "2013-2016",
    title: "Outreach & Recruitment",
    content: "A new strategic plan led to the hiring of Ann Millen for recruitment. She successfully established bursaries and an instrument library through community donations, significantly lowering barriers to entry. Outreach events in schools helped attract a new generation of musicians.",
    highlight: "Creation of the community instrument library & bursary fund, lowering barriers for regional youth."
  },
  {
    year: "2017-2019",
    title: "Expanding Ensembles",
    content: "To cater to diverse skill levels, the Junior (JKYO) and Intermediate (IKYO) orchestras were launched under the leadership of Marilyn Chalk and later John Fautley. The Community Foundation of Greater Peterborough provided crucial support by managing dedicated funds for KYO.",
    highlight: "Expansion into multi-tiered ensembles (Junior and Intermediate) with permanent endowment support."
  },
  {
    year: "2020-2021",
    title: "Pandemic Adaptation",
    content: "Inspired by the El Sistema model, the Upbeat! after-school program was launched in 2020. In response to the COVID-19 pandemic, KYO pivoted to virtual e-orchestras and online concerts to keep the music playing. Marilyn Chalk became the Acting Conductor for The Orchestras during this period.",
    highlight: "Launch of the El Sistema-inspired Upbeat! program and digital virtual orchestras."
  },
  {
    year: "2022-Present",
    title: "Growth & New Leadership",
    content: "The organization has continued its growth trajectory, welcoming new artistic leaders like Dr. Alexander Cannon, Maziar Heidari, and current lead conductor Murray Lefebvre. With expanded faculty and the addition of a Jazz Ensemble and Folk Ensemble, KYO has solidified its role as a comprehensive centre for youth music education in the Kawarthas.",
    highlight: "Comprehensive youth music academy with Orchestras, Jazz, Folk Ensembles, and conservatory coaching."
  },
];

export default function HorizontalTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : timelineData.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < timelineData.length - 1 ? prev + 1 : 0));
  };

  const activeEvent = timelineData[activeIndex];
  const yearParts = activeEvent.year.split("-");

  return (
    <div className="w-full py-10 md:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Interactive Era Selector Pills */}
      <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-2 md:gap-3 mb-8 md:mb-10">
        {timelineData.map((event, idx) => {
          const isActive = activeIndex === idx;
          return (
            <button
              key={event.year}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "group px-5 py-2.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 border flex items-center gap-2",
                isActive
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105"
                  : "bg-white text-slate-600 border-slate-200/80 hover:border-primary/40 hover:text-primary hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  isActive ? "bg-white" : "bg-slate-300 group-hover:bg-primary"
                )}
              />
              <span>{event.year}</span>
            </button>
          );
        })}
      </div>

      {/* Main Showcase Card */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEvent.year}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            <Card className="border border-slate-100 bg-white shadow-xl rounded-[2.5rem] p-8 md:p-12 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* Left Column: Year Badge & Milestone Tag */}
                <div className="lg:col-span-4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-3">
                    Era {activeIndex + 1} of {timelineData.length}
                  </div>
                  
                  <div className="font-headline font-bold text-4xl md:text-5xl text-primary leading-tight tracking-tight">
                    {yearParts[0]}
                    {yearParts[1] && (
                      <span className="text-2xl md:text-3xl font-headline font-semibold text-slate-400 block mt-0.5">
                        to {yearParts[1]}
                      </span>
                    )}
                  </div>

                  {activeEvent.highlight && (
                    <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100/80 text-xs md:text-sm text-slate-600 leading-relaxed">
                      <span className="font-bold text-primary block mb-1 uppercase tracking-wider text-[10px]">
                        Milestone Impact
                      </span>
                      {activeEvent.highlight}
                    </div>
                  )}
                </div>

                {/* Right Column: Title & Story */}
                <div className="lg:col-span-8 flex flex-col justify-center space-y-4">
                  <h3 className="text-2xl md:text-3xl font-headline font-bold text-slate-900 leading-snug">
                    {activeEvent.title}
                  </h3>
                  
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed font-normal">
                    {activeEvent.content}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation: Prev / Dots / Next */}
        <div className="flex items-center justify-between mt-6 px-2">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-all text-xs font-bold bg-white shadow-sm hover:shadow"
            aria-label="Previous era"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous Era</span>
          </button>

          {/* Indicator Dots */}
          <div className="flex gap-2">
            {timelineData.map((_, idx) => (
              <button
                key={`dot-btn-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  activeIndex === idx ? "w-6 bg-primary" : "w-2 bg-slate-300 hover:bg-slate-400"
                )}
                aria-label={`Go to era ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-all text-xs font-bold bg-white shadow-sm hover:shadow"
            aria-label="Next era"
          >
            <span>Next Era</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
