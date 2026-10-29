"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Music, GraduationCap } from 'lucide-react';

export default function CatalogueNav() {
  const scrollTo = (id: string, category: string) => {
    try {
      // @ts-ignore
      window.va?.track('gift_catalogue_nav_click', { category });
    } catch (e) {
      // ignore
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Catalogue Categories"
      className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b py-4 shadow-sm"
    >
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2 hidden sm:inline">
          Jump to:
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => scrollTo('instruments', 'instruments')}
          className="rounded-full gap-2 border-primary/30 hover:bg-primary hover:text-white transition-colors"
        >
          <Music className="w-4 h-4 text-primary" />
          <span>Instruments & Equipment</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => scrollTo('instruction', 'instruction')}
          className="rounded-full gap-2 border-primary/30 hover:bg-primary hover:text-white transition-colors"
        >
          <GraduationCap className="w-4 h-4 text-primary" />
          <span>Instruction & Program Support</span>
        </Button>
      </div>
    </nav>
  );
}
