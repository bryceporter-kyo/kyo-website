import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  category?: 'Site Image' | 'Page Header' | 'Profile Picture' | 'Logo' | 'Supporter Logo';
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
