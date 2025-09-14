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
    const scrollProgress = -top / scrollableHeight;

    if (top <= 0 && top >= -scrollableHeight) {
      const scrollAmount = scrollProgress * (scrollWrapper.scrollWidth - scrollWrapper.clientWidth);
      scrollWrapper.scrollLeft = scrollAmount;

      // Update active index
      const cardWidth = scrollWrapper.scrollWidth / events.length;
      const newActiveIndex = Math.floor((scrollAmount + cardWidth / 2) / cardWidth);
      if (newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
    }
  }, [activeIndex, events.length]);

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  
  const handleDotClick = (index: number) => {
    const { current: container } = containerRef;
    const { current: scrollWrapper } = scrollWrapperRef;
    if (!container || !scrollWrapper) return;

    const scrollableHeight = container.offsetHeight - window.innerHeight;
    const targetScrollProgress = index / (events.length - 1);
    const targetScrollTop = -targetScrollProgress * scrollableHeight;

    window.scrollTo({
      top: container.offsetTop + targetScrollTop,
      behavior: 'smooth'
    });
  }


  return (
    <div ref={containerRef} className="relative w-full" style={{ height: `${events.length * 50}vh` }}>
      <div ref={textWrapperRef} className="sticky top-0 flex flex-col h-screen overflow-hidden">
        <div className="text-center mb-12 pt-12 md:pt-24 lg:pt-32">
            <h2 className="text-3xl font-headline font-bold">Our Journey</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                Tracing our history of growth, innovation, and musical achievement.
            </p>
        </div>
        
        <div className="flex-grow flex items-center">
            <div ref={scrollWrapperRef} className="flex w-full overflow-x-visible p-8">
                {events.map((event, index) => (
                <div key={index} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4">
                    <Card className={cn(
                        "transition-all duration-300",
                        activeIndex === index ? "transform scale-105 shadow-2xl border-primary" : "opacity-50"
                    )}>
                    <CardHeader>
                        <div className="flex items-baseline gap-4">
                            <p className="text-4xl font-bold text-primary">{event.year}</p>
                            <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground h-32">{event.content}</p>
                    </CardContent>
                    </Card>
                </div>
                ))}
            </div>
        </div>

        <div className="flex justify-center gap-2 pb-8 overflow-x-auto">
            {events.map((event, index) => (
            <button
                key={index}
                onClick={() => handleDotClick(index)}
                className="group flex-shrink-0 text-center"
            >
                <div className={cn("mx-auto h-3 w-3 rounded-full transition-all duration-300", 
                activeIndex === index ? 'bg-primary scale-125' : 'bg-muted group-hover:bg-primary/50'
                )}></div>
                <p className={cn("mt-2 text-sm transition-all duration-300",
                activeIndex === index ? 'font-bold text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}>{event.year}</p>
            </button>
            ))}
        </div>
      </div>
    </div>
  )
}
