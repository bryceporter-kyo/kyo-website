"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CatalogueItem } from '@/lib/catalogue-items';
import { useImages } from '@/components/providers/ImageProvider';
import { Tag, Sparkles } from 'lucide-react';

interface AddOnCardProps {
  item: CatalogueItem;
  onDonate: (item: CatalogueItem) => void;
}

export default function AddOnCard({ item, onDonate }: AddOnCardProps) {
  const { getImage } = useImages();
  const storedImage = getImage(item.defaultImageId);

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden border-2 border-dashed border-primary/40 bg-primary/5 hover:border-primary transition-all duration-300">
      <div className="md:w-1/3 relative aspect-video md:aspect-auto min-h-[180px] bg-muted">
        <Image
          src={storedImage?.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'}
          alt={storedImage?.description || item.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground font-semibold gap-1 text-xs">
            <Tag className="w-3 h-3 text-primary" /> Special Add-On
          </Badge>
        </div>
      </div>

      <div className="md:w-2/3 flex flex-col justify-between p-6">
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-xl font-bold font-headline text-foreground">
              {item.name}
            </h3>
            <Badge className="bg-primary text-white font-bold text-sm px-3 py-1">
              {item.displayPrice}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </CardContent>

        <CardFooter className="p-0 pt-4">
          <Button
            onClick={() => onDonate(item)}
            variant="outline"
            className="w-full md:w-auto rounded-xl py-5 px-6 border-primary/40 text-primary hover:bg-primary hover:text-white font-bold gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Add a Dedication Plaque (${item.displayPrice})</span>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
