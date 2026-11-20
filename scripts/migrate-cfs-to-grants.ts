/**
 * One-time migration script: Case for Support -> Grants System
 * Reads all legacy `case_for_support` documents and migrates them into `grant_records`.
 *
 * Usage:
 *   npx tsx scripts/migrate-cfs-to-grants.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

function sanitizeSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function migrate() {
  console.log('--- Starting Migration from case_for_support to grant_records ---');

  const oldCollRef = collection(db, 'case_for_support');
  const oldSnap = await getDocs(oldCollRef);

  console.log(`Found ${oldSnap.docs.length} documents in 'case_for_support'.`);

  if (oldSnap.docs.length === 0) {
    console.log('No legacy records to migrate. Exiting.');
    return;
  }

  const newCollRef = collection(db, 'grant_records');
  const existingGrantsSnap = await getDocs(newCollRef);
  const existingGrants = existingGrantsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

  let migratedCount = 0;

  for (const docSnap of oldSnap.docs) {
    const data = docSnap.data();
    const docId = docSnap.id;

    console.log(`\nProcessing: "${data.funderName}" (${data.grantCycleYear || 'no year'}) [ID: ${docId}]`);

    // Match existing grant by ID or by funderName
    const matched = existingGrants.find(
      g => g.id === docId || (g.funderName && data.funderName && g.funderName.toLowerCase().trim() === data.funderName.toLowerCase().trim())
    );

    const targetId = matched ? matched.id : docId;

    // Map grantQA into QuestionItem[]
    const questions = (data.grantQA || []).map((qa: any, idx: number) => ({
      id: `q_${idx + 1}`,
      question: qa.question || '',
      answerHtml: qa.answer || '',
      order: idx + 1,
      publicVisible: true,
    }));

    const grantRecord: any = {
      funderName: data.funderName || '',
      programName: data.primaryProgram || data.programOfSupport || 'General Fund',
      grantName: data.grantName || null,
      amountRequested: data.amountRequested || 0,
      grantCycleYear: data.grantCycleYear || new Date().getFullYear().toString(),
      submittedOn: data.submissionDate || null,
      published: Boolean(data.published),
      slug: sanitizeSlug(data.funderName || 'funder'),
      stage: 'Prospect',
      assignedOwnerEmail: '',
      kyoPrograms: [data.primaryProgram || 'Upbeat!'],
      
      // Narrative Overrides
      customLetterBody: data.customLetterBody || null,
      valuesAlignment: data.valuesAlignment || null,
      reportingPlan: data.reportingPlan || null,
      recognitionPlan: data.recognitionPlan || null,

      // Structured Content
      pastSupport: data.pastSupport || null,
      budgetBreakdown: data.budgetBreakdown || null,
      timeline: data.timeline || null,
      questions,

      // Media & Links
      driveFolderUrl: data.driveFolderUrl || null,
      caseForSupportPdfUrl: data.caseForSupportPdfUrl || null,
      grantApplicationPdfUrl: data.grantApplicationPdfUrl || null,
      headerImageUrl: data.headerImageUrl || null,

      // Contact & Signer Overrides
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      signerName: data.signerName || null,
      signerTitle: data.signerTitle || null,
      signerImageUrl: data.signerImageUrl || null,

      // SEO
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      noIndex: data.noIndex ?? false,
      noFollow: data.noFollow ?? false,

      // Internal
      internalNotes: data.internalNotes || null,

      updatedAt: new Date().toISOString(),
      migratedFromCfs: true,
    };

    if (!matched) {
      grantRecord.createdAt = new Date().toISOString();
      grantRecord.stageEnteredAt = new Date().toISOString();
    }

    await setDoc(doc(db, 'grant_records', targetId), grantRecord, { merge: true });
    console.log(`  ✓ Successfully wrote to 'grant_records/${targetId}'`);
    migratedCount++;
  }

  console.log(`\n======================================================`);
  console.log(`Migration Complete: Migrated ${migratedCount} records to 'grant_records'.`);
  console.log(`The old 'case_for_support' collection can now be safely dropped from Firebase Console.`);
  console.log(`======================================================`);
}

migrate().catch(console.error);
