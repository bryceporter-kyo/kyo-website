"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";

const timelineData = [
  {
    year: "2007-2012",
    title: "The Founding Years",
    content: "KYO was established by Karen Lauder, Ben Bell, and Steven Brown, with Michael Newnham of the Peterborough Symphony Orchestra as the first conductor. This first iteration of the orchestra grew to a tight knit group of 30 players but further growth was slow as local school music programs were reduced.",
  },
  {
    year: "2013-2016",
    title: "Outreach & Recruitment",
    content: "A new strategic plan led to the hiring of Ann Millen for recruitment. She successfully established bursaries and an instrument library through community donations, significantly lowering barriers to entry. Outreach events in schools helped attract a new generation of musicians.",
  },
  {
    year: "2017-2019",
    title: "Expanding Ensembles",
    content: "To cater to diverse skill levels, the Junior (JKYO) and Intermediate (IKYO) orchestras were launched under the leadership of Marilyn Chalk and later John Fautley. The Community Foundation of Greater Peterborough provided crucial support by managing dedicated funds for KYO.",
  },
  {
    year: "2020-2021",
    title: "Pandemic Adaptation",
    content: "Inspired by the El Sistema model, the Upbeat! after-school program was launched in 2020. In response to the COVID-19 pandemic, KYO pivoted to virtual e-orchestras and online concerts to keep the music playing. Marilyn Chalk became the Acting Conductor for The Orchestras during this period.",
  },
  {
    year: "2022-Present",
    title: "Growth & New Leadership",
    content: "The organization has continued its growth trajectory, welcoming new artistic leaders like Dr. Alexander Cannon, Maziar Heidari, and current lead conductor Murray Lefebvre. With expanded faculty and the addition of a Jazz Ensemble and Folk Ensemble, KYO has solidified its role as a comprehensive centre for youth music education in the Kawarthas.",
  },
];

export default function HorizontalTimeline() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (!isClient || isMobile) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollY = window.scrollY;
      const containerTop = container.offsetTop;
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrollableAreaStart = containerTop - viewportHeight / 2 + 200;
      const scrollProgress = scrollY - scrollableAreaStart;
      const itemScrollSpace = (containerHeight - viewportHeight) / timelineData.length;

      let newIndex = Math.floor(scrollProgress / itemScrollSpace);
      newIndex = Math.max(0, Math.min(newIndex, timelineData.length - 1));

      setActiveIndex(newIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient, isMobile]);

  const scrollToIndex = (idx: number) => {
    if (isMobile) {
      setActiveIndex(idx);
      const element = document.getElementById(`timeline-card-${idx}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const containerTop = container.offsetTop;
    const containerHeight = container.offsetHeight;
    const viewportHeight = window.innerHeight;

    const scrollableAreaStart = containerTop - viewportHeight / 2 + 200;
    const itemScrollSpace = (containerHeight - viewportHeight) / timelineData.length;

    const targetScrollY = scrollableAreaStart + idx * itemScrollSpace + itemScrollSpace / 2;
    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });
  };

  if (!isClient) {
    return null;
  }

  // Mobile Version: Vertical Chronological Feed
  if (isMobile) {
    return (
      <div className="py-12 px-4 space-y-12">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-headline font-bold">Our Journey</h2>
          <p className="text-sm text-muted-foreground">
            Tracing our history of growth, innovation, and musical achievement.
          </p>
        </div>

        {/* Clickable Mobile Year Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none px-2 justify-start">
          {timelineData.map((event, idx) => (
            <button
              key={`tab-mob-${idx}`}
              onClick={() => scrollToIndex(idx)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                activeIndex === idx
                  ? "bg-primary text-white border-transparent shadow-md"
                  : "bg-white text-muted-foreground border-slate-200"
              )}
            >
              {event.year}
            </button>
          ))}
        </div>

        {/* Vertical List with Connective Line */}
        <div className="relative border-l-2 border-primary/20 pl-6 ml-4 space-y-12">
          {timelineData.map((event, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={`mob-card-${index}`}
                id={`timeline-card-${index}`}
                className="relative scroll-mt-24"
              >
                {/* Year Marker Point */}
                <div
                  className={cn(
                    "absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white transition-all duration-350 shadow-sm",
                    isActive ? "bg-primary scale-125 ring-4 ring-primary/20" : "bg-slate-300"
                  )}
                />
                <Card className={cn(
                  "transition-all duration-300 border border-slate-100 shadow-sm",
                  isActive ? "ring-2 ring-primary/20 border-primary/30 bg-slate-50/50" : ""
                )}>
                  <CardHeader className="pb-2">
                    <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.year}
                    </span>
                    <CardTitle className="font-headline text-xl leading-tight">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.content}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Interactive Clickable Timeline
  return (
    <div className="w-full py-12 md:py-16">
      <div className="w-full flex flex-col items-center justify-center">
        {/* Navigation Section */}
        <div className="text-center mb-6 max-w-4xl px-4 z-20">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Journey</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-sm md:text-base mt-2">
            Tracing our history of growth, innovation, and musical achievement.
          </p>

          {/* Interactive Navigation Pills */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6">
            {timelineData.map((event, idx) => (
              <button
                key={`tab-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "group px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border flex items-center gap-2",
                  activeIndex === idx
                    ? "bg-primary text-white border-transparent shadow-lg shadow-primary/25 scale-105"
                    : "bg-white/80 hover:bg-white text-muted-foreground border-primary/10 hover:border-primary/20 hover:text-primary"
                )}
              >
                {event.year}
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-300",
                    activeIndex === idx ? "rotate-90 text-white" : "group-hover:translate-x-0.5 text-slate-400"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Content Box Area */}
        <div className="relative w-full max-w-4xl px-4 md:px-6 flex items-center justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            {timelineData.map((event, index) => {
              const isActive = activeIndex === index;
              if (!isActive) return null;

              const yearParts = event.year.split("-");

              return (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full max-w-3xl"
                >
                  <Card className="w-full border-primary/10 bg-white shadow-xl p-6 md:p-8 rounded-[2rem] flex flex-col justify-center">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4 md:gap-5">
                        <div className="bg-primary/5 px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center border border-primary/10 shrink-0">
                          <span className="text-lg md:text-xl font-bold text-primary leading-tight font-headline">
                            {yearParts[0]}
                          </span>
                          {yearParts[1] && (
                            <span className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                              to {yearParts[1]}
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                            Milestone Phase
                          </span>
                          <CardTitle className="font-headline text-2xl md:text-3xl text-slate-800">
                            {event.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-light">
                        {event.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
