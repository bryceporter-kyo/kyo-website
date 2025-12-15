
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import data from './announcements.json';
import { format } from 'date-fns';

export type Announcement = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  pinned?: boolean;
  content: string;
  imageUrl?: string;
  disappearsAt?: string;
  unpinsAt?: string;
};

// Legacy type for JSON data
type LegacyAnnouncement = Omit<Announcement, 'id'> & { id: number };

// Raw data from the JSON file
const rawAnnouncements: Omit<LegacyAnnouncement, 'date' | 'excerpt'>[] = data.announcements as any;

// Firestore collection name
const ANNOUNCEMENTS_COLLECTION = 'announcements';

// Helper to sort announcements
const sortAnnouncements = (announcements: Announcement[]) => {
    return announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Gets all announcements from local JSON (legacy fallback), formats the date, and sorts them.
 * This is a pure function with no side effects.
 */
export function getAnnouncements(): Announcement[] {
  const processed = rawAnnouncements.map((a, i) => ({
    ...a,
    id: String(a.id || i + 1),
    date: format(new Date(`${a.date}T00:00:00`), 'MMMM d, yyyy'),
    pinned: i === 0, // Pin the first announcement by default for demo
  }));
  return sortAnnouncements(processed);
}

/**
 * Fetch all announcements from Firebase Firestore
 */
export async function fetchAnnouncementsFromFirebase(): Promise<Announcement[]> {
  try {
    const announcementsRef = collection(db, ANNOUNCEMENTS_COLLECTION);
    const q = query(announcementsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // If no announcements in Firebase, return legacy announcements
      console.log('[Announcements] No announcements in Firebase, using legacy data');
      return getAnnouncements();
    }
    
    const now = new Date();
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Announcement))
      .filter(announcement => {
        // Filter out expired announcements
        if (announcement.disappearsAt) {
          const expiryDate = new Date(announcement.disappearsAt);
          if (expiryDate < now) return false;
        }
        return true;
      })
      .map(announcement => {
        // Auto-unpin if unpinsAt has passed
        if (announcement.unpinsAt && announcement.pinned) {
          const unpinDate = new Date(announcement.unpinsAt);
          if (unpinDate < now) {
            return { ...announcement, pinned: false };
          }
        }
        return announcement;
      });
  } catch (error) {
    console.error('[Announcements] Error fetching from Firebase:', error);
    // Fallback to legacy announcements
    return getAnnouncements();
  }
}

/**
 * Add a new announcement to Firebase
 */
export async function addAnnouncementToFirebase(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
  const announcementsRef = collection(db, ANNOUNCEMENTS_COLLECTION);
  const docRef = await addDoc(announcementsRef, announcement);
  return { id: docRef.id, ...announcement };
}

/**
 * Update an announcement in Firebase
 */
export async function updateAnnouncementInFirebase(id: string, announcement: Partial<Announcement>): Promise<void> {
  const announcementRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  const { id: _id, ...announcementData } = announcement as Announcement;
  await updateDoc(announcementRef, announcementData);
}

/**
 * Delete an announcement from Firebase
 */
export async function deleteAnnouncementFromFirebase(id: string): Promise<void> {
  const announcementRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  await deleteDoc(announcementRef);
}

/**
 * Adds a new announcement to a given array of announcements.
 * Returns a new sorted array.
 * @deprecated Use addAnnouncementToFirebase instead
 */
export function addAnnouncement(
  currentAnnouncements: Announcement[],
  newAnnouncementData: Omit<Announcement, 'id' | 'date' | 'excerpt'>
): Announcement[] {
  const newAnnouncement: Announcement = {
    ...newAnnouncementData,
    id: String(Math.max(0, ...currentAnnouncements.map(a => parseInt(a.id) || 0)) + 1),
    date: format(new Date(), 'yyyy-MM-dd'),
    excerpt: newAnnouncementData.content.substring(0, 100) + '...',
    disappearsAt: newAnnouncementData.disappearsAt ? format(new Date(newAnnouncementData.disappearsAt), 'yyyy-MM-dd') : undefined,
    unpinsAt: newAnnouncementData.unpinsAt ? format(new Date(newAnnouncementData.unpinsAt), 'yyyy-MM-dd') : undefined,
  };
  return sortAnnouncements([newAnnouncement, ...currentAnnouncements]);
}

/**
 * Deletes an announcement from a given array by its ID.
 * Returns a new array.
 * @deprecated Use deleteAnnouncementFromFirebase instead
 */
export function deleteAnnouncement(
  currentAnnouncements: Announcement[],
  id: string | number
): Announcement[] {
  return currentAnnouncements.filter(a => a.id !== String(id));
}

/**
 * Updates an announcement in a given array.
 * Returns a new sorted array.
 * @deprecated Use updateAnnouncementInFirebase instead
 */
export function updateAnnouncement(
  currentAnnouncements: Announcement[],
  updatedAnnouncement: Announcement
): Announcement[] {
  const updatedList = currentAnnouncements.map(a => 
    a.id === updatedAnnouncement.id ? updatedAnnouncement : a
  );
  return sortAnnouncements(updatedList);
}
