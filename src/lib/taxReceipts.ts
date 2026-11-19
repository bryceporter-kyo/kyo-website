import { db } from './firebase';
import { 
  collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, 
  serverTimestamp, orderBy, query, Timestamp 
} from 'firebase/firestore';

export interface TaxReceiptSettings {
  googleDocTemplateId: string;
  googleDriveFolderId: string;
  googleSheetId: string;
  appsScriptWebAppUrl: string;
  appsScriptSecret: string;
  senderName: string;
  senderEmail: string;       // From Email Address
  replyToEmail?: string;     // Reply-To Email Address
  googleAccountUser?: string;// Google Workspace / Account Username (authenticating account)
  gmailAppPassword: string;  // 16-character Google App Password
  termsLegalSlug?: string;   // slug of the legal page for CRA terms (e.g. 'cra-tax-receipt-terms')
  hideHolidayCalendar?: boolean; // Controls public visibility of the Holiday Gift Catalogue / Calendar
  autoTaxReceipts?: boolean; // Toggle: whether to automatically generate/email receipts via Google Apps Script (defaults to true if unset)
  
  // Dedication Card Email Custom Sender & Template
  dedicationSenderName?: string;
  dedicationSenderEmail?: string;
  dedicationReplyToEmail?: string;
  dedicationSubjectTemplate?: string;
  dedicationMessageTemplate?: string;

  // Donation Thank You Email Settings & Template
  sendThankYouEmail?: boolean;
  thankYouSenderName?: string;
  thankYouSenderEmail?: string;
  thankYouReplyToEmail?: string;
  thankYouSubjectTemplate?: string;
  thankYouMessageTemplate?: string;

  smtpUser?: string;
  smtpHost?: string;
  smtpPort?: string;
}

export interface TaxReceiptRecord {
  id?: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorAddress: string;
  amount: number;
  assumedAnnualAmount?: number; // 12-month value for monthly donations
  frequency: string;
  donationDate: string;
  wantsTaxReceipt?: boolean; // true = donor requested CRA receipt; false = no receipt needed
  projectName?: string; // gift name or project (e.g. "Upbeat! Gift Catalogue: Instrument Outfit")
  receiptId?: string;
  driveUrl?: string;
  status: 'pending' | 'emailed' | 'failed' | 'requires-verification' | 'no-receipt';
  errorMessage?: string;
  createdAt?: Timestamp;
}

export interface TaxReceiptAuditLog {
  id?: string;
  eventType: 
    | 'settings_saved' 
    | 'settings_edited' 
    | 'script_copied' 
    | 'connection_test_initiated' 
    | 'connection_test_success' 
    | 'connection_test_failed' 
    | 'webhook_received' 
    | 'manual_receipt_synced' 
    | 'monthly_held';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  status?: 'success' | 'info' | 'warning' | 'error';
  createdAt?: Timestamp;
}

const SETTINGS_DOC = 'settings/tax-receipts';
const RECEIPTS_COLLECTION = 'tax_receipts';
const AUDIT_LOGS_COLLECTION = 'tax_receipt_audit_logs';

export async function getTaxReceiptSettings(): Promise<Partial<TaxReceiptSettings>> {
  const snap = await getDoc(doc(db, 'settings', 'tax-receipts'));
  return snap.exists() ? (snap.data() as TaxReceiptSettings) : {};
}

export async function saveTaxReceiptSettings(settings: Partial<TaxReceiptSettings>): Promise<void> {
  await setDoc(doc(db, 'settings', 'tax-receipts'), settings, { merge: true });
}

export async function logTaxReceiptAudit(log: Omit<TaxReceiptAuditLog, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
      ...log,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('Failed to log audit event:', err);
    return '';
  }
}

export async function fetchTaxReceiptAuditLogs(limitCount = 100): Promise<TaxReceiptAuditLog[]> {
  try {
    const q = query(collection(db, AUDIT_LOGS_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.slice(0, limitCount).map(d => ({ id: d.id, ...d.data() } as TaxReceiptAuditLog));
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    return [];
  }
}

export async function logTaxReceipt(record: TaxReceiptRecord): Promise<string> {
  const docRef = await addDoc(collection(db, RECEIPTS_COLLECTION), {
    ...record,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTaxReceiptStatus(
  id: string, 
  status: 'emailed' | 'failed' | 'no-receipt', 
  extra?: { receiptId?: string; driveUrl?: string; errorMessage?: string }
): Promise<void> {
  await updateDoc(doc(db, RECEIPTS_COLLECTION, id), { status, ...extra });
}

export async function fetchTaxReceipts(): Promise<TaxReceiptRecord[]> {
  const q = query(collection(db, RECEIPTS_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TaxReceiptRecord));
}
