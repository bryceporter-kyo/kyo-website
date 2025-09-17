import data from './announcements.json';

export type Announcement = {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  pinned?: boolean;
};

const announcements: Announcement[] = data.announcements;

export function getAnnouncements(): Announcement[] {
  // Add pinned property for demo purposes
  const announcementsWithPinned = announcements.map((a, i) => ({
    ...a,
    pinned: i === 0, // Pin the first announcement by default
  }));
  
  // Sort by date descending
  return announcementsWithPinned.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
