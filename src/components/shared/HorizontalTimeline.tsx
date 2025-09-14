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

  const [activeIndex, setActiveIndex] = React.useState(0);
  const uniqueEvents = events;

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

    const totalItems = uniqueEvents.length;
    if (totalItems === 0) return;

    // Each item gets equal scroll space with sticky behavior
    const itemScrollSpace = 1 / totalItems;
    
    // Find which item section we're in
    const currentSection = Math.min(Math.floor(scrollProgress / itemScrollSpace), totalItems - 1);
    const progressInSection = (scrollProgress % itemScrollSpace) / itemScrollSpace;
    
    // Define sticky zones - each item is "sticky" for 60% of its scroll space
    const stickyZoneStart = 0.2;
    const stickyZoneEnd = 0.8;
    
    let newActiveIndex = currentSection;
    let horizontalProgress = 0;
    
    if (progressInSection >= stickyZoneStart && progressInSection <= stickyZoneEnd) {
      // In sticky zone - stay on current item
      newActiveIndex = currentSection;
      horizontalProgress = currentSection / (totalItems - 1);
    } else if (progressInSection < stickyZoneStart) {
      // Transitioning from previous item
      const transitionProgress = progressInSection / stickyZoneStart;
      const prevIndex = Math.max(0, currentSection - 1);
      newActiveIndex = currentSection;
      horizontalProgress = (prevIndex + transitionProgress * (currentSection - prevIndex)) / (totalItems - 1);
    } else {
      // Transitioning to next item
      const transitionProgress = (progressInSection - stickyZoneEnd) / (1 - stickyZoneEnd);
      const nextIndex = Math.min(totalItems - 1, currentSection + 1);
      newActiveIndex = nextIndex;
      horizontalProgress = (currentSection + transitionProgress * (nextIndex - currentSection)) / (totalItems - 1);
    }

    // Apply horizontal scroll
    const maxHorizontalScroll = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;
    const targetScrollLeft = horizontalProgress * maxHorizontalScroll;
    scrollWrapper.scrollLeft = targetScrollLeft;

    // Update active index
    if (newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
    }
  }, [activeIndex, uniqueEvents]);

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
    
    // Target the middle of the sticky zone for the clicked item
    const itemScrollSpace = 1 / uniqueEvents.length;
    const targetProgress = (index * itemScrollSpace) + (itemScrollSpace * 0.5);
    const targetScrollTop = container.offsetTop + (targetProgress * scrollableHeight);

    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  };

  if (uniqueEvents.length === 0) {
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
      style={{ height: `${uniqueEvents.length * 120 + 50}vh` }}
    >
      <div className="sticky top-0 flex flex-col h-screen overflow-hidden">
        <div className="text-center pt-12 md:pt-24 lg:pt-32">
          <h2 className="text-3xl font-headline font-bold">Our Journey</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
            Tracing our history of growth, innovation, and musical achievement.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            {uniqueEvents.length} milestone{uniqueEvents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex-grow flex items-center">
          <div 
            ref={scrollWrapperRef} 
            className="flex w-full overflow-x-hidden p-8 no-scrollbar"
          >
            {uniqueEvents.map((event, index) => (
              <div 
                key={`timeline-${index}-${event.year}-${event.title.slice(0, 10)}`} 
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
          {uniqueEvents.map((event, index) => (
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
