
"use client";

import * as React from "react";
import { useImages } from "@/components/providers/ImageProvider";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ProgramPathways() {
  const { getImage } = useImages();
  const lessonsImage = getImage("program-lessons");

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-primary/[0.02]">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
              A Pathway for Growth
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-light">
              Our programs provide a clear and structured progression for
              musicians, from their very first notes to advanced symphonic
              performance. Not ready to join an orchestra? Our beginner group
              lessons provide the perfect starting point, and intermediate group
              lessons offer an affordable solution for musicians eager to level
              up their technique.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 shadow-lg hover:shadow-primary/20 transition-all hover:scale-105"
            >
              <Link href="/programs/lessons" className="flex items-center gap-2">
                Learn More About Lessons <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="relative"
          >
            {lessonsImage && (
              <div className="rounded-[2.5rem] overflow-hidden group">
                <Image
                  src={lessonsImage.imageUrl}
                  alt={lessonsImage.description}
                  width={700}
                  height={500}
                  className="object-cover w-full aspect-[4/3] transition-transform duration-1000 group-hover:scale-105"
                  data-ai-hint={lessonsImage.imageHint}
                />
              </div>
            )}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
