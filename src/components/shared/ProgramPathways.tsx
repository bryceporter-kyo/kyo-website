
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GraduationCap, School, Star } from "lucide-react";

const pathways = [
    {
        title: "Beginner Lessons & JKYO",
        level: "RCM Grades 1-2",
        description: "Starting their journey with foundational skills in group lessons or our Junior Orchestra.",
        icon: GraduationCap,
    },
    {
        title: "Intermediate KYO (IKYO)",
        level: "RCM Grades 3-5",
        description: "Developing ensemble skills with a full orchestra, playing classical and popular music.",
        icon: School,
    },
    {
        title: "Senior KYO (SKYO)",
        level: "RCM Grade 6+",
        description: "Performing advanced repertoire in our premier ensemble with professional-level training.",
        icon: Star,
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
    <section>
        <div className="container mx-auto text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">A Pathway for Growth</h2>
            <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                Our programs provide a clear and structured progression for musicians, from their very first notes to advanced performance.
            </p>
        </div>
        <div ref={containerRef} className="relative w-full" style={{ height: `${pathways.length * 100}vh` }}>
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="relative w-full max-w-3xl" style={{ height: '400px' }}>
                {pathways.map((path, index) => {
                    const isActive = activeIndex === index;
                    const Icon = path.icon;

                    return (
                    <div
                        key={path.title}
                        className={cn(
                            "absolute inset-0 w-full h-full p-4 transition-opacity duration-500 ease-in-out",
                            isActive ? "opacity-100" : "opacity-0 pointer-events-none",
                        )}
                    >
                        <Card className="w-full h-full flex flex-col justify-center text-center">
                            <CardHeader className="items-center">
                                <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                    <Icon className="h-8 w-8" />
                                </div>
                                <CardTitle className="font-headline text-4xl md:text-5xl pt-4">{path.title}</CardTitle>
                                <p className="text-xl font-bold text-muted-foreground">{path.level}</p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed text-lg md:text-xl">{path.description}</p>
                            </CardContent>
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
