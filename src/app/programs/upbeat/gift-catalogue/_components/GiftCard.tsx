"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CatalogueItem } from '@/lib/catalogue-items';
import { useImages } from '@/components/providers/ImageProvider';
import { Heart } from 'lucide-react';

interface GiftCardProps {
  item: CatalogueItem;
  onDonate: (item: CatalogueItem) => void;
  ctaText?: string;
}

export default function GiftCard({ item, onDonate, ctaText = 'Give This Gift' }: GiftCardProps) {
  const { getImage } = useImages();
  const storedImage = getImage(item.defaultImageId);

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-border/60 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      <CardHeader className="p-0 relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={storedImage?.imageUrl || 'https://images.unsplash.com/photo-1685954154829-5ebdf5956824?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'}
          alt={storedImage?.description || item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary/95 text-white font-bold text-sm px-3 py-1 shadow-md">
            {item.displayPrice}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 space-y-3">
        <h3 className="text-xl font-bold font-headline text-foreground leading-snug">
          {item.name}
        </h3>

        {item.inclusionLine && (
          <p className="text-xs font-semibold italic text-primary">
            {item.inclusionLine}
          </p>
        )}

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
          <span>{ctaText}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
