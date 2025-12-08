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
  const timestamp = Date.now();
  const extension = file instanceof File ? file.name.split(".").pop() : "png";
  const storageRef = ref(storage, `images/${imageId}_${timestamp}.${extension}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

/**
 * Upload a base64 image to Firebase Storage
 * Falls back to storing in Firestore if Storage upload fails (CORS issues)
 */
export async function uploadBase64Image(
  base64Data: string,
  imageId: string
): Promise<string> {
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

    return await uploadImage(blob, imageId);
  } catch (error) {
    console.warn("Firebase Storage upload failed, storing as base64 in Firestore:", error);
    // Return the base64 data directly - it will be stored in Firestore
    return base64Data;
  }
}

/**
 * Save image metadata to Firestore
 */
export async function saveImageMetadata(image: StoredImage): Promise<void> {
  const docRef = doc(db, IMAGES_COLLECTION, image.id);
  await setDoc(docRef, {
    ...image,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Get image metadata from Firestore
 */
export async function getImageMetadata(
  imageId: string
): Promise<StoredImage | null> {
  const docRef = doc(db, IMAGES_COLLECTION, imageId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as StoredImage;
  }

  return null;
}

/**
 * Get all stored images from Firestore
 */
export async function getAllStoredImages(): Promise<StoredImage[]> {
  const q = query(collection(db, IMAGES_COLLECTION));
  const querySnapshot = await getDocs(q);

  const images: StoredImage[] = [];
  querySnapshot.forEach((doc) => {
    images.push(doc.data() as StoredImage);
  });

  return images;
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
  const storedImages = await getAllStoredImages();
  const storedImagesMap = new Map(storedImages.map((img) => [img.id, img]));

  return defaultImages.map((defaultImg) => {
    const storedImg = storedImagesMap.get(defaultImg.id);
    if (storedImg) {
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
}
