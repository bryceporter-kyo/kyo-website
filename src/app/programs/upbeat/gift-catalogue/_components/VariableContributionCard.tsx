"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CatalogueItem } from '@/lib/catalogue-items';
import { useImages } from '@/components/providers/ImageProvider';
import { subscribeBassRepairsCampaign, BassRepairsCampaign, DEFAULT_BASS_CAMPAIGN } from '@/lib/bass-repairs-campaign';
import { Wrench, Heart } from 'lucide-react';

interface VariableContributionCardProps {
  item: CatalogueItem;
  onDonate: (item: CatalogueItem) => void;
}

export default function VariableContributionCard({ item, onDonate }: VariableContributionCardProps) {
  const { getImage } = useImages();
  const storedImage = getImage(item.defaultImageId);

  const [campaign, setCampaign] = useState<BassRepairsCampaign>(DEFAULT_BASS_CAMPAIGN);

  useEffect(() => {
    const unsubscribe = subscribeBassRepairsCampaign((data) => {
      setCampaign(data);
    });
    return () => unsubscribe();
  }, []);

  const progressPercent = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));

  return (
    <Card className="flex flex-col h-full overflow-hidden border-2 border-primary/40 bg-gradient-to-b from-card to-primary/5 hover:border-primary hover:shadow-xl transition-all duration-300">
      <CardHeader className="p-0 relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={storedImage?.imageUrl || 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'}
          alt={storedImage?.description || item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-white font-bold text-xs gap-1">
            <Wrench className="w-3 h-3" /> Special Restoration Project
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-background/95 text-foreground font-bold text-sm px-3 py-1 shadow-md">
            Variable Amount
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-headline text-foreground leading-snug">
            {item.name}
          </h3>
          <p className="text-xs font-medium text-primary">
            Minimum contribution: $10.01 CAD
          </p>
        </div>

        {/* Live Progress Bar Container */}
        <div className="p-4 rounded-xl bg-background border border-border/80 shadow-sm space-y-2">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-bold text-foreground">
              ${campaign.raised.toLocaleString('en-CA')} CAD raised
            </span>
            <span className="text-xs text-muted-foreground">
              Goal: ${campaign.goal.toLocaleString('en-CA')} CAD
            </span>
          </div>
          <Progress value={progressPercent} className="h-3 rounded-full" />
          <div className="text-right text-xs font-semibold text-primary">
            {progressPercent}% Funded
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          onClick={() => onDonate(item)}
          className="w-full rounded-xl py-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-md hover:shadow-lg transition-all gap-2"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>Support Bass Repairs (Any Amount)</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
