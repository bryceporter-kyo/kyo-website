"use client";

import React from 'react';
import { CatalogueItem } from '@/lib/catalogue-items';
import GiftCard from './GiftCard';
import FeaturedFundCard from './FeaturedFundCard';

interface InstructionSectionProps {
  items: CatalogueItem[];
  onDonate: (item: CatalogueItem) => void;
}

export default function InstructionSection({ items, onDonate }: InstructionSectionProps) {
  const monthItem = items.find((i) => i.id === 'instruction-one-month');
  const yearItem = items.find((i) => i.id === 'instruction-full-year');
  const snackItem = items.find((i) => i.id === 'snack-sponsorship');
  const pathwaysItem = items.find((i) => i.id === 'pathways-fund');

  return (
    <section id="instruction" className="scroll-mt-24 py-16 md:py-24 border-b">
      <div className="container mx-auto px-4 space-y-16">
        {/* Section Heading */}
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            Category II
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            Instruction & Program Support
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Invest in the dedicated teaching, nutritious snacks, and individual mentoring that empower our musicians to flourish.
          </p>
        </div>

        {/* 6.1 Instructional Gifts - Shared Description Block + 2 Cards */}
        <div className="space-y-8">
          <div className="p-6 md:p-8 rounded-2xl bg-muted/40 border border-border/80 max-w-4xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
              About Upbeat! Instruction
            </h3>
            <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
              At Upbeat!, we are proud to provide Peterborough&apos;s youth with high-quality, professional music instruction. Our teachers are incredible local musicians who are deeply dedicated to the success of every child in the program. By covering the cost of instruction for an Upbeat! participant for a month (or a full year!), you will make a lasting difference in the life of a deserving young person.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {monthItem && (
              <GiftCard
                item={monthItem}
                onDonate={onDonate}
                ctaText="Sponsor One Month"
              />
            )}
            {yearItem && (
              <GiftCard
                item={yearItem}
                onDonate={onDonate}
                ctaText="Sponsor a Full Year"
              />
            )}
          </div>
        </div>

        {/* 6.2 Weekly Snack Sponsorship */}
        {snackItem && (
          <div className="space-y-4">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold font-headline text-foreground">
                Nutritional & Community Support
              </h3>
              <p className="text-sm text-muted-foreground">
                Upbeat! begins each rehearsal with healthy food, ensuring participants arrive nourished and ready to thrive.
              </p>
            </div>
            <div className="max-w-xl">
              <GiftCard
                item={snackItem}
                onDonate={onDonate}
                ctaText="Sponsor a Week ($257.99 CAD)"
              />
            </div>
          </div>
        )}

        {/* 6.3 The Pathways Fund - Featured Funding Opportunity */}
        {pathwaysItem && (
          <div className="space-y-4 pt-4">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold font-headline text-foreground">
                Advanced Pathways
              </h3>
              <p className="text-sm text-muted-foreground">
                Bridge the gap between ensemble training and private conservatory-level lessons.
              </p>
            </div>
            <FeaturedFundCard item={pathwaysItem} onDonate={onDonate} />
          </div>
        )}
      </div>
    </section>
  );
}
