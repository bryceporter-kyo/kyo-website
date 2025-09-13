import Image from 'next/image';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

type PageHeaderProps = {
  title: string;
  subtitle: string;
  image?: ImagePlaceholder;
};

export default function PageHeader({ title, subtitle, image }: PageHeaderProps) {
  return (
    <section className="relative h-64 w-full flex items-center justify-center text-center text-white p-0">
      {image && (
        <Image
          src={image.imageUrl}
          alt={image.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={image.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-primary/70" />
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl mx-auto text-lg md:text-xl text-neutral-200">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
