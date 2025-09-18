import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImagePlaceholder } from "@/lib/placeholder-images";

type InstructorCardProps = {
  name: string;
  title: string;
  bio: string;
  image: ImagePlaceholder | undefined;
};

export default function InstructorCard({ name, title, bio, image }: InstructorCardProps) {
  return (
    <Card className="text-center">
        {image && (
            <div className="aspect-square relative w-full overflow-hidden rounded-t-lg">
                <Image 
                    src={image.imageUrl} 
                    alt={name}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                />
            </div>
        )}
      <CardHeader>
        <div>
          <CardTitle className="font-headline text-2xl">{name}</CardTitle>
          <p className="text-base text-muted-foreground">{title}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{bio}</p>
      </CardContent>
    </Card>
  );
}
