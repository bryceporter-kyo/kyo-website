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
    
    // Add a buffer at the start and end of the scroll to create "stickiness"
    const scrollBuffer = 0.1; // 10% buffer at start and end

    if (top <= 0 && top >= -scrollableHeight) {
      // Calculate raw scroll progress (0 to 1)
      const rawScrollProgress = Math.max(0, Math.min(1, -top / scrollableHeight));
      
      // Map the raw progress to a new progress value that includes the buffers
      // The actual scrolling of cards will happen between 10% and 90% of the vertical scroll
      const mappedScrollProgress = Math.max(0, Math.min(1, (rawScrollProgress - scrollBuffer) / (1 - scrollBuffer * 2)));

      // Calculate how much the inner container should scroll
      const scrollAmount = mappedScrollProgress * (scrollWrapper.scrollWidth - scrollWrapper.clientWidth);
      scrollWrapper.scrollLeft = scrollAmount;

      // Update active index based on mapped scroll position
      const cardElements = Array.from(scrollWrapper.children);
      const totalWidth = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;
      
      let cumulativeWidth = 0;
      let newActiveIndex = events.length - 1;

      for (let i = 0; i < cardElements.length; i++) {
        const cardWidth = (cardElements[i] as HTMLElement).offsetWidth;
        const cardScrollPoint = (cumulativeWidth + cardWidth / 2) / totalWidth;
        
        if (mappedScrollProgress < cardScrollPoint) {
            newActiveIndex = i;
            break;
        }
        cumulativeWidth += cardWidth;
      }

      // If we are in the buffers, force the active index to start or end
      if (rawScrollProgress < scrollBuffer) {
        newActiveIndex = 0;
      } else if (rawScrollProgress > 1 - scrollBuffer) {
        newActiveIndex = events.length - 1;
      }

      if (newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
    } else if (top > 0) {
        // Before the component is pinned
        scrollWrapper.scrollLeft = 0;
        if (activeIndex !== 0) setActiveIndex(0);
    } else {
        // After the component is unpinned
        scrollWrapper.scrollLeft = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;
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
    
    const scrollBuffer = 0.1;
    const scrollableHeight = container.offsetHeight - window.innerHeight;

    // Calculate the percentage scroll needed to center the clicked item, accounting for buffer
    const contentScrollRange = 1 - scrollBuffer * 2;
    const targetCardProgress = index / (events.length - 1);
    const targetRawProgress = scrollBuffer + (targetCardProgress * contentScrollRange);
    
    // Calculate the target scrollTop position relative to the document
    const targetScrollTop = container.offsetTop + (targetRawProgress * scrollableHeight);

    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }


  return (
    <div ref={containerRef} className="relative w-full" style={{ height: `${events.length * 75}vh` }}>
      <div ref={textWrapperRef} className="sticky top-0 flex flex-col h-screen overflow-hidden">
        <div className="text-center pt-12 md:pt-24 lg:pt-32">
            <h2 className="text-3xl font-headline font-bold">Our Journey</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                Tracing our history of growth, innovation, and musical achievement.
            </p>
        </div>
        
        <div className="flex-grow flex items-center">
            <div ref={scrollWrapperRef} className="flex w-full overflow-x-auto p-8 no-scrollbar">
                {events.map((event, index) => (
                <div key={index} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
                    <Card className={cn(
                        "transition-all duration-300 h-full",
                        activeIndex === index ? "transform scale-105 shadow-2xl border-primary" : "opacity-60 scale-95"
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
