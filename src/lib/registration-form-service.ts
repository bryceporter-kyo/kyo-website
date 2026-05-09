
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  RegistrationFormConfig,
  FormProgram,
  DEFAULT_ORCHESTRAS_FORM,
  DEFAULT_UPBEAT_FORM,
} from './registration-form';

const COLLECTION = 'registrationForms';

const DEFAULT_FORMS: Record<FormProgram, RegistrationFormConfig> = {
  orchestras: DEFAULT_ORCHESTRAS_FORM,
  upbeat: DEFAULT_UPBEAT_FORM,
};

/**
 * Fetch a registration form config from Firestore.
 * Falls back to the built-in default if no document exists yet.
 */
export async function getRegistrationForm(
  program: FormProgram
): Promise<RegistrationFormConfig> {
  try {
    const ref = doc(db, COLLECTION, program);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: program, ...(snap.data() as Omit<RegistrationFormConfig, 'id'>) };
    }
    console.log(`[RegistrationForms] No Firestore doc for "${program}", using default.`);
    return DEFAULT_FORMS[program];
  } catch (err) {
    console.error(`[RegistrationForms] Error fetching form "${program}":`, err);
    return DEFAULT_FORMS[program];
  }
}

/**
 * Save (create or overwrite) a registration form config to Firestore.
 */
export async function saveRegistrationForm(
  config: RegistrationFormConfig,
  updatedBy?: string
): Promise<void> {
  const { id, ...data } = config;
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy ?? null,
  });
}
