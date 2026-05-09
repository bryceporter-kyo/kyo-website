"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useImages } from "@/components/providers/ImageProvider";

export function Logo({ className, variant = "long", size = 40, fullWidth = false }: { className?: string, variant?: "small" | "long", size?: number, fullWidth?: boolean }) {
  const { getImage } = useImages();
  const favicon = getImage('favicon');
  const longLogo = variant === "long" ? getImage('kyo-logo-long') : null;
  const smallLogo = getImage('kyo-logo');

  // Use the requested variant
  const logo = (variant === "small" ? favicon : null) || longLogo || smallLogo || favicon;
  const isLong = !!longLogo && variant === "long";

  const logoSrc = logo?.imageUrl || "/favicon.png" || "/favicon.ico";
  const logoAlt = logo?.description || "Kawartha Youth Orchestra";

  return (
    <div className={cn("flex items-center", fullWidth && "w-full", className)}>
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={fullWidth ? 1200 : (isLong ? (size * 5) : size)}
        height={fullWidth ? 300 : size}
        className={cn(
          "object-contain transition-all duration-300",
          !isLong && "rounded-full",
          fullWidth && "w-full h-auto"
        )}
        priority
        data-ai-hint={logo?.imageHint || "logo"}
      />
    </div>
  );
}
