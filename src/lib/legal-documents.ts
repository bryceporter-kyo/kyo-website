import { db, sanitizeForFirestore } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export interface LegalDocument {
  id: string;
  name: string;
  description: string;
  url: string;
  uploadedAt: string;
}

const DOCUMENTS_COLLECTION = 'legal-documents';

export async function fetchLegalDocuments(): Promise<LegalDocument[]> {
  try {
    const ref = collection(db, DOCUMENTS_COLLECTION);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as LegalDocument[];
  } catch (error) {
    console.error('[LegalDocuments] Error fetching:', error);
    return [];
  }
}

export async function saveLegalDocument(document: Omit<LegalDocument, 'id'>, id?: string): Promise<LegalDocument> {
  const ref = collection(db, DOCUMENTS_COLLECTION);
  const cleanDocument = sanitizeForFirestore(document);
  
  if (id) {
    const docRef = doc(db, DOCUMENTS_COLLECTION, id);
    await updateDoc(docRef, cleanDocument);
    return { id, ...document };
  } else {
    const docRef = await addDoc(ref, cleanDocument);
    return { id: docRef.id, ...document };
  }
}

export async function deleteLegalDocument(id: string): Promise<void> {
  const docRef = doc(db, DOCUMENTS_COLLECTION, id);
  await deleteDoc(docRef);
}
