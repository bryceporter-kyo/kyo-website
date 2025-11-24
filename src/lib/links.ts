
import data from './links.json';

export type ExternalLink = {
  id: string;
  name: string;
  url: string;
};

export const links: ExternalLink[] = data.links;

export function getLinks(): ExternalLink[] {
  return links;
}

export function getLinkById(id: string): ExternalLink | undefined {
  return links.find(link => link.id === id);
}
