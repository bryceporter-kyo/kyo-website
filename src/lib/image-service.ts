import { db, storage } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import type { ImagePlaceholder } from "./placeholder-images";

const IMAGES_COLLECTION = "placeholder-images";

/**
 * Helper function to add timeout to promises
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export interface StoredImage extends ImagePlaceholder {
  updatedAt?: string;
  originalUrl?: string; // Keep track of the original Unsplash URL
}

/**
 * Check if the image data is a base64 string
 */
function isBase64Image(data: string): boolean {
  return data.startsWith("data:image/");
}

/**
 * Upload an image file to Firebase Storage
 */
export async function uploadImage(
  file: File | Blob,
  imageId: string
): Promise<string> {
  console.log("[ImageService] uploadImage started", { imageId, fileSize: file.size });
  const timestamp = Date.now();
  const extension = file instanceof File ? file.name.split(".").pop() : "png";
  const storagePath = `images/${imageId}_${timestamp}.${extension}`;
  const storageRef = ref(storage, storagePath);

  console.log("[ImageService] Uploading to Firebase Storage...", { path: storagePath });
  
  try {
    await withTimeout(uploadBytes(storageRef, file), 30000, "Upload");
    console.log("[ImageService] Upload complete, getting download URL...");
    const downloadURL = await withTimeout(getDownloadURL(storageRef), 10000, "Get download URL");
    console.log("[ImageService] Download URL obtained:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("[ImageService] uploadImage failed:", error);
    throw error;
  }
}

/**
 * Upload a base64 image to Firebase Storage
 * Falls back to storing in Firestore if Storage upload fails (CORS issues)
 */
export async function uploadBase64Image(
  base64Data: string,
  imageId: string
): Promise<string> {
  console.log("[ImageService] uploadBase64Image started", { imageId, dataLength: base64Data.length });
  try {
    // Try to upload to Firebase Storage first
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });
    console.log("[ImageService] Converted base64 to blob", { blobSize: blob.size });

    const result = await uploadImage(blob, imageId);
    console.log("[ImageService] uploadBase64Image completed successfully");
    return result;
  } catch (error) {
    console.warn("[ImageService] Firebase Storage upload failed, storing as base64 in Firestore:", error);
    // Return the base64 data directly - it will be stored in Firestore
    return base64Data;
  }
}

/**
 * Save image metadata to Firestore
 */
export async function saveImageMetadata(image: StoredImage): Promise<void> {
  console.log("[ImageService] saveImageMetadata started", { imageId: image.id });
  const docRef = doc(db, IMAGES_COLLECTION, image.id);
  console.log("[ImageService] Saving to Firestore collection:", IMAGES_COLLECTION);
  
  try {
    // Save with 15 second timeout
    await withTimeout(
      setDoc(docRef, {
        ...image,
        updatedAt: new Date().toISOString(),
      }),
      15000,
      "Firestore save"
    );
    console.log("[ImageService] saveImageMetadata completed successfully");
  } catch (error) {
    console.error("[ImageService] saveImageMetadata failed:", error);
    throw error;
  }
}

/**
 * Get image metadata from Firestore
 */
export async function getImageMetadata(
  imageId: string
): Promise<StoredImage | null> {
  console.log("[ImageService] getImageMetadata started", { imageId });
  try {
    const docRef = doc(db, IMAGES_COLLECTION, imageId);
    const docSnap = await withTimeout(getDoc(docRef), 10000, "Get image metadata");

    if (docSnap.exists()) {
      console.log("[ImageService] Image metadata found");
      return docSnap.data() as StoredImage;
    }
    console.log("[ImageService] Image metadata not found");
    return null;
  } catch (error) {
    console.error("[ImageService] getImageMetadata failed:", error);
    return null; // Return null on error to allow fallback
  }
}

/**
 * Get all stored images from Firestore
 */
export async function getAllStoredImages(): Promise<StoredImage[]> {
  console.log("[ImageService] getAllStoredImages started");
  try {
    const q = query(collection(db, IMAGES_COLLECTION));
    const querySnapshot = await withTimeout(getDocs(q), 10000, "Get all images");

    const images: StoredImage[] = [];
    querySnapshot.forEach((doc) => {
      images.push(doc.data() as StoredImage);
    });

    console.log("[ImageService] getAllStoredImages completed", { count: images.length });
    return images;
  } catch (error) {
    console.error("[ImageService] getAllStoredImages failed:", error);
    return []; // Return empty array on error to allow fallback to defaults
  }
}

/**
 * Update image URL and metadata
 */
export async function updateImage(
  imageId: string,
  newImageUrl: string,
  additionalData?: Partial<StoredImage>
): Promise<void> {
  const docRef = doc(db, IMAGES_COLLECTION, imageId);
  await updateDoc(docRef, {
    imageUrl: newImageUrl,
    updatedAt: new Date().toISOString(),
    ...additionalData,
  });
}

/**
 * Delete an image from Storage (optional - for cleanup)
 */
export async function deleteStoredImage(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

/**
 * Initialize Firestore with default placeholder images
 * This should be called once to sync the JSON data to Firestore
 */
export async function initializeImagesInFirestore(
  placeholderImages: ImagePlaceholder[]
): Promise<void> {
  for (const image of placeholderImages) {
    const existingImage = await getImageMetadata(image.id);
    if (!existingImage) {
      await saveImageMetadata({
        ...image,
        originalUrl: image.imageUrl,
      });
    }
  }
}

/**
 * Get merged images - combines Firestore data with defaults
 */
export async function getMergedImages(
  defaultImages: ImagePlaceholder[]
): Promise<StoredImage[]> {
  console.log("[ImageService] getMergedImages started", { defaultCount: defaultImages.length });
  try {
    const storedImages = await getAllStoredImages();
    const storedImagesMap = new Map(storedImages.map((img) => [img.id, img]));

    const result = defaultImages.map((defaultImg) => {
      const storedImg = storedImagesMap.get(defaultImg.id);
      if (storedImg) {
        return {
          ...defaultImg,
          ...storedImg,
        };
      }
      return {
        ...defaultImg,
        imageUrl: "", // Remove hardcoded Unsplash URL
        originalUrl: defaultImg.imageUrl,
      };
    });
    
    console.log("[ImageService] getMergedImages completed", { resultCount: result.length });
    return result;
  } catch (error) {
    console.error("[ImageService] getMergedImages failed, using empty defaults:", error);
    // Return defaults with empty image URLs on error
    return defaultImages.map((img) => ({
      ...img,
      imageUrl: "",
      originalUrl: img.imageUrl,
    }));
  }
}
