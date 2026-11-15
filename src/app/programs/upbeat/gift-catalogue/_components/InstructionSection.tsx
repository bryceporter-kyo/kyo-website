"use client";

import React from 'react';
import Image from 'next/image';
import { CatalogueItem } from '@/lib/catalogue-items';
import GiftCard from './GiftCard';
import FeaturedFundCard from './FeaturedFundCard';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useImages } from '@/components/providers/ImageProvider';
import { Utensils, Heart, Sparkles, BookOpen } from 'lucide-react';

interface InstructionSectionProps {
  items: CatalogueItem[];
  onDonate: (item: CatalogueItem) => void;
}

export default function InstructionSection({ items, onDonate }: InstructionSectionProps) {
  const { getImage } = useImages();
  const monthItem = items.find((i) => i.id === 'instruction-one-month');
  const yearItem = items.find((i) => i.id === 'instruction-full-year');
  const snackItem = items.find((i) => i.id === 'snack-sponsorship');
  const pathwaysItem = items.find((i) => i.id === 'pathways-fund');

  const snackImage = snackItem ? getImage(snackItem.defaultImageId) : null;

  return (
    <section id="instruction" className="scroll-mt-24 py-16 md:py-24 border-b bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 space-y-20">
        
        {/* Section Master Heading */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Category II
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-headline text-foreground tracking-tight">
            Instruction & Program Support
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Invest in the dedicated teaching, wholesome nutrition, and individual conservatory mentoring that empower our young musicians to flourish.
          </p>
        </div>

        {/* 6.1 Music Instruction Subsection */}
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-card border border-border shadow-sm max-w-5xl">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Professional Musical Mentorship
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-headline text-foreground">
                Sponsor Upbeat! Instruction
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pt-1">
                At Upbeat!, we provide Peterborough&apos;s youth with high-quality, professional string instruction at zero cost to their families. Our teachers are celebrated local musicians who are deeply dedicated to each child&apos;s musical and emotional growth. Cover the cost of tuition for a month or an entire academic year to create a life-changing foundation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
            {monthItem && (
              <div className="flex">
                <GiftCard
                  item={monthItem}
                  onDonate={onDonate}
                  ctaText="Sponsor One Month ($257.99 CAD)"
                />
              </div>
            )}
            {yearItem && (
              <div className="flex">
                <GiftCard
                  item={yearItem}
                  onDonate={onDonate}
                  ctaText="Sponsor a Full Year ($2,574.99 CAD)"
                />
              </div>
            )}
          </div>
        </div>

        {/* 6.2 Nutritional & Community Support (Polished Wide Hero Feature Card) */}
        {snackItem && (
          <div className="space-y-6 max-w-5xl">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Care Beyond The Notes
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-headline text-foreground">
                Nutritional & Community Support
              </h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                Every rehearsal begins with wholesome, nourishing food so children arrive ready to focus, connect, and make music together.
              </p>
            </div>

            <Card className="overflow-hidden border border-border shadow-lg rounded-3xl bg-card hover:shadow-xl transition-all">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 md:p-8">
                {/* Snack Image Banner */}
                <div className="md:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-sm">
                  <Image
                    src={snackImage?.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'}
                    alt={snackImage?.description || snackItem.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-primary text-white font-bold text-xs gap-1 shadow-sm">
                      <Utensils className="w-3 h-3" /> Healthy Rehearsal Fuel
                    </Badge>
                  </div>
                </div>

                {/* Snack Copy & Action */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <h4 className="text-2xl font-bold font-headline text-foreground">
                        {snackItem.name}
                      </h4>
                      <Badge className="bg-primary text-white font-bold text-base px-3.5 py-1 shadow-sm">
                        {snackItem.displayPrice} CAD
                      </Badge>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {snackItem.description}
                    </p>
                    <div className="p-3 bg-muted/50 rounded-xl text-xs text-foreground/80 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary shrink-0" />
                      <span>One week of fresh fruits, vegetables, baked goods, and healthy snacks for all rehearsal days.</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => onDonate(snackItem)}
                      size="lg"
                      className="rounded-full px-8 py-6 font-bold shadow-md hover:shadow-lg transition-all gap-2 text-sm md:text-base w-full sm:w-auto"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Sponsor a Week of Healthy Snacks ({snackItem.displayPrice})</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 6.3 The Pathways Fund - Featured Funding Opportunity */}
        {pathwaysItem && (
          <div className="space-y-6 max-w-5xl">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Advanced Training & Scholarships
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-headline text-foreground">
                Advanced Pathways
              </h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                Bridge the financial gap between ensemble rehearsal and private conservatory-level lessons for high-potential students.
              </p>
            </div>
            <FeaturedFundCard item={pathwaysItem} onDonate={onDonate} />
          </div>
        )}

      </div>
    </section>
  );
}
