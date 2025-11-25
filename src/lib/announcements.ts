
import data from './announcements.json';
import { format } from 'date-fns';

export type Announcement = {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  pinned?: boolean;
  content: string;
  imageUrl?: string;
  disappearsAt?: string;
  unpinsAt?: string;
};

// Raw data from the JSON file
const rawAnnouncements: Omit<Announcement, 'date' | 'excerpt'>[] = data.announcements as any;

// Helper to sort announcements
const sortAnnouncements = (announcements: Announcement[]) => {
    return announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Gets all announcements, formats the date, and sorts them.
 * This is a pure function with no side effects.
 */
export function getAnnouncements(): Announcement[] {
  const processed = rawAnnouncements.map((a, i) => ({
    ...a,
    date: format(new Date(`${a.date}T00:00:00`), 'MMMM d, yyyy'),
    pinned: i === 0, // Pin the first announcement by default for demo
  }));
  return sortAnnouncements(processed);
}

/**
 * Adds a new announcement to a given array of announcements.
 * Returns a new sorted array.
 */
export function addAnnouncement(
  currentAnnouncements: Announcement[],
  newAnnouncementData: Omit<Announcement, 'id' | 'date' | 'excerpt'>
): Announcement[] {
  const newAnnouncement: Announcement = {
    ...newAnnouncementData,
    id: Math.max(0, ...currentAnnouncements.map(a => a.id)) + 1,
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
 */
export function deleteAnnouncement(
  currentAnnouncements: Announcement[],
  id: number
): Announcement[] {
  return currentAnnouncements.filter(a => a.id !== id);
}

/**
 * Updates an announcement in a given array.
 * Returns a new sorted array.
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
