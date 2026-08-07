
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, getDocs, query, where, orderBy, writeBatch, updateDoc } from 'firebase/firestore';
import { FormProgram } from './registration-form';

const COLLECTION = 'registrationSubmissions';

export interface RegistrationSubmission {
  id?: string;
  program: FormProgram;
  formId: string;
  formTitle: string;
  answers: Record<string, any>;
  submittedAt: any;
  uid?: string; // Optional session UID to link partial saves
  status: 'draft' | 'new' | 'reviewed' | 'archived' | 'deleted';
}

const DRAFTS_COLLECTION = 'registrationDrafts';

/**
 * Save a form submission to Firestore.
 */
export async function saveRegistrationSubmission(
  submission: Omit<RegistrationSubmission, 'submittedAt' | 'status'>
): Promise<string> {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...submission,
    submittedAt: serverTimestamp(),
    status: 'new',
  });
  return docRef.id;
}

/**
 * Save a partial form draft using a session UID.
 */
export async function saveRegistrationDraft(
  uid: string,
  draft: Partial<RegistrationSubmission>
): Promise<void> {
  const draftRef = doc(db, DRAFTS_COLLECTION, uid);
  await setDoc(draftRef, {
    ...draft,
    updatedAt: serverTimestamp(),
    status: 'draft',
  }, { merge: true });
}

/**
 * Retrieve a partial form draft by its session UID.
 */
export async function getRegistrationDraft(
  uid: string
): Promise<Partial<RegistrationSubmission> | null> {
  const draftRef = doc(db, DRAFTS_COLLECTION, uid);
  const snap = await getDoc(draftRef);
  
  if (snap.exists()) {
    return snap.data() as Partial<RegistrationSubmission>;
  }
  return null;
}

/**
 * Retrieve all submissions for a program
 */
export async function getRegistrationSubmissions(program: FormProgram): Promise<RegistrationSubmission[]> {
  const ref = collection(db, COLLECTION);
  const q = query(ref, where("program", "==", program), orderBy("submittedAt", "desc"));
  const snap = await getDocs(q);
  
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      submittedAt: data.submittedAt?.toDate?.()?.toISOString() || null
    } as any;
  });
}

/**
 * Batch import submissions
 */
export async function batchImportSubmissions(submissions: Omit<RegistrationSubmission, 'submittedAt' | 'status'>[]): Promise<number> {
  const batch = writeBatch(db);
  const ref = collection(db, COLLECTION);
  
  for (const sub of submissions) {
    const docRef = doc(ref);
    batch.set(docRef, {
      ...sub,
      submittedAt: serverTimestamp(),
      status: 'new',
    });
  }
  
  await batch.commit();
  return submissions.length;
}

/**
 * Soft delete or update the status of a submission
 */
export async function updateRegistrationSubmissionStatus(id: string, status: RegistrationSubmission['status']): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { status });
}
