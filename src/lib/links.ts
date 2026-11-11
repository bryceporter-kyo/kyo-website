
import { db, sanitizeForFirestore } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import data from './links.json';

export type ExternalLink = {
  id: string;
  name: string;
  url: string;
};

const legacyLinks: ExternalLink[] = data.links;

// Firestore collection name
const LINKS_COLLECTION = 'links';

export const links: ExternalLink[] = legacyLinks;

export const internalPages = [
    { id: '/', name: 'Home' },
    { id: '/about', name: 'About' },
    { id: '/programs/orchestras', name: 'Orchestras' },
    { id: '/programs/upbeat', name: 'Upbeat!' },
    { id: '/programs/lessons', name: 'Lessons' },
    { id: '/programs/calendar', name: 'Calendar' },
    { id: '/support-us/donate', name: 'Donate' },
    { id: '/support-us/ways-to-give', name: 'Support Us' },
    { id: '/support-us/volunteer', name: 'Volunteer' },
    { id: '/contact', name: 'Contact' },
    { id: '/team', name: 'Team' },
    { id: '/internal', name: 'Internal' },
    { id: '/admin', name: 'Admin' },
];

let cachedFirebaseLinks: ExternalLink[] | null = null;

export function getLinks(): ExternalLink[] {
  return cachedFirebaseLinks || legacyLinks;
}

export function getLinkById(id: string): ExternalLink | undefined {
  if (cachedFirebaseLinks) {
    const found = cachedFirebaseLinks.find(link => link.id === id);
    if (found) return found;
  }
  return legacyLinks.find(link => link.id === id);
}

export function getInternalPageById(id: string) {
    return internalPages.find(page => page.id === id);
}

/**
 * Fetch all links from Firebase Firestore
 */
export async function fetchLinksFromFirebase(): Promise<ExternalLink[]> {
    try {
        const linksRef = collection(db, LINKS_COLLECTION);
        const snapshot = await getDocs(linksRef);
        
        if (snapshot.empty) {
            console.log('[Links] No links in Firebase, using legacy data');
            return legacyLinks;
        }
        
        const fetched = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as ExternalLink[];
        cachedFirebaseLinks = fetched;
        return fetched;
    } catch (error) {
        console.error('[Links] Error fetching from Firebase:', error);
        return legacyLinks;
    }
}

/**
 * Add a new link to Firebase
 */
export async function addLinkToFirebase(link: ExternalLink): Promise<ExternalLink> {
    // Use the link id as the document id for consistency
    const linkRef = doc(db, LINKS_COLLECTION, link.id);
    const cleanLink = sanitizeForFirestore({ name: link.name, url: link.url });
    await setDoc(linkRef, cleanLink);
    if (cachedFirebaseLinks) {
        cachedFirebaseLinks = [...cachedFirebaseLinks.filter(l => l.id !== link.id), link];
    }
    return link;
}

/**
 * Update a link in Firebase (creates if not existing)
 */
export async function updateLinkInFirebase(id: string, link: Partial<ExternalLink>): Promise<void> {
    const linkRef = doc(db, LINKS_COLLECTION, id);
    const { id: _id, ...linkData } = link as ExternalLink;
    const cleanLinkData = sanitizeForFirestore(linkData);
    await setDoc(linkRef, cleanLinkData, { merge: true });
    if (cachedFirebaseLinks) {
        cachedFirebaseLinks = cachedFirebaseLinks.map(l => l.id === id ? { ...l, ...cleanLinkData } : l);
    }
}

/**
 * Delete a link from Firebase
 */
export async function deleteLinkFromFirebase(id: string): Promise<void> {
    const linkRef = doc(db, LINKS_COLLECTION, id);
    await deleteDoc(linkRef);
    if (cachedFirebaseLinks) {
        cachedFirebaseLinks = cachedFirebaseLinks.filter(l => l.id !== id);
    }
}
