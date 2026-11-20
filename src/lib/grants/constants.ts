import { GrantsSettings, GrantStageConfig } from './types';

export const DEFAULT_LEADING_WORDS = ['The', 'A', 'An', 'Le', 'La', 'Les', "L'"];

export const DEFAULT_STAGES: GrantStageConfig[] = [
  { id: 'prospect', name: 'Prospect', order: 1, createsFiles: false, folderStatusText: '' },
  { id: 'researching', name: 'Researching', order: 2, createsFiles: false, folderStatusText: '' },
  { id: 'qualified-timing', name: 'Qualified: Timing Not Right', order: 3, requiredFields: ['returnToDate'], createsFiles: false, folderStatusText: '' },
  { id: 'qualified-apply', name: 'Qualified: To Apply', order: 4, createsFiles: false, folderStatusText: '' },
  { id: 'writing-loi', name: 'Writing LOI', order: 5, createsFiles: true, folderStatusText: '' },
  { id: 'loi-submitted', name: 'LOI Submitted', order: 6, requiredFields: ['submittedOn'], createsFiles: true, folderStatusText: '' },
  { id: 'drafting', name: 'Drafting', order: 7, requiredFields: ['questions'], createsFiles: true, folderStatusText: '' },
  { id: 'in-review', name: 'In Review (internal)', order: 8, createsFiles: true, folderStatusText: '' },
  { id: 'submitted', name: 'Submitted: Pending Decision', order: 9, requiredFields: ['submittedOn'], createsFiles: false, folderStatusText: '' },
  { id: 'won-multi', name: 'Closed: Won: Multi-Year', order: 10, requiredFields: ['yearsCount', 'renewalDate'], createsFiles: false, folderStatusText: 'Closed: Won' },
  { id: 'won-single', name: 'Closed: Won: Single-Year: Reapply', order: 11, requiredFields: ['renewalDate'], createsFiles: false, folderStatusText: 'Closed: Won' },
  { id: 'lost-not-qual', name: 'Closed: Lost: Not Qualified', order: 12, createsFiles: false, folderStatusText: 'Closed: Lost: Not Qualified' },
  { id: 'lost-reapply', name: 'Closed: Lost: Reapply', order: 13, requiredFields: ['returnToDate'], createsFiles: false, folderStatusText: 'Closed: Lost: Reapply' },
  { id: 'cancelled-not-qual', name: 'Cancelled: Not Qualified', order: 14, createsFiles: false, folderStatusText: 'Cancelled: Not Qualified', isTerminal: true },
  { id: 'cancelled-poor-fit', name: 'Cancelled: Poor Fit', order: 15, createsFiles: false, folderStatusText: 'Cancelled: Poor Fit', isTerminal: true },
  { id: 'archived', name: 'Archived', order: 16, createsFiles: false, folderStatusText: 'Archived', isTerminal: true },
];

export const PERMANENT_KYO_PROGRAMS = ['The Orchestras', 'Upbeat!', 'Chamber Music', 'Lessons'];

export const DEFAULT_FUNDER_TYPES = [
  'Private foundation',
  'Government',
  'Corporate',
  'Community foundation',
];

export const DEFAULT_GEO_SCOPES = ['Local', 'Provincial', 'National'];

export const DEFAULT_FOCUS_AREAS = ['Youth', 'Music', 'Arts education'];

export const DEFAULT_REPORTING_TYPES = [
  'Interim Report',
  'Final Report',
  'Financial Report',
  'Site Visit',
  'Other',
];

export const DEFAULT_PAYMENT_METHODS = ['Cheque', 'Transfer', 'Other'];

export const DEFAULT_REJECTION_REASONS = [
  'Not eligible',
  'Wrong focus',
  'Too small',
  'Other',
];

export const DEFAULT_DOCUMENT_TYPES = [
  'Grant Agreement',
  'LOI Letter',
  'LOI Questions',
  'Application Q&A',
  'Report',
  'Correspondence',
  'Budget',
  'Financial Statements',
  'Board List',
  'Receipt',
  'Quote',
  'Estimate',
  'Supporting Document',
];

