import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

export type Announcement = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  pinned?: boolean;
  content: string;
  imageUrl?: string;
  location?: string;
  link?: string;
  attachments?: { name: string; url: string }[];
  disappearsAt?: string;
  unpinsAt?: string;
  popupPage?: string;
};

// Firestore collection name
const ANNOUNCEMENTS_COLLECTION = 'announcements';

// Helper to sort announcements
const sortAnnouncements = (announcements: Announcement[]) => {
    return announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


/**
 * Fetch all announcements from Firebase Firestore
 */
export async function fetchAnnouncementsFromFirebase(): Promise<Announcement[]> {
  try {
    const announcementsRef = collection(db, ANNOUNCEMENTS_COLLECTION);
    const q = query(announcementsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
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
    return [];
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
