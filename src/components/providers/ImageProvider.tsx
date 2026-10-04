"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export interface StoredImage extends ImagePlaceholder {
  updatedAt?: string;
  originalUrl?: string;
}

interface ImageContextType {
  images: StoredImage[];
  getImage: (id: string) => StoredImage | undefined;
  isLoading: boolean;
  refreshImages: () => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

/**
 * Parse Firestore document fields to StoredImage
 */
function parseFirestoreDocument(fields: any): StoredImage {
  return {
    id: fields.id?.stringValue || "",
    description: fields.description?.stringValue || "",
    imageUrl: fields.imageUrl?.stringValue || "",
    imageHint: fields.imageHint?.stringValue || "",
    category: fields.category?.stringValue as ImagePlaceholder['category'],
    updatedAt: fields.updatedAt?.stringValue,
    originalUrl: fields.originalUrl?.stringValue,
  };
}

/**
 * Fetch images from Firestore REST API
 */
async function fetchImagesFromFirestore(): Promise<StoredImage[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    console.warn("[ImageProvider] No project ID");
    return [];
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/placeholder-images`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn("[ImageProvider] Firestore fetch failed");
      return [];
    }

    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      console.log("[ImageProvider] No documents in Firestore");
      return [];
    }

    // Parse Firestore documents
    const storedImages: StoredImage[] = data.documents.map((doc: any) => 
      parseFirestoreDocument(doc.fields)
    );

    // Create a map for quick lookup
    const storedImagesMap = new Map(storedImages.map(img => [img.id, img]));

    // Merge with static images to ensure all images are present
    const mergedImages = PlaceHolderImages.map(defaultImg => {
      const storedImg = storedImagesMap.get(defaultImg.id);
      if (storedImg && storedImg.imageUrl) {
        return {
          ...defaultImg,
          ...storedImg,
        };
      }
      return {
        ...defaultImg,
        imageUrl: defaultImg.imageUrl || "",
        originalUrl: defaultImg.imageUrl,
      };
    });

    console.log("[ImageProvider] Loaded images from Firestore", { count: mergedImages.length });
    return mergedImages;
  } catch (error) {
    console.error("[ImageProvider] Error fetching from Firestore:", error);
    return PlaceHolderImages.map(img => ({ ...img, originalUrl: img.imageUrl }));
  }
}

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<StoredImage[]>(() => 
    PlaceHolderImages.map(img => ({ ...img, originalUrl: img.imageUrl }))
  );
  const [isLoading, setIsLoading] = useState(true);

  const refreshImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedImages = await fetchImagesFromFirestore();
      if (fetchedImages.length > 0) {
        setImages(fetchedImages);
      }
    } catch (error) {
      console.error("[ImageProvider] Failed to refresh images:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshImages();
  }, [refreshImages]);

  // Pre-load and cache all images in the background once they are fetched
  useEffect(() => {
    if (images.length === 0) return;
    
    images.forEach(img => {
      if (img.imageUrl) {
        // 1. DOM Link preloading
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.imageUrl;
        document.head.appendChild(link);
        
        // 2. Browser native Image object pre-caching
        const cacheImg = new Image();
        cacheImg.src = img.imageUrl;
      }
    });
  }, [images]);

  const getImage = useCallback((id: string) => {
    const found = images.find(img => img.id === id);
    if (found && found.imageUrl) {
      return found;
    }
    const defaultImg = PlaceHolderImages.find(img => img.id === id);
    if (defaultImg) {
      return {
        ...defaultImg,
        originalUrl: defaultImg.imageUrl,
      };
    }
    return undefined;
  }, [images]);

  return (
    <ImageContext.Provider value={{ images, getImage, isLoading, refreshImages }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImages() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
}

/**
 * Hook to get a single image by ID
 */
export function useImage(id: string) {
  const { getImage, isLoading } = useImages();
  return { image: getImage(id), isLoading };
}

/**
 * Hook to get multiple images by IDs
 */
export function useImagesByIds(ids: string[]) {
  const { images, isLoading } = useImages();
  const result = new Map<string, StoredImage>();
  
  for (const id of ids) {
    const image = images.find(img => img.id === id);
    if (image) {
      result.set(id, image);
    }
  }
  
  return { images: result, isLoading };
}