export const DEFAULT_GRANTS_SETTINGS: GrantsSettings = {
  grantApplicationsFolderId: '',
  letterheadTemplateDocId: '',
  qaTemplateDocId: '',
  grantsCalendarId: '',
  appsScriptWebAppUrl: '',
  appsScriptSecret: '',
  fiscalYearStartMonth: 7, // July
  stages: DEFAULT_STAGES,
  kyoPrograms: PERMANENT_KYO_PROGRAMS,
  funderTypes: DEFAULT_FUNDER_TYPES,
  geographicScopes: DEFAULT_GEO_SCOPES,
  focusAreas: DEFAULT_FOCUS_AREAS,
  reportingTypes: DEFAULT_REPORTING_TYPES,
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  rejectionReasons: DEFAULT_REJECTION_REASONS,
  documentTypes: DEFAULT_DOCUMENT_TYPES,
  leadingWords: DEFAULT_LEADING_WORDS,
};

/**
 * Generate sort-name following the spec:
 * E.g., "The Jackman Foundation" -> "Jackman Foundation (The)"
 * "L'Alliance Francaise" -> "Alliance Francaise (L')"
 */
export function computeSortName(name: string, leadingWords: string[] = DEFAULT_LEADING_WORDS): string {
  if (!name) return '';
  const trimmed = name.trim();

  for (const word of leadingWords) {
    // If the word has an apostrophe (like L'), match prefix directly
    if (word.endsWith("'")) {
      const regex = new RegExp(`^${word}\\s*`, 'i');
      if (regex.test(trimmed)) {
        const remainder = trimmed.replace(regex, '').trim();
        return `${remainder} (${word})`;
      }
    } else {
      // Normal word boundary
      const regex = new RegExp(`^${word}\\b\\s*`, 'i');
      if (regex.test(trimmed)) {
        const remainder = trimmed.replace(regex, '').trim();
        // Capitalize first letter of word in parens for clean formatting
        const formattedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        return `${remainder} (${formattedWord})`;
      }
    }
  }

  return trimmed;
}

/**
 * URL Slug Sanitization:
 * - Lowercase
 * - All runs of non-alphanumeric characters converted to single hyphen
 * - Leading and trailing hyphens removed
 * E.g., "Example & Clean" -> "example-clean"
 */
export function sanitizeSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate canonical public Case for Support URL for a Grant
 * /support-us/case-for-support/{uid6}/{funder-slug}/{year}
 * or with optional programSlug:
 * /support-us/case-for-support/{uid6}/{funder-slug}/{year}/{program-slug}
 */
export function getGrantPublicUrl(grant: {
  id?: string;
  funderName?: string;
  slug?: string;
  grantCycleYear?: string;
  startedAt?: string;
  createdAt?: string;
  programSlug?: string;
}): string {
  const uid6 = grant.id ? grant.id.substring(0, 6) : 'grantx';
  const funderSlug = grant.slug || sanitizeSlug(grant.funderName || 'funder');
  const year = grant.grantCycleYear || new Date(grant.startedAt || grant.createdAt || Date.now()).getFullYear().toString();
  const base = `/support-us/case-for-support/${uid6}/${funderSlug}/${year}`;
  if (grant.programSlug && grant.programSlug.trim()) {
    return `${base}/${sanitizeSlug(grant.programSlug)}`;
  }
  return base;
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = [];
  for (let i = 0; i <= bn; ++i) matrix[i] = [i];
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Normalize funder name for duplicate checking
 */
export function normalizeFunderName(name: string, leadingWords: string[] = DEFAULT_LEADING_WORDS): string {
  let cleaned = name.toLowerCase().trim();
  for (const word of leadingWords) {
    const w = word.toLowerCase();
    if (w.endsWith("'")) {
      if (cleaned.startsWith(w)) {
        cleaned = cleaned.slice(w.length).trim();
      }
    } else {
      if (cleaned.startsWith(`${w} `)) {
        cleaned = cleaned.slice(w.length + 1).trim();
      }
    }
  }
  return cleaned.replace(/[^a-z0-9]/g, '');
}

/**
 * Extract clean domain name from URL for duplicate checking
 */
export function extractDomain(url?: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
  }
}
