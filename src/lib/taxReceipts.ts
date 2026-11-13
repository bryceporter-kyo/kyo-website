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
  senderEmail: string;
  senderName: string;
  gmailAppPassword: string; // stored encrypted, server-side only
  termsLegalSlug?: string; // slug of the legal page for CRA terms (e.g. 'cra-tax-receipt-terms')
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
  receiptId?: string;
  driveUrl?: string;
  status: 'pending' | 'emailed' | 'failed' | 'requires-verification';
  errorMessage?: string;
  createdAt?: Timestamp;
}

const SETTINGS_DOC = 'settings/tax-receipts';
const RECEIPTS_COLLECTION = 'tax_receipts';

export async function getTaxReceiptSettings(): Promise<Partial<TaxReceiptSettings>> {
  const snap = await getDoc(doc(db, 'settings', 'tax-receipts'));
  return snap.exists() ? (snap.data() as TaxReceiptSettings) : {};
}

export async function saveTaxReceiptSettings(settings: Partial<TaxReceiptSettings>): Promise<void> {
  await setDoc(doc(db, 'settings', 'tax-receipts'), settings, { merge: true });
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
  status: 'emailed' | 'failed', 
  extra?: { receiptId?: string; driveUrl?: string; errorMessage?: string }
): Promise<void> {
  await updateDoc(doc(db, RECEIPTS_COLLECTION, id), { status, ...extra });
}

export async function fetchTaxReceipts(): Promise<TaxReceiptRecord[]> {
  const q = query(collection(db, RECEIPTS_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TaxReceiptRecord));
}
