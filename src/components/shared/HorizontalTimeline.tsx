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

export default function HorizontalTimeline() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollWrapperRef = React.useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = React.useCallback(() => {
    const container = containerRef.current;
    const scrollWrapper = scrollWrapperRef.current;
    
    if (!container || !scrollWrapper) return;

    const containerRect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const containerTop = containerRect.top;
    const containerHeight = container.offsetHeight;
    const scrollableHeight = containerHeight - viewportHeight;
    
    // Calculate scroll progress (0 to 1)
    let scrollProgress = 0;
    if (containerTop <= 0 && containerTop >= -scrollableHeight) {
      scrollProgress = Math.abs(containerTop) / scrollableHeight;
    } else if (containerTop > 0) {
      scrollProgress = 0;
    } else {
      scrollProgress = 1;
    }

    const totalItems = timelineData.length;
    if (totalItems === 0) return;

    const itemScrollSpace = 1 / totalItems;
    
    const currentSection = Math.min(Math.floor(scrollProgress / itemScrollSpace), totalItems - 1);
    const progressInSection = (scrollProgress % itemScrollSpace) / itemScrollSpace;
    
    const stickyZoneStart = 0.2;
    const stickyZoneEnd = 0.8;
    
    let newActiveIndex = currentSection;
    let horizontalProgress = 0;
    
    if (progressInSection >= stickyZoneStart && progressInSection <= stickyZoneEnd) {
      newActiveIndex = currentSection;
      horizontalProgress = currentSection / (totalItems - 1);
    } else if (progressInSection < stickyZoneStart) {
      const transitionProgress = progressInSection / stickyZoneStart;
      newActiveIndex = currentSection;
      const prevSectionProgress = Math.max(0, currentSection - 1) / (totalItems - 1);
      const currentSectionProgress = currentSection / (totalItems - 1);
      horizontalProgress = prevSectionProgress + transitionProgress * (currentSectionProgress - prevSectionProgress);
    } else {
      const transitionProgress = (progressInSection - stickyZoneEnd) / (1 - stickyZoneEnd);
      newActiveIndex = currentSection + 1;
      const currentSectionProgress = currentSection / (totalItems - 1);
      const nextSectionProgress = Math.min(totalItems - 1, currentSection + 1) / (totalItems - 1);
      horizontalProgress = currentSectionProgress + transitionProgress * (nextSectionProgress - currentSectionProgress);
    }

    const maxHorizontalScroll = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;
    const targetScrollLeft = horizontalProgress * maxHorizontalScroll;
    scrollWrapper.scrollLeft = targetScrollLeft;

    const finalActiveIndex = Math.round(horizontalProgress * (totalItems - 1));
    if (finalActiveIndex !== activeIndex) {
      setActiveIndex(finalActiveIndex);
    }
  }, [activeIndex]);

  React.useEffect(() => {
    const throttledScroll = () => requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", throttledScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [handleScroll]);
  
  const handleDotClick = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const viewportHeight = window.innerHeight;
    const containerHeight = container.offsetHeight;
    const scrollableHeight = containerHeight - viewportHeight;
    
    const itemScrollSpace = 1 / timelineData.length;
    const targetProgress = (index * itemScrollSpace) + (itemScrollSpace * 0.5);
    const targetScrollTop = container.offsetTop + (targetProgress * scrollableHeight);

    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  };

  if (timelineData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No timeline events to display</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full" 
      style={{ height: `${timelineData.length * 150}vh` }}
    >
      <div className="sticky top-0 flex flex-col h-screen overflow-hidden">
        <div className="text-center pt-12 md:pt-24 lg:pt-32">
          <h2 className="text-3xl font-headline font-bold">Our Journey</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
            Tracing our history of growth, innovation, and musical achievement.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            {timelineData.length} milestone{timelineData.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex-grow flex items-center">
          <div 
            ref={scrollWrapperRef} 
            className="flex w-full overflow-x-hidden p-8 no-scrollbar"
          >
            {timelineData.map((event, index) => (
              <div 
                key={`timeline-${index}-${event.year}-${event.title.slice(0,10)}`} 
                className="flex-shrink-0 w-full flex justify-center"
              >
                <div className="w-full md:w-3/4 lg:w-1/2 p-4">
                  <Card className={cn(
                    "transition-all duration-500 ease-out h-full transform-gpu",
                    activeIndex === index 
                      ? "scale-100 shadow-2xl border-primary opacity-100 ring-2 ring-primary/20" 
                      : "opacity-50 scale-95 shadow-md"
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
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 pb-8">
          {timelineData.map((event, index) => (
            <button
              key={`dot-${index}-${event.year}`}
              onClick={() => handleDotClick(index)}
              className={cn(
                "h-3 w-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50", 
                activeIndex === index 
                  ? 'bg-primary scale-125 shadow-lg ring-2 ring-primary/30' 
                  : 'bg-muted hover:bg-primary/50'
              )}
              aria-label={`Go to ${event.year}: ${event.title}`}
            />
          ))}
        </div>

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  )
}
