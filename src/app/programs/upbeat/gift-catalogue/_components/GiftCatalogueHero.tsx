"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useImages } from '@/components/providers/ImageProvider';
import { Sparkles, ArrowDown } from 'lucide-react';
import { va } from '@vercel/analytics';

export default function GiftCatalogueHero() {
  const { getImage } = useImages();
  const heroImage = getImage('gift-catalogue-hero');

  const handleExploreClick = () => {
    try {
      // @ts-ignore
      window.va?.track('gift_catalogue_hero_cta_click');
    } catch (e) {
      // ignore
    }
    const section = document.getElementById('instruments');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24 border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, Supporting copy, Primary CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Seasonal Fundraising Campaign
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight text-foreground leading-[1.1]">
              Give the gift of music this holiday
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Upbeat! provides local kids with barrier free music education—instruments, meals, and transport included. Be their Musical Santa: check out the <strong>Upbeat! Holiday Gift Catalogue</strong>!
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleExploreClick}
                className="rounded-full px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <span>Explore the Gift Catalogue</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </Button>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-border/50 group">
              <Image
                src={heroImage?.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'}
                alt="Upbeat youth musicians rehearsing during the holiday season"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-medium backdrop-blur-sm bg-black/30 p-2 rounded-xl">
                Kawartha Youth Orchestra • Upbeat! Program
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
