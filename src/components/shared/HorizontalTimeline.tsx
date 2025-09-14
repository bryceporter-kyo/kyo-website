"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const timelineData = [
  {
    year: "2007-2012",
    title: "Origins of KYO",
    content: "KYO was founded by Karen Lauder, Ben Bell, and Steven Brown, who gathered skilled young musicians in the Peterborough area. Michael Newnham, the new conductor of the Peterborough Symphony Orchestra (PSO), was brought on to conduct. Membership grew to around 30 players, but declined to 11 by 2011 due to members aging out and reduced local music programs.",
  },
  {
    year: "2013-2016",
    title: "Outreach and Recruitment",
    content: "Following a new strategic plan, Ann Millen was hired for a recruitment project. She established bursaries to lower financial barriers and created an instrument library through public donations. Outreach events and school concerts helped attract new musicians, including from the home-schooling community.",
  },
  {
    year: "2017-2019",
    title: "Expanding Ensembles",
    content: "To cater to varying skill levels, the Junior Kawartha Youth Orchestra (JKYO) was launched for new players, led by Marilyn Chalk. As players progressed, the Intermediate Kawartha Youth Orchestra (IKYO) was formed under her leadership, with John Fautley taking over JKYO. The Community Foundation of Greater Peterborough (CFGP) provided solid support, managing dedicated funds for KYO.",
  },
  {
    year: "2020-2021",
    title: "Adaptation and New Programs",
    content: "Inspired by El Sistema, the board launched UPBEAT!, an after-school music program for social change, in 2020. In response to the pandemic, KYO went virtual with e-orchestras, virtual concerts, and livestreams. The 'Farm Team' program also expanded to include all orchestral instrument groups. JKYO Conductor Marilyn Chalk became Acting Conductor of The Orchestras.",
  },
  {
    year: "2022-Present",
    title: "Growth and New Leadership",
    content: "KYO continued to grow, welcoming new artistic leadership including Dr. Alexander Cannon, Maziar Heidari, and currently Murray Lefebvre at the helm of the Senior KYO. The organization solidified its status as a comprehensive centre for music education in the Kawarthas with expanded faculty and programs, including a Jazz Ensemble.",
  },
];


function TimelineCard({ event, isActive }: { event: typeof timelineData[0], isActive: boolean }) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  return (
    <div ref={cardRef} className="py-12">
       <Card className={cn(
          "transition-all duration-700 ease-in-out w-full max-w-3xl mx-auto",
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}>
        <CardHeader>
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-bold text-primary">{event.year}</p>
            <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{event.content}</p>
        </CardContent>
      </Card>
    </div>
  );
}


export default function VerticalTimeline() {
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const timelineRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const timeline = timelineRef.current;
      if (!timeline) return;

      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      const childrenArray = Array.from(timeline.children) as HTMLElement[];

      let currentActiveIndex = -1;

      for (let i = 0; i < childrenArray.length; i++) {
        const child = childrenArray[i];
        const childTop = child.offsetTop + timeline.offsetTop;
        const childBottom = childTop + child.offsetHeight;
        
        if (scrollPosition >= childTop && scrollPosition < childBottom) {
          currentActiveIndex = i;
          break;
        }
      }
      setActiveIndex(currentActiveIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">Our Journey</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                Tracing our history of growth, innovation, and musical achievement.
            </p>
        </div>
        <div ref={timelineRef} className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            
            {timelineData.map((event, index) => (
                <TimelineCard key={index} event={event} isActive={index === activeIndex} />
            ))}
        </div>
    </div>
  );
}
