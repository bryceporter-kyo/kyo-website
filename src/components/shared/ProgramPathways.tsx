
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useImages } from "@/components/providers/ImageProvider";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Music, Sparkles, Trophy } from "lucide-react";

const pathways = [
    {
        title: "Junior KYO (JKYO)",
        level: "RCM Grades 1-2",
        description: "Starting their journey with foundational skills in group lessons or our Junior Orchestra. We focus on building fundamental ensemble skills, rhythmic precision, and the joy of making music together.",
        imageId: "orchestra-junior",
        icon: Music,
        accent: "bg-blue-500/10 text-blue-600"
    },
    {
        title: "Intermediate KYO (IKYO)",
        level: "RCM Grades 3-5",
        description: "Developing ensemble skills with a full orchestra, playing classical and popular music. Musicians explore complex harmonies and a diverse range of musical styles while refining their technical proficiency.",
        imageId: "orchestra-intermediate",
        icon: Sparkles,
        accent: "bg-amber-500/10 text-amber-600"
    },
    {
        title: "Senior KYO (SKYO)",
        level: "RCM Grade 6+",
        description: "Performing advanced repertoire in our premier ensemble with professional-level training. Tackling major symphonic works and preparing for professional orchestral environments.",
        imageId: "orchestra-senior",
        icon: Trophy,
        accent: "bg-emerald-500/10 text-emerald-600"
    }
];

export default function ProgramPathways() {
  const { getImage } = useImages();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(10,61,44,0.02),transparent)] pointer-events-none" />

        <div className="container mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
            >
                <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">A Pathway for Growth</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground text-lg font-light leading-relaxed">
                    Our programs provide a clear and structured progression for musicians, from their very first notes to advanced symphonic performance.
                </p>
            </motion.div>

            <div className="relative space-y-32">
                {/* Visual Path Line (Desktop Only) */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 -translate-x-1/2 hidden lg:block" />

                {pathways.map((path, index) => {
                    const isEven = index % 2 === 0;
                    const image = getImage(path.imageId);
                    const Icon = path.icon;

                    return (
                        <div key={path.title} className="relative">
                            {/* Step Number Badge */}
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex w-12 h-12 rounded-full bg-white border border-primary/10 items-center justify-center shadow-lg font-bold text-primary">
                                {index + 1}
                            </div>

                            <div className={cn(
                                "flex flex-col gap-12 items-center",
                                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                            )}>
                                {/* Image Container */}
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="w-full lg:w-1/2"
                                >
                                    <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl group">
                                        {image && (
                                            <Image
                                                src={image.imageUrl}
                                                alt={path.title}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg backdrop-blur-md", path.accent)}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-white font-bold tracking-wider text-sm uppercase">{path.level}</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Content Container */}
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                    className="w-full lg:w-1/2 space-y-6 lg:px-12"
                                >
                                    <h3 className="text-3xl font-headline font-bold">{path.title}</h3>
                                    <div className="h-1 w-12 bg-primary/20 rounded-full" />
                                    <p className="text-muted-foreground text-lg leading-relaxed font-light italic font-serif">
                                        "{path.description}"
                                    </p>
                                    <div className="flex items-center gap-2 text-primary font-bold group cursor-pointer pt-4">
                                        <span>Discover more about {path.title}</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </section>
  );
}
