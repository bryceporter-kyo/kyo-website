
"use client";

import { ArrowLeft, Edit, ImageUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages, ImagePlaceholder } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

export default function AdminImagesPage() {
  const groupedImages = useMemo(() => {
    return PlaceHolderImages.reduce((acc, image) => {
      const category = image.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(image);
      return acc;
    }, {} as Record<string, ImagePlaceholder[]>);
  }, []);

  const categories = Object.keys(groupedImages).sort();

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
        </Button>
      </div>
      <div className="space-y-12">
        {categories.map(category => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{category}</CardTitle>
              <CardDescription>Manage your website's images and media assets for this category.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedImages[category].map((image) => (
                  <Card key={image.id} className="flex flex-col">
                    <CardHeader>
                      <div className="relative aspect-video rounded-md overflow-hidden">
                        <Image
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover"
                            data-ai-hint={image.imageHint}
                          />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                      <Badge variant="outline" className="font-mono">{image.id}</Badge>
                      <p className="text-sm text-muted-foreground">{image.description}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="w-full">
                        <ImageUp className="mr-2" />
                        Change Image
                      </Button>
                      <Button variant="secondary" className="w-full">
                        <Edit className="mr-2" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
