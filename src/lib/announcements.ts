
import data from './announcements.json';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';


export type Announcement = {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  pinned?: boolean;
  content: string;
};

const announcements: Omit<Announcement, 'date'> & { date: string }[] = data.announcements as any;

let processedAnnouncements: Announcement[] | null = null;

export function getAnnouncements(): Announcement[] {
  if (processedAnnouncements) {
    return processedAnnouncements;
  }
  // Add pinned property for demo purposes and format date
  const announcementsWithPinned = announcements.map((a, i) => ({
    ...a,
    // Dates in JSON are "YYYY-MM-DD". Using new Date() might have timezone issues.
    // Let's format it consistently.
    date: format(new Date(`${a.date}T00:00:00`), 'MMMM d, yyyy'),
    pinned: i === 0, // Pin the first announcement by default
  }));
  
  // Sort by original date descending
  processedAnnouncements = announcementsWithPinned.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return processedAnnouncements;
}

export function addAnnouncement(announcement: Omit<Announcement, 'id' | 'date'>) {
    const newAnnouncement: Announcement = {
        ...announcement,
        id: Math.max(0, ...getAnnouncements().map(a => a.id)) + 1,
        date: format(new Date(), 'MMMM d, yyyy'),
    };
    
    processedAnnouncements = [newAnnouncement, ...getAnnouncements()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return newAnnouncement;
}

export function deleteAnnouncement(id: number) {
    processedAnnouncements = getAnnouncements().filter(a => a.id !== id);
}

export function updateAnnouncement(updatedAnnouncement: Announcement) {
    const announcements = getAnnouncements().map(a => a.id === updatedAnnouncement.id ? updatedAnnouncement : a);
    processedAnnouncements = announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
