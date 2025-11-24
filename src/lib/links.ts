
import data from './links.json';

export type ExternalLink = {
  id: string;
  name: string;
  url: string;
};

export const links: ExternalLink[] = data.links;

export const internalPages = [
    { id: '/', name: 'Home' },
    { id: '/about', name: 'About' },
    { id: '/orchestras', name: 'Orchestras' },
    { id: '/upbeat', name: 'Upbeat!' },
    { id: '/lessons', name: 'Lessons' },
    { id: '/calendar', name: 'Calendar' },
    { id: '/donate', name: 'Donate' },
    { id: '/support', name: 'Support Us' },
    { id: '/volunteer', name: 'Volunteer' },
    { id: '/contact', name: 'Contact' },
    { id: '/team', name: 'Team' },
    { id: '/internal', name: 'Internal' },
    { id: '/admin', name: 'Admin' },
];

export function getLinks(): ExternalLink[] {
  return links;
}

export function getLinkById(id: string): ExternalLink | undefined {
  return links.find(link => link.id === id);
}

export function getInternalPageById(id: string) {
    return internalPages.find(page => page.id === id);
}
