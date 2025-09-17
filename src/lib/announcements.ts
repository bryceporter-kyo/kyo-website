import data from './announcements.json';

export type Announcement = {
  id: number;
  title: string;
  date: string;
  excerpt: string;
};

const announcements: Announcement[] = data.announcements;

export function getAnnouncements(): Announcement[] {
  // Sort by date descending
  return announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
