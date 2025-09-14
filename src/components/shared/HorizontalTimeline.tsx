"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
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
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [api, setApi] = React.useState<any>(null);

  React.useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const handleDotClick = (index: number) => {
    if (!api) return;
    api.scrollTo(index);
    setActiveIndex(index);
  }

  return (
    <div className="w-full">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {events.map((event, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
            <CarouselPrevious />
            <CarouselNext />
        </div>
      </Carousel>

      <div className="flex justify-center gap-2 mt-8 py-4 overflow-x-auto">
        {events.map((event, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className="group flex-shrink-0"
          >
            <div className={cn("h-3 w-3 rounded-full transition-all duration-300", 
              activeIndex === index ? 'bg-primary scale-125' : 'bg-muted group-hover:bg-primary/50'
            )}></div>
            <p className={cn("mt-2 text-sm transition-all duration-300",
               activeIndex === index ? 'font-bold text-primary' : 'text-muted-foreground group-hover:text-foreground'
            )}>{event.year}</p>
          </button>
        ))}
      </div>
    </div>
  )
}