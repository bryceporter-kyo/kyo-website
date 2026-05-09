import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export type PageMetadata = {
  path: string;
  title: string;
  description: string;
  index: boolean;
  follow: boolean;
};

const METADATA_COLLECTION = 'page-metadata';

export async function fetchAllPageMetadata(): Promise<PageMetadata[]> {
  const querySnapshot = await getDocs(collection(db, METADATA_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    path: doc.id.replace(/_/g, '/'), // Replace _ back to / for the path since doc IDs can't have /
    ...doc.data()
  } as PageMetadata));
}

export async function fetchPageMetadata(path: string): Promise<PageMetadata | null> {
  const docId = path === "/" ? "root" : path.replace(/\//g, '_');
  const docRef = doc(db, METADATA_COLLECTION, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      path,
      ...docSnap.data()
    } as PageMetadata;
  }
  return null;
}

export async function savePageMetadata(path: string, data: Omit<PageMetadata, 'path'>): Promise<void> {
  const docId = path === "/" ? "root" : path.replace(/\//g, '_');
  const docRef = doc(db, METADATA_COLLECTION, docId);
  
  await setDoc(docRef, data, { merge: true });
}
