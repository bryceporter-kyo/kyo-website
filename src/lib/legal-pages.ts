
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc, setDoc } from 'firebase/firestore';

export type LegalPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastUpdated: string;
  headerImageId?: string;
  index: boolean;
  follow: boolean;
  showInFooter: boolean;
  ageMetadata?: string;
};

const LEGAL_COLLECTION = 'legal-pages';

export async function fetchLegalPages(): Promise<LegalPage[]> {
  try {
    const ref = collection(db, LEGAL_COLLECTION);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as LegalPage[];
  } catch (error) {
    console.error('[LegalPages] Error fetching:', error);
    return [];
  }
}

export async function fetchLegalPageBySlug(slug: string): Promise<LegalPage | null> {
  try {
    const ref = collection(db, LEGAL_COLLECTION);
    const q = query(ref, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
    } as LegalPage;
  } catch (error) {
    console.error('[LegalPages] Error fetching by slug:', error);
    return null;
  }
}

export async function saveLegalPage(page: Omit<LegalPage, 'id'>, id?: string): Promise<LegalPage> {
  const ref = collection(db, LEGAL_COLLECTION);
  
  if (id) {
    const docRef = doc(db, LEGAL_COLLECTION, id);
    await updateDoc(docRef, page);
    return { id, ...page };
  } else {
    const docRef = await addDoc(ref, page);
    return { id: docRef.id, ...page };
  }
}

export async function deleteLegalPage(id: string): Promise<void> {
  const docRef = doc(db, LEGAL_COLLECTION, id);
  await deleteDoc(docRef);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '') // Remove special characters
    .replace(/\s+/g, '_');      // Replace spaces with underscores
}
