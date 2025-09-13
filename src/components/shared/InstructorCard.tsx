import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-20 w-20">
          {image && <AvatarImage src={image.imageUrl} alt={name} data-ai-hint={image.imageHint} />}
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="font-headline text-xl">{name}</CardTitle>
          <CardDescription>{title}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{bio}</p>
      </CardContent>
    </Card>
  );
}
