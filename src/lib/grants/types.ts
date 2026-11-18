/**
 * KYO Grants Management - Data Models & Types
 * Source of truth for all Grants Portal collections and records
 */

export interface FunderLink {
  id: string;
  title: string;
  url: string;
}

export interface FunderContact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
}

export type FunderType = 
  | 'Private foundation' 
  | 'Government' 
  | 'Corporate' 
  | 'Community foundation' 
  | string;

export type GeographicScope = 
  | 'Local' 
  | 'Provincial' 
  | 'National' 
  | string;

export type TriageStatus = 'unreviewed' | 'prospect' | 'rejected';

export interface FunderProgram {
  id: string;
  name: string;
  openMonth?: number; // 1-12
  closeMonth?: number; // 1-12
  isRecurring?: boolean;
  minAward?: number;
  maxAward?: number;
  eligibilityNotes?: string;
  websiteUrl?: string;
  keyDatesNotes?: string;
  contacts?: FunderContact[];
  links?: FunderLink[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Funder {
  id: string;
  name: string;
  sortName: string; // e.g. "Jackman Foundation (The)"
  slug: string; // e.g. "jackman-foundation"
  type: FunderType;
  geoScope: GeographicScope;
  focusAreas: string[]; // e.g. ["Youth", "Music", "Arts Education"]
  city?: string;
  province?: string;
  country?: string;
  website?: string;
  otherLinks?: FunderLink[];
  contacts?: FunderContact[];
  eligibilityNotes?: string;
  triageStatus: TriageStatus;
  rejectionReason?: string;
  // Fallback manual stats before app history exists
  fundedBeforeOverride?: boolean;
  totalWonOverride?: number;
  programs?: FunderProgram[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GrantStageConfig {
  id: string;
  name: string;
  order: number;
  requiredFields?: ('returnToDate' | 'submittedOn' | 'decisionDate' | 'yearsCount' | 'renewalDate' | 'questions')[];
  createsFiles: boolean;
  folderStatusText: string;
  isTerminal?: boolean; // Cancelled / Archived
}

export interface QuestionItem {
  id: string;
  question: string;
  answerHtml?: string;
  charLimit?: number;
  order: number;
  publicVisible?: boolean; // default true, false hides from public CFS
}

export interface GrantPayment {
  id: string;
  expectedDate: string;
  expectedAmount?: number;
  status: 'Expected' | 'Received';
  receivedDate?: string;
  receivedAmount?: number;
  method?: 'Cheque' | 'Transfer' | 'Other' | string;
  referenceNumber?: string;
  notes?: string;
}

export interface GrantReportingObligation {
  id: string;
  dueDate: string;
  type: 'Interim Report' | 'Final Report' | 'Financial Report' | 'Site Visit' | 'Other' | string;
  completed: boolean;
  completedDate?: string;
  reportDriveUrl?: string;
  notes?: string;
  calendarEventId?: string;
}

export interface GrantNote {
  id: string;
  date: string;
  funderContactName?: string;
  kyoContactName?: string;
  content: string;
  createdAt?: string;
}

export interface GrantDocument {
  id: string;
  type: string;
  customName?: string;
  driveFileId: string;
  driveUrl: string;
  fileName: string;
  uploadedAt: string;
}

export interface GrantAuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName?: string;
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  summary: string;
}

export interface YearlyAllocation {
  fiscalYear: string; // e.g. "2026-27"
  amount: number;
}

export interface ProgramSplit {
  programName: string;
  percentage: number;
  amount: number;
}

export interface Grant {
  id: string;
  funderId: string;
  funderName: string;
  programId: string;
  programName: string;
  stage: string;
  stageEnteredAt: string;
  assignedOwnerEmail: string;
  assignedOwnerName?: string;
  kyoPrograms: string[]; // ["The Orchestras", "Upbeat!", "Chamber Music", "Lessons"]
  
  // Dates
  startedAt?: string;
  applicationDeadline?: string;
  loiSubmittedOn?: string;
  submittedOn?: string;
  decisionDate?: string;
  dateAwarded?: string;
  periodStart?: string;
  periodEnd?: string;
  
  // Follow-up dates
  returnToDate?: string;
  returnToUsed?: boolean;
  renewalDate?: string;
  renewalUsed?: boolean;
  exclusionPeriodExpiry?: string;
  ineligibleUntil?: string;

  // Money & allocation
  amountRequested?: number;
  awardMode?: 'total' | 'per-year';
  amountAwarded?: number;
  yearlyAllocations?: YearlyAllocation[];
  programSplits?: ProgramSplit[];
  fundsRestrictions?: string;

  // Google Drive & Docs links
  driveFolderId?: string;
  driveFolderUrl?: string;
  loiLetterDocId?: string;
  loiQuestionsDocId?: string;
  qaDocId?: string;

  // Public portal publishing
  slug: string;
  slugLocked?: boolean;
  published?: boolean;
  programSlug?: string; // used for disambiguation

  // Clones
  clonedFromGrantId?: string;
  clonedYear?: number;

  // Sub-items (can be stored embedded or sub-collection)
  questions?: QuestionItem[];
  payments?: GrantPayment[];
  reportingObligations?: GrantReportingObligation[];
  notes?: GrantNote[];
  documents?: GrantDocument[];

  createdAt?: string;
  updatedAt?: string;
}

export interface GrantsSettings {
  // Google Connections
  grantApplicationsFolderId: string;
  letterheadTemplateDocId: string;
  qaTemplateDocId?: string;
  grantsCalendarId: string;
  appsScriptWebAppUrl: string;
  appsScriptSecret: string;
  fiscalYearStartMonth: number; // 7 for July

  // Managed Lists
  stages: GrantStageConfig[];
  kyoPrograms: string[];
  funderTypes: string[];
  geographicScopes: string[];
  focusAreas: string[];
  reportingTypes: string[];
  paymentMethods: string[];
  rejectionReasons: string[];
  documentTypes: string[];
  leadingWords: string[];
}
