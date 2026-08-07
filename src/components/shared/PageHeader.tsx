import Image from 'next/image';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

type PageHeaderProps = {
  title: string;
  subtitle: string;
  image?: ImagePlaceholder;
  imageUrl?: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, image, imageUrl, children }: PageHeaderProps) {
  return (
    <section className="relative h-64 w-full flex items-center justify-center text-center text-white p-0">
      {(image || imageUrl) && (
        <Image
          src={imageUrl || image?.imageUrl || ''}
          alt={image?.description || 'Header Background'}
          fill
          className="object-cover"
          priority
          data-ai-hint={image?.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-primary/70" />
      <div className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl mx-auto text-lg md:text-xl text-neutral-200">
          {subtitle}
        </p>
        {children && (
          <div className="mt-6 md:mt-0 md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2 flex flex-col gap-3 items-center md:items-end w-full md:w-auto">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
