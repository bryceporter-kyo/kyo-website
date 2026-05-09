
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FormProgram } from './registration-form';

const COLLECTION = 'registrationSubmissions';

export interface RegistrationSubmission {
  program: FormProgram;
  formId: string;
  formTitle: string;
  answers: Record<string, any>;
  submittedAt: any;
  status: 'new' | 'reviewed' | 'archived';
}

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
