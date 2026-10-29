"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CatalogueItem } from '@/lib/catalogue-items';
import { useImages } from '@/components/providers/ImageProvider';
import { Package, Heart } from 'lucide-react';

interface BundleCardProps {
  item: CatalogueItem;
  onDonate: (item: CatalogueItem) => void;
}

export default function BundleCard({ item, onDonate }: BundleCardProps) {
  const { getImage } = useImages();
  const storedImage = getImage(item.defaultImageId);

  return (
    <Card className="flex flex-col h-full overflow-hidden border-2 border-primary/30 hover:border-primary/60 hover:shadow-lg transition-all duration-300">
      <CardHeader className="p-0 relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={storedImage?.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'}
          alt={storedImage?.description || item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-primary text-white font-bold text-xs gap-1">
            <Package className="w-3 h-3" /> Practice Bundle
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-background/95 text-foreground font-bold text-sm px-3 py-1 shadow-md">
            {item.displayPrice}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 space-y-3">
        <h3 className="text-xl font-bold font-headline text-foreground leading-snug">
          {item.name}
        </h3>
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
          <span>Give This Bundle</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
