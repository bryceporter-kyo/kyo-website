"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CatalogueItem } from '@/lib/catalogue-items';
import { useImages } from '@/components/providers/ImageProvider';
import { Sparkles, Heart } from 'lucide-react';

interface FeaturedFundCardProps {
  item: CatalogueItem;
  onDonate: (item: CatalogueItem) => void;
}

export default function FeaturedFundCard({ item, onDonate }: FeaturedFundCardProps) {
  const { getImage } = useImages();
  const storedImage = getImage(item.defaultImageId);

  return (
    <Card className="overflow-hidden border-2 border-primary/50 bg-gradient-to-br from-card via-card to-primary/10 shadow-xl rounded-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 md:p-10">
        {/* Left Column: Image with badges */}
        <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-muted">
          <Image
            src={storedImage?.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'}
            alt={storedImage?.description || item.name}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-white font-bold text-xs gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> Featured Opportunity
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-black/60 text-white p-3 rounded-xl text-xs font-semibold">
            One-on-One Studio Instruction for Promising Musicians
          </div>
        </div>

        {/* Right Column: Copy & Matching Commitment Callout */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-2xl md:text-3xl font-bold font-headline text-foreground">
              {item.name}
            </h3>
            <Badge variant="outline" className="border-primary text-primary font-bold px-3 py-1 text-sm">
              Variable Amount
            </Badge>
          </div>

          {/* Exact matching commitment callout box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-foreground space-y-1">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wide">
              <Sparkles className="w-4 h-4" /> $5,000 Matching Commitment
            </div>
            <p className="text-sm font-semibold text-foreground/90">
              A generous anonymous donor will match donations to The Pathways Fund up to $5,000.
            </p>
          </div>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-4 items-center">
            <Button
              onClick={() => onDonate(item)}
              size="lg"
              className="w-full sm:w-auto rounded-xl px-8 py-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg hover:shadow-xl gap-2"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>Contribute to The Pathways Fund</span>
            </Button>
            <span className="text-xs text-muted-foreground">
              Min. $10.01 CAD • Tax receiptable over $20 CAD
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
