import data from './events.json';

export type Event = {
  id: number;
  date: string;
  name: string;
  location?: string;
  time?: string;
  link?: string;
  type: 'special' | 'normal';
};

const events: Event[] = data.events;

export function getEvents(): Event[] {
  // Sort by date ascending
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
