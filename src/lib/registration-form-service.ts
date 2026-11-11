
import { db, sanitizeForFirestore } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  RegistrationFormConfig,
  FormProgram,
  DEFAULT_ORCHESTRAS_FORM,
  DEFAULT_UPBEAT_FORM,
} from './registration-form';
import { updateButtonLinkInFirebase, fetchButtonsFromFirebase, saveButtonToFirebase } from './buttons';
import { updateLinkInFirebase } from './links';

const COLLECTION = 'registrationForms';

const DEFAULT_FORMS: Record<FormProgram, RegistrationFormConfig> = {
  orchestras: DEFAULT_ORCHESTRAS_FORM,
  upbeat: DEFAULT_UPBEAT_FORM,
};

/**
 * Trigger Next.js revalidation for pages containing registration buttons and forms
 */
export async function revalidateRegistrationPages(): Promise<void> {
  try {
    const paths = [
      '/',
      '/programs/orchestras',
      '/programs/upbeat',
      '/programs/lessons',
      '/programs/registration/orchestras',
      '/programs/registration/upbeat',
      '/support-us/volunteer',
      '/sitemap.xml',
    ];

    if (typeof window !== 'undefined') {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: 'kyo-revalidate-secret-token-2026',
          paths,
        }),
      });
    }
  } catch (err) {
    console.warn('[RegistrationFormService] Revalidation call failed:', err);
  }
}

/**
 * Synchronize registration buttons and external link definitions
 * when a form's registrationType (online_form vs google_form) changes.
 */
export async function syncRegistrationButtons(config: RegistrationFormConfig): Promise<void> {
  try {
    const isGoogleForm = config.registrationType === 'google_form';
    const program = config.id;
    const defaultGoogleUrl = DEFAULT_FORMS[program].googleFormUrl || '';
    const googleUrl = (config.googleFormUrl && config.googleFormUrl.trim()) ? config.googleFormUrl.trim() : defaultGoogleUrl;

    // 1. Update the corresponding external link in links collection if URL provided
    const linkId = program === 'upbeat' ? 'register-upbeat' : 'register';
    if (googleUrl) {
      try {
        await updateLinkInFirebase(linkId, { url: googleUrl });
      } catch (e) {
        console.warn(`[RegistrationFormService] Could not update link ${linkId}:`, e);
      }
    }

    // 2. Determine target button link
    const newLink = isGoogleForm
      ? { type: 'external' as const, value: linkId }
      : { type: 'internal' as const, value: `/programs/registration/${program}` };

    // Button IDs affected by this program
    const targetButtonIds = program === 'upbeat'
      ? ['hero-register-upbeat', 'upbeat-enroll']
      : ['hero-register-orchestra', 'home-financial-aid-register', 'orchestras-register', 'orchestras-audition', 'lessons-register-main', 'lessons-register-secondary'];

    const allButtons = await fetchButtonsFromFirebase();
    for (const bId of targetButtonIds) {
      const existing = allButtons.find(b => b.id === bId);
      if (existing) {
        try {
          await updateButtonLinkInFirebase(bId, newLink);
        } catch {
          await saveButtonToFirebase({ ...existing, link: newLink });
        }
      }
    }
  } catch (err) {
    console.error(`[RegistrationFormService] Error syncing registration buttons for ${config.id}:`, err);
  }
}

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
 * Fetch registration form config via REST API (safe for server components / build time)
 */
export async function getRegistrationFormServer(
  program: FormProgram
): Promise<RegistrationFormConfig> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return DEFAULT_FORMS[program];
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/${COLLECTION}/${program}`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return DEFAULT_FORMS[program];
    }

    const data = await res.json();
    if (!data.fields) {
      return DEFAULT_FORMS[program];
    }

    const fields = data.fields;
    return {
      id: program,
      title: fields.title?.stringValue || DEFAULT_FORMS[program].title,
      description: fields.description?.stringValue || DEFAULT_FORMS[program].description,
      isOpen: fields.isOpen?.booleanValue ?? DEFAULT_FORMS[program].isOpen,
      registrationType: (fields.registrationType?.stringValue as any) || DEFAULT_FORMS[program].registrationType || 'online_form',
      googleFormUrl: fields.googleFormUrl?.stringValue || DEFAULT_FORMS[program].googleFormUrl,
      closedMessage: fields.closedMessage?.stringValue || DEFAULT_FORMS[program].closedMessage,
      questions: [],
    };
  } catch (err) {
    console.error(`[RegistrationFormService] Server fetch failed for ${program}:`, err);
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
  
  // Firestore crashes if an object contains `undefined` values. Strip them out.
  const cleanData = sanitizeForFirestore(data);

  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy ?? null,
  });

  // Sync buttons and trigger revalidation so HTML builds immediately reflect the new link
  await syncRegistrationButtons(config);
  await revalidateRegistrationPages();
}
