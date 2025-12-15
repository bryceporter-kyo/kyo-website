
import internalSectionsData from './internal-sections.json';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';

export type InternalSection = {
  id: string;
  icon: string;
  title: string;
  manager: string;
  email: string;
  linkId: string;
};

// Legacy function for backward compatibility
export function getInternalSections(): InternalSection[] {
  return internalSectionsData.sections;
}

// Firebase functions
export async function fetchInternalSectionsFromFirebase(): Promise<InternalSection[]> {
  try {
    const sectionsCollection = collection(db, 'internal-sections');
    const q = query(sectionsCollection, orderBy('title'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Return legacy data if Firebase is empty
      return internalSectionsData.sections as InternalSection[];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as InternalSection[];
  } catch (error) {
    console.error('Error fetching internal sections from Firebase:', error);
    return internalSectionsData.sections as InternalSection[];
  }
}

export async function updateInternalSectionInFirebase(section: InternalSection): Promise<void> {
  try {
    const sectionRef = doc(db, 'internal-sections', section.id);
    await updateDoc(sectionRef, {
      icon: section.icon,
      title: section.title,
      manager: section.manager,
      email: section.email,
      linkId: section.linkId
    });
  } catch (error) {
    console.error('Error updating internal section in Firebase:', error);
    throw error;
  }
}

export async function addInternalSectionToFirebase(section: InternalSection): Promise<void> {
  try {
    const sectionRef = doc(db, 'internal-sections', section.id);
    await setDoc(sectionRef, {
      icon: section.icon,
      title: section.title,
      manager: section.manager,
      email: section.email,
      linkId: section.linkId
    });
  } catch (error) {
    console.error('Error adding internal section to Firebase:', error);
    throw error;
  }
}
