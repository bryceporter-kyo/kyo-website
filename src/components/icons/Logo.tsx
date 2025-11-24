import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function Logo({ className }: { className?: string }) {
  const logoImage = PlaceHolderImages.find(p => p.id === 'kyo-logo');

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {logoImage ? (
        <Image
          src={logoImage.imageUrl}
          alt={logoImage.description}
          width={28}
          height={28}
          className="rounded-full"
          data-ai-hint={logoImage.imageHint}
        />
      ) : (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
      <div className="font-headline font-bold text-lg">
        <span className="sm:hidden">KYO</span>
        <span className="hidden sm:inline">Kawartha Youth Orchestra</span>
      </div>
    </div>
  );
}
