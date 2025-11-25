
import internalSectionsData from './internal-sections.json';

export type InternalSection = {
  id: string;
  icon: string;
  title: string;
  manager: string;
  email: string;
  linkId: string;
};

export function getInternalSections(): InternalSection[] {
  return internalSectionsData.sections;
}
