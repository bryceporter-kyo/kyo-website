
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ContactInfoCardProps = {
  icon: LucideIcon;
  title: string;
  content: React.ReactNode;
  buttonText?: string;
  buttonLink?: string;
  note?: string;
};

export default function ContactInfoCard({ icon: Icon, title, content, buttonText, buttonLink, note }: ContactInfoCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-primary text-primary-foreground p-3 rounded-full">
            <Icon className="w-6 h-6" />
        </div>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-lg">
        {content}
        {note && (
            <div className="mt-4 text-xs text-muted-foreground p-3 bg-secondary rounded-md flex items-start gap-2">
                <AlertTriangle className="w-8 h-8 flex-shrink-0"/>
                <span>{note}</span>
            </div>
        )}
      </CardContent>
      {buttonText && buttonLink && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
