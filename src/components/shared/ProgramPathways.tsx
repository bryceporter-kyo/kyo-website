
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

const pathways = [
    {
        title: "Beginner Lessons & JKYO",
        level: "RCM Grades 1-2",
        description: "Starting their journey with foundational skills in group lessons or our Junior Orchestra.",
        imageId: "orchestra-junior"
    },
    {
        title: "Intermediate KYO (IKYO)",
        level: "RCM Grades 3-5",
        description: "Developing ensemble skills with a full orchestra, playing classical and popular music.",
        imageId: "orchestra-intermediate"
    },
    {
        title: "Senior KYO (SKYO)",
        level: "RCM Grade 6+",
        description: "Performing advanced repertoire in our premier ensemble with professional-level training.",
        imageId: "orchestra-senior"
    }
];

export default function ProgramPathways() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  React.useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollY = window.scrollY;
      const containerTop = container.offsetTop;
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      const scrollableAreaStart = containerTop - viewportHeight / 2 + 200;
      const scrollProgress = scrollY - scrollableAreaStart;
      const itemScrollSpace = (containerHeight - viewportHeight) / pathways.length;

      let newIndex = Math.floor(scrollProgress / itemScrollSpace);
      newIndex = Math.max(0, Math.min(newIndex, pathways.length - 1));
      
      setActiveIndex(newIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <section className="py-12 md:py-24">
        <div className="container mx-auto text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">A Pathway for Growth</h2>
            <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                Our programs provide a clear and structured progression for musicians, from their very first notes to advanced performance.
            </p>
        </div>
        <div ref={containerRef} className="relative w-full" style={{ height: `${pathways.length * 100}vh` }}>
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="relative w-full max-w-4xl" style={{ height: '600px' }}>
                {pathways.map((path, index) => {
                    const isActive = activeIndex === index;
                    const image = PlaceHolderImages.find(p => p.id === path.imageId);

                    return (
                    <div
                        key={path.title}
                        className={cn(
                            "absolute inset-0 w-full h-full p-4 transition-opacity duration-500 ease-in-out",
                            isActive ? "opacity-100" : "opacity-0 pointer-events-none",
                        )}
                    >
                        <Card className="w-full h-full flex flex-col justify-end text-center overflow-hidden">
                            {image && (
                                <div className="relative h-full w-full">
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.description}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={image.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <CardTitle className="font-headline text-5xl pt-4">{path.title}</CardTitle>
                                <CardDescription className="text-xl font-bold text-white/80">{path.level}</CardDescription>
                                <CardContent className="p-0 pt-4">
                                  <p className="leading-relaxed text-xl text-white/90 max-w-2xl mx-auto">{path.description}</p>
                                </CardContent>
                            </div>
                        </Card>
                    </div>
                    );
                })}
                </div>
            </div>
        </div>
    </section>
  );
}

