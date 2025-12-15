import { PlaceHolderImages, type ImagePlaceholder } from "./placeholder-images";

export interface StoredImage extends ImagePlaceholder {
  updatedAt?: string;
  originalUrl?: string;
}

/**
 * Fetch images from Firestore REST API (works in server components)
 * Falls back to static data if Firestore is unavailable
 */
export async function getImagesFromFirestore(): Promise<StoredImage[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    console.warn("[ImageServiceServer] No project ID, using static images");
    return PlaceHolderImages.map(img => ({ ...img, originalUrl: img.imageUrl }));
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/placeholder-images`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn("[ImageServiceServer] Firestore fetch failed, using static images");
      return PlaceHolderImages.map(img => ({ ...img, originalUrl: img.imageUrl }));
    }

    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      console.log("[ImageServiceServer] No documents in Firestore, using static images");
      return PlaceHolderImages.map(img => ({ ...img, originalUrl: img.imageUrl }));
    }

    // Parse Firestore documents
    const storedImages: StoredImage[] = data.documents.map((doc: any) => {
      const fields = doc.fields;
      return {
        id: fields.id?.stringValue || "",
        description: fields.description?.stringValue || "",
        imageUrl: fields.imageUrl?.stringValue || "",
        imageHint: fields.imageHint?.stringValue || "",
        category: fields.category?.stringValue as ImagePlaceholder['category'],
        updatedAt: fields.updatedAt?.stringValue,
        originalUrl: fields.originalUrl?.stringValue,
      };
    });

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
        originalUrl: defaultImg.imageUrl,
      };
    });

    console.log("[ImageServiceServer] Loaded images from Firestore", { count: mergedImages.length });
    return mergedImages;
  } catch (error) {
    console.error("[ImageServiceServer] Error fetching from Firestore:", error);
    return PlaceHolderImages.map(img => ({ ...img, originalUrl: img.imageUrl }));
  }
}

/**
 * Get a specific image by ID from Firestore
 */
export async function getImageById(imageId: string): Promise<StoredImage | null> {
  const images = await getImagesFromFirestore();
  return images.find(img => img.id === imageId) || null;
}

/**
 * Get multiple images by their IDs
 */
export async function getImagesByIds(imageIds: string[]): Promise<Map<string, StoredImage>> {
  const images = await getImagesFromFirestore();
  const result = new Map<string, StoredImage>();
  
  for (const id of imageIds) {
    const image = images.find(img => img.id === id);
    if (image) {
      result.set(id, image);
    }
  }
  
  return result;
}
