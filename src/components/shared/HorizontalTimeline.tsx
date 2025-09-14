"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const timelineData = [
    {
    year: "2007-2012",
    title: "The Founding Years",
    content: "KYO was established by Karen Lauder, Ben Bell, and Steven Brown, with Michael Newnham of the Peterborough Symphony Orchestra as the first conductor. The group grew to 30 players but later declined as founding members aged out and local school music programs were reduced.",
  },
  {
    year: "2013-2016",
    title: "Strategic Recruitment",
    content: "A new strategic plan led to the hiring of Ann Millen for recruitment. She successfully established bursaries and an instrument library through community donations, significantly lowering barriers to entry. Outreach events in schools helped attract a new generation of musicians.",
  },
  {
    year: "2017-2019",
    title: "Expanding Ensembles",
    content: "To cater to diverse skill levels, the Junior (JKYO) and Intermediate (IKYO) orchestras were launched under the leadership of Marilyn Chalk and later John Fautley. The Community Foundation of Greater Peterborough provided crucial support by managing dedicated funds for KYO.",
  },
  {
    year: "2020-2021",
    title: "Pandemic Adaptation & New Programs",
    content: "Inspired by the El Sistema model, the UPBEAT! after-school program was launched in 2020. In response to the COVID-19 pandemic, KYO pivoted to virtual e-orchestras and online concerts to keep the music playing. Marilyn Chalk became the Acting Conductor for The Orchestras during this period.",
  },
  {
    year: "2022-Present",
    title: "Growth and New Leadership",
    content: "The organization has continued its growth trajectory, welcoming new artistic leaders like Dr. Alexander Cannon, Maziar Heidari, and currently Murray Lefebvre. With expanded faculty and the addition of a Jazz Ensemble, KYO has solidified its role as a comprehensive center for youth music education in the Kawarthas.",
  },
]

export default function HorizontalTimeline() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollY = window.scrollY;
      const containerTop = container.offsetTop;
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      const scrollableHeight = containerHeight - viewportHeight;
      const scrollProgress = Math.max(0, Math.min(1, (scrollY - containerTop) / scrollableHeight));
      
      const newIndex = Math.floor(scrollProgress * timelineData.length);
      
      if (newIndex < timelineData.length) {
        setActiveIndex(newIndex);
      } else {
        setActiveIndex(timelineData.length - 1);
      }
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
      <div ref={containerRef} className="relative" style={{ height: `${timelineData.length * 100}vh` }}>
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-3xl h-96">
            {timelineData.map((event, index) => {
               const distance = Math.abs(activeIndex - index);
               const isActive = activeIndex === index;

              return (
                <div
                  key={event.year}
                  className={cn(
                    "absolute inset-0 w-full h-full transition-all duration-500 ease-in-out",
                  )}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translateY(${(index - activeIndex) * 100}px) scale(${1 - distance * 0.1})`,
                    zIndex: timelineData.length - distance,
                  }}
                >
                  <Card className={cn(
                      "w-full h-full flex flex-col justify-center",
                      isActive ? "border-primary shadow-2xl" : "shadow-md"
                  )}>
                    <CardHeader>
                      <div className="flex items-baseline gap-4">
                        <p className="text-4xl font-bold text-primary">{event.year}</p>
                        <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-lg">{event.content}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
