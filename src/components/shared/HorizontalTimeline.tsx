"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TimelineEvent {
  year: string;
  title: string;
  content: string;
}

interface HorizontalTimelineProps {
  events: TimelineEvent[];
}

export default function HorizontalTimeline({ events }: HorizontalTimelineProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollWrapperRef = React.useRef<HTMLDivElement>(null);
  const textWrapperRef = React.useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = React.useCallback(() => {
    const { current: container } = containerRef;
    const { current: scrollWrapper } = scrollWrapperRef;
    if (!container || !scrollWrapper) return;

    const { top } = container.getBoundingClientRect();
    const scrollableHeight = container.offsetHeight - window.innerHeight;
    
    // The portion of scroll at the beginning and end that is "dead space"
    const scrollBuffer = 0.1; 
    // The portion of the scroll for each "sticky" section
    const stickyThreshold = (1 - scrollBuffer * 2) / events.length; 

    if (top <= 0 && top >= -scrollableHeight) {
      const rawScrollProgress = Math.max(0, Math.min(1, -top / scrollableHeight));
      
      let newActiveIndex = 0;
      let targetScrollLeft = 0;
      
      if (rawScrollProgress < scrollBuffer) {
        newActiveIndex = 0;
        targetScrollLeft = 0;
      } else if (rawScrollProgress >= 1 - scrollBuffer) {
        newActiveIndex = events.length - 1;
        targetScrollLeft = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;
      } else {
        const progressInContent = (rawScrollProgress - scrollBuffer) / (1 - scrollBuffer * 2);
        
        newActiveIndex = Math.floor(progressInContent * events.length);
        
        const progressWithinCard = (progressInContent % (1 / events.length)) * events.length;
        
        const cardWidth = scrollWrapper.scrollWidth / events.length;
        
        // Make it sticky in the middle of the card's scroll section
        if (progressWithinCard > 0.1 && progressWithinCard < 0.9) {
           targetScrollLeft = newActiveIndex * cardWidth;
        } else {
           // Smoothly transition between cards
           const nextCardIndex = (progressWithinCard <= 0.1) ? newActiveIndex : Math.min(events.length - 1, newActiveIndex + 1);
           const transitionProgress = (progressWithinCard <= 0.1) 
                ? (progressWithinCard + 0.1) / 0.2  // Map 0.9-1.0 to 0.5-1.0, and 0.0-0.1 to 0-0.5
                : (progressWithinCard - 0.9) / 0.2;
           
           const prevCardScroll = newActiveIndex * cardWidth;
           const nextCardScroll = Math.min(scrollWrapper.scrollWidth - scrollWrapper.clientWidth, nextCardIndex * cardWidth);

           targetScrollLeft = prevCardScroll + (nextCardScroll - prevCardScroll) * Math.max(0, Math.min(1, transitionProgress));
        }
      }

      if (newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
      
      scrollWrapper.scrollLeft = targetScrollLeft;

    } else if (top > 0) {
        scrollWrapper.scrollLeft = 0;
        if (activeIndex !== 0) setActiveIndex(0);
    } else {
        const targetScrollLeft = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;
        scrollWrapper.scrollLeft = targetScrollLeft;
        if (activeIndex !== events.length - 1) setActiveIndex(events.length - 1);
    }
  }, [activeIndex, events.length]);

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  
  const handleDotClick = (index: number) => {
    const { current: container } = containerRef;
    if (!container) return;
    
    const scrollableHeight = container.offsetHeight - window.innerHeight;

    const contentScrollPercent = (index + 0.5) / events.length;
    const scrollBuffer = 0.1;
    const contentScrollRange = 1 - scrollBuffer * 2;
    const targetRawProgress = scrollBuffer + (contentScrollPercent * contentScrollRange);
    
    const targetScrollTop = container.offsetTop + (targetRawProgress * scrollableHeight);

    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: `${events.length * 150}vh` }}>
      <div ref={textWrapperRef} className="sticky top-0 flex flex-col h-screen overflow-hidden">
        <div className="text-center pt-12 md:pt-24 lg:pt-32">
            <h2 className="text-3xl font-headline font-bold">Our Journey</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                Tracing our history of growth, innovation, and musical achievement.
            </p>
        </div>
        
        <div className="flex-grow flex items-center">
            <div ref={scrollWrapperRef} className="flex w-full overflow-x-hidden p-8 no-scrollbar">
                {events.map((event, index) => (
                <div key={index} className="flex-shrink-0 w-full flex justify-center">
                    <div className="w-full md:w-3/4 lg:w-1/2 p-4">
                        <Card className={cn(
                            "transition-all duration-500 h-full",
                            activeIndex === index ? "transform scale-100 shadow-2xl border-primary" : "opacity-60 scale-95"
                        )}>
                        <CardHeader>
                            <div className="flex items-baseline gap-4">
                                <p className="text-4xl font-bold text-primary">{event.year}</p>
                                <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{event.content}</p>
                        </CardContent>
                        </Card>
                    </div>
                </div>
                ))}
            </div>
        </div>

        <div className="flex justify-center items-center gap-4 pb-8">
            {events.map((event, index) => (
            <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={cn("h-3 w-3 rounded-full transition-all duration-300", 
                  activeIndex === index ? 'bg-primary scale-125' : 'bg-muted hover:bg-primary/50'
                )}
                aria-label={`Go to year ${event.year}`}
            />
            ))}
        </div>

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
      </div>
    </div>
  )
}
