import { db, sanitizeForFirestore } from './firebase';
import { z } from 'zod';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

export type PrimaryProgram = 'general' | 'orchestras' | 'upbeat' | 'lessons';
export type FundingType = 'one-time' | 'multi-year' | 'matching';
export type BudgetLineItem = { item: string; amount: string; category?: string; subcategory?: string };
export type TimelineMilestone = { milestone: string; date: string; description?: string };
export type PastSupportRecord = { year: string; amount: string; note?: string };
export type GrantQAPair = { question: string; answer: string };

export interface GrantCase {
  id?: string;
  organizationName: string;
  programOfSupport: 'Orchestras' | 'Upbeat!' | 'Lessons' | 'Chamber Music';
  funderName: string;
  grantName?: string | null;
  amountRequested: number;
  primaryProgram: 'Orchestras' | 'Upbeat!' | 'Lessons' | 'Chamber Music';
  grantCycleYear: string;
  submissionDate: string;
  published?: boolean;

  // Funding context, all optional
  fundingType?: FundingType | null;
  numberOfYears?: number | null;
  matchRequired?: boolean | null;
  matchAmount?: string | null;
  applicationDeadline?: string | null;

  // Narrative overrides, admin authored, optional
  customLetterBody?: string[] | null; // paragraphs; overrides the default letter if set
  valuesAlignment?: string | null; // "Why KYO Aligns With {{funderName}}"
  reportingPlan?: string | null;
  recognitionPlan?: string | null;

  // Structured content, optional
  pastSupport?: PastSupportRecord[] | null;
  budgetBreakdown?: BudgetLineItem[] | null;
  timeline?: TimelineMilestone[] | null;
  grantQA?: GrantQAPair[] | null;

  // Documents and links, optional
  driveFolderUrl?: string | null;
  caseForSupportPdfUrl?: string | null;
  grantApplicationPdfUrl?: string | null;
  headerImageUrl?: string | null;

  // Contact override, optional, defaults applied in the page
  contactName?: string | null;
  contactEmail?: string | null;

  // Signature override, optional, defaults to Bryce Porter / Chair
  signerName?: string | null;
  signerTitle?: string | null;
  signerImageUrl?: string | null;

  // SEO, optional
  metaTitle?: string | null;
  metaDescription?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;

  // Internal only
  internalNotes?: string | null;
}

export const PROGRAM_OPTIONS = ['Orchestras', 'Upbeat!', 'Lessons', 'Chamber Music'] as const;

export const grantSchema = z.object({
  organizationName: z.string().min(2, "Organization Name must be at least 2 characters."),
  programOfSupport: z.enum(PROGRAM_OPTIONS, {
    errorMap: () => ({ message: "Please select a valid Program of Support." })
  }),
  funderName: z.string().min(2, "Funder Name must be at least 2 characters."),
  grantName: z.string().nullable().optional(),
  amountRequested: z.coerce.number().min(0, "Amount must be a positive number."),
  primaryProgram: z.enum(PROGRAM_OPTIONS, {
    errorMap: () => ({ message: "Please select a valid Primary Program." })
  }),
  grantCycleYear: z.string().regex(/^\d{4}$/, "Must be a 4-digit year (e.g. 2026)."),
  submissionDate: z.string().min(5, "Please select a submission date."),
  published: z.boolean().optional(),

  // Funding context
  fundingType: z.enum(['one-time', 'multi-year', 'matching']).nullable().optional(),
  numberOfYears: z.coerce.number().nullable().optional(),
  matchRequired: z.boolean().nullable().optional(),
  matchAmount: z.string().nullable().optional(),
  applicationDeadline: z.string().nullable().optional(),

  // Narrative overrides
  customLetterBody: z.array(z.string()).nullable().optional(),
  valuesAlignment: z.string().nullable().optional(),
  reportingPlan: z.string().nullable().optional(),
  recognitionPlan: z.string().nullable().optional(),

  // Structured content
  pastSupport: z.array(z.object({
    year: z.string(),
    amount: z.string(),
    note: z.string().optional()
  })).nullable().optional(),
  
  budgetBreakdown: z.array(z.object({
    item: z.string(),
    amount: z.string(),
    category: z.string().optional(),
    subcategory: z.string().optional()
  })).nullable().optional(),
  
  timeline: z.array(z.object({
    milestone: z.string(),
    date: z.string(),
    description: z.string().optional()
  })).nullable().optional(),
  
  grantQA: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).nullable().optional(),

  // Documents and links
  driveFolderUrl: z.string().nullable().optional(),
  caseForSupportPdfUrl: z.string().nullable().optional(),
  grantApplicationPdfUrl: z.string().nullable().optional(),
  headerImageUrl: z.string().nullable().optional(),

  // Contact override
  contactName: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),

  // Signature override
  signerName: z.string().nullable().optional(),
  signerTitle: z.string().nullable().optional(),
  signerImageUrl: z.string().nullable().optional(),

  // SEO
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  noIndex: z.boolean().default(true).optional(),
  noFollow: z.boolean().default(false).optional(),

  // Internal
  internalNotes: z.string().nullable().optional(),
});

export type GrantSchemaType = z.infer<typeof grantSchema>;

const COLLECTION_NAME = 'case_for_support';

// Clean funder name to replace spaces with dashes, prevent consecutive dashes, and remove invalid URL characters
export function slugifyFunder(funder: string): string {
  return funder
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with dashes
    .replace(/-+/g, '-')         // Disallow consecutive dashes
    .replace(/[^a-z0-9-]/g, ''); // Remove non-alphanumeric/non-dash characters
}

// Generate the specific dynamic URL path: /support-us/case-for-support/UID(first 6 chars)/Funder-Name/Year
export function getGrantUrlPath(grant: GrantCase): string {
  const truncatedUid = grant.id ? grant.id.substring(0, 6) : 'xxxxxx';
  const slugifiedFunder = slugifyFunder(grant.funderName);
  return `/support-us/case-for-support/${truncatedUid}/${slugifiedFunder}/${grant.grantCycleYear}`;
}

export async function fetchAllGrants(): Promise<GrantCase[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GrantCase[];
  } catch (error) {
    console.error('Error fetching grants:', error);
    return [];
  }
}

export async function getGrant(id: string): Promise<GrantCase | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as GrantCase;
    }
    return null;
  } catch (error) {
    console.error('Error fetching grant:', error);
    return null;
  }
}

export async function addGrant(grant: Omit<GrantCase, 'id'>): Promise<string> {
  try {
    const sanitizedGrant = sanitizeForFirestore(grant);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedGrant);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding grant:', error);
    throw new Error(`Failed to add grant: ${error.message || 'Unknown error'}`);
  }
}

export async function updateGrant(id: string, grant: Partial<GrantCase>): Promise<void> {
  try {
    const sanitizedGrant = sanitizeForFirestore(grant);
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, sanitizedGrant);
  } catch (error: any) {
    console.error('Error updating grant:', error);
    throw new Error(`Failed to update grant: ${error.message || 'Unknown error'}`);
  }
}

export async function deleteGrant(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

// Fetch a grant by its truncated 6-character UID
export async function fetchGrantByTruncatedUid(truncatedUid: string): Promise<GrantCase | null> {
  try {
    const grantsSnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const matchingDoc = grantsSnapshot.docs.find(doc => doc.id.substring(0, 6) === truncatedUid);
    
    if (matchingDoc) {
      return {
        id: matchingDoc.id,
        ...matchingDoc.data()
      } as GrantCase;
    }
    return null;
  } catch (error) {
    console.error('Error finding grant by truncated UID:', error);
    return null;
  }
}
