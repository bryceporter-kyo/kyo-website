import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload a document (e.g. PDF) to Firebase Storage
 */
export async function uploadDocument(
  file: File | Blob,
  documentId: string
): Promise<string> {
  console.log("[DocumentService] uploadDocument started", { documentId, fileSize: file.size });
  const timestamp = Date.now();
  const extension = file instanceof File ? file.name.split(".").pop() : "pdf";
  const storagePath = `documents/${documentId}_${timestamp}.${extension}`;
  const storageRef = ref(storage, storagePath);

  console.log("[DocumentService] Uploading to Firebase Storage...", { path: storagePath });
  
  try {
    await uploadBytes(storageRef, file);
    console.log("[DocumentService] Upload complete, getting download URL...");
    const downloadURL = await getDownloadURL(storageRef);
    console.log("[DocumentService] Download URL obtained:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("[DocumentService] uploadDocument failed:", error);
    throw error;
  }
}

export async function uploadImage(
  file: File | Blob,
  documentId: string
): Promise<string> {
  console.log("[DocumentService] uploadImage started", { documentId, fileSize: file.size });
  const timestamp = Date.now();
  const extension = file instanceof File ? file.name.split(".").pop() : "jpg";
  const storagePath = `images/${documentId}_${timestamp}.${extension}`;
  const storageRef = ref(storage, storagePath);

  console.log("[DocumentService] Uploading image to Firebase Storage...", { path: storagePath });
  
  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    console.log("[DocumentService] Image download URL obtained:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("[DocumentService] uploadImage failed:", error);
    throw error;
  }
}

/**
 * Delete a document from Firebase Storage by URL
 */
export async function deleteDocumentByUrl(url: string): Promise<void> {
  try {
    // Basic extraction of path from URL
    const decodedUrl = decodeURIComponent(url);
    const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
    
    if (pathMatch && pathMatch[1]) {
      const storagePath = pathMatch[1];
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      console.log("[DocumentService] Deleted document:", storagePath);
    }
  } catch (error) {
    console.error("[DocumentService] Failed to delete document:", error);
  }
}
