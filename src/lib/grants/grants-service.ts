import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, addDoc 
} from 'firebase/firestore';
import { 
  GrantsSettings, Funder, Grant, GrantAuditLogEntry 
} from './types';
export { getGrantById } from './grant-actions';
import { 
  DEFAULT_GRANTS_SETTINGS, computeSortName, sanitizeSlug, 
  normalizeFunderName, extractDomain, levenshteinDistance,
  getGrantPublicUrl
} from './constants';

async function triggerGrantRevalidation(grant: Partial<Grant>) {
  try {
    const paths = ['/support-us/case-for-support'];
    if (grant.id) {
      paths.push(getGrantPublicUrl(grant));
    }
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: 'kyo-revalidate-secret-token-2026',
        paths,
      }),
    });
  } catch (err) {
    console.warn('[GrantService] Revalidation notice:', err);
  }
}

const GRANTS_SETTINGS_COLL = 'grants_settings';
const GRANTS_SETTINGS_DOC = 'config';
const FUNDERS_COLL = 'grant_funders';
const GRANTS_COLL = 'grant_records';
const AUDIT_COLL = 'grant_audit_logs';

/**
 * Fetch Grants Settings from Firestore, or initialize with defaults
 */
export async function getGrantsSettings(): Promise<GrantsSettings> {
  try {
    const docRef = doc(db, GRANTS_SETTINGS_COLL, GRANTS_SETTINGS_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_GRANTS_SETTINGS, ...snap.data() } as GrantsSettings;
    }
  } catch (e) {
    console.error('[GrantsSettings] Fetch error, returning defaults:', e);
  }
  return DEFAULT_GRANTS_SETTINGS;
}

/**
 * Save Grants Settings to Firestore
 */
export async function saveGrantsSettings(settings: Partial<GrantsSettings>): Promise<void> {
  const docRef = doc(db, GRANTS_SETTINGS_COLL, GRANTS_SETTINGS_DOC);
  await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
}

/**
 * Append to Grant / Funder Audit Log
 */
export async function logGrantAudit(entry: Omit<GrantAuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const collRef = collection(db, AUDIT_COLL);
    await addDoc(collRef, {
      ...entry,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[GrantAudit] Failed to log audit event:', e);
  }
}

/**
 * Fetch Audit Logs
 */
export async function fetchGrantAuditLogs(grantId?: string): Promise<GrantAuditLogEntry[]> {
  try {
    const collRef = collection(db, AUDIT_COLL);
    let q = query(collRef, orderBy('timestamp', 'desc'), limit(100));
    if (grantId) {
      q = query(collRef, where('grantId', '==', grantId), orderBy('timestamp', 'desc'), limit(100));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as GrantAuditLogEntry));
  } catch (e) {
    console.error('[GrantAudit] Fetch error:', e);
    return [];
  }
}

/**
 * Duplicate Detection for Funders
 * Checks normalized name, Levenshtein edit distance, and exact website domain
 */
export async function checkFunderDuplicate(
  name: string,
  website?: string,
  excludeId?: string
): Promise<{ isDuplicate: boolean; matchType?: 'exact_name' | 'similar_name' | 'domain'; matchedFunder?: Funder }> {
  const allFunders = await fetchAllFunders();
  const normInputName = normalizeFunderName(name);
  const inputDomain = extractDomain(website);

  for (const funder of allFunders) {
    if (excludeId && funder.id === excludeId) continue;

    const normFunderName = normalizeFunderName(funder.name);

    // 1. Exact normalized name
    if (normFunderName === normInputName) {
      return { isDuplicate: true, matchType: 'exact_name', matchedFunder: funder };
    }

    // 2. Exact domain
    if (inputDomain && funder.website && extractDomain(funder.website) === inputDomain) {
      return { isDuplicate: true, matchType: 'domain', matchedFunder: funder };
    }

    // 3. Edit distance check (threshold <= 3 for names >= 5 chars)
    if (normInputName.length >= 5 && normFunderName.length >= 5) {
      const dist = levenshteinDistance(normInputName, normFunderName);
      if (dist <= 3) {
        return { isDuplicate: true, matchType: 'similar_name', matchedFunder: funder };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Fetch all Funders
 */
export async function fetchAllFunders(): Promise<Funder[]> {
  try {
    const collRef = collection(db, FUNDERS_COLL);
    const snap = await getDocs(collRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Funder));
  } catch (e) {
    console.error('[Funders] Fetch error:', e);
    return [];
  }
}

/**
 * Fetch a single Funder by ID
 */
export async function getFunderById(id: string): Promise<Funder | null> {
  try {
    const docRef = doc(db, FUNDERS_COLL, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Funder;
    }
  } catch (e) {
    console.error('[Funders] Fetch single error:', e);
  }
  return null;
}

/**
 * Create or Update a Funder
 */
export async function saveFunder(
  funder: Partial<Funder>, 
  user?: { id: string; email: string; name?: string }
): Promise<Funder> {
  const collRef = collection(db, FUNDERS_COLL);
  const now = new Date().toISOString();

  const settings = await getGrantsSettings();
  const sortName = funder.name ? computeSortName(funder.name, settings.leadingWords) : funder.sortName || '';
  const slug = funder.slug || (funder.name ? sanitizeSlug(funder.name) : '');

  if (funder.id) {
    const docRef = doc(db, FUNDERS_COLL, funder.id);
    const oldSnap = await getDoc(docRef);
    const oldData = oldSnap.exists() ? oldSnap.data() : null;

    const dataToSave = {
      ...funder,
      sortName,
      slug,
      updatedAt: now,
    };
    await updateDoc(docRef, dataToSave as any);

    if (user) {
      await logGrantAudit({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'UPDATE_FUNDER',
        oldValue: oldData,
        newValue: dataToSave,
        summary: `Updated funder: ${funder.name}`,
      });
    }

    return { id: funder.id, ...dataToSave } as Funder;
  } else {
    // New Funder (default program created automatically if none specified)
    const initialPrograms = (funder.programs && funder.programs.length > 0)
      ? funder.programs
      : [{ id: 'prog_default', name: 'General Fund' }];

    const dataToSave: Omit<Funder, 'id'> = {
      name: funder.name || '',
      sortName,
      slug,
      type: funder.type || 'Private foundation',
      geoScope: funder.geoScope || 'Local',
      focusAreas: funder.focusAreas || [],
      city: funder.city || '',
      province: funder.province || 'Ontario',
      country: funder.country || 'Canada',
      website: funder.website || '',
      otherLinks: funder.otherLinks || [],
      contacts: funder.contacts || [],
      eligibilityNotes: funder.eligibilityNotes || '',
      triageStatus: funder.triageStatus || 'unreviewed',
      rejectionReason: funder.rejectionReason || '',
      programs: initialPrograms,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collRef, dataToSave);

    if (user) {
      await logGrantAudit({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'CREATE_FUNDER',
        newValue: { id: docRef.id, ...dataToSave },
        summary: `Created funder: ${funder.name} (${dataToSave.triageStatus})`,
      });
    }

    return { id: docRef.id, ...dataToSave } as Funder;
  }
}

/**
 * Fetch all Grants
 */
export async function fetchAllGrants(): Promise<Grant[]> {
  try {
    const collRef = collection(db, GRANTS_COLL);
    const snap = await getDocs(collRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Grant));
  } catch (e) {
    console.error('[Grants] Fetch error:', e);
    return [];
  }
}

/**
 * Save Grant (create or update)
 */
export async function saveGrant(
  grant: Partial<Grant>, 
  user?: { id: string; email: string; name?: string }
): Promise<Grant> {
  const collRef = collection(db, GRANTS_COLL);
  const now = new Date().toISOString();

  if (grant.id) {
    const docRef = doc(db, GRANTS_COLL, grant.id);
    const oldSnap = await getDoc(docRef);
    const oldData = oldSnap.exists() ? oldSnap.data() : null;

    const dataToSave = {
      ...grant,
      updatedAt: now,
    };
    await updateDoc(docRef, dataToSave as any);

    if (user) {
      await logGrantAudit({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'UPDATE_GRANT',
        oldValue: oldData,
        newValue: dataToSave,
        summary: `Updated grant for funder: ${grant.funderName || grant.funderId}`,
      });
    }

    triggerGrantRevalidation({ id: grant.id, ...dataToSave });

    return { id: grant.id, ...dataToSave } as Grant;
  } else {
    const dataToSave: Omit<Grant, 'id'> = {
      funderId: grant.funderId || '',
      funderName: grant.funderName || '',
      programId: grant.programId || 'prog_default',
      programName: grant.programName || 'General Fund',
      stage: grant.stage || 'Prospect',
      stageEnteredAt: now,
      assignedOwnerEmail: grant.assignedOwnerEmail || user?.email || '',
      assignedOwnerName: grant.assignedOwnerName || user?.name || '',
      kyoPrograms: grant.kyoPrograms || ['Upbeat!'],
      slug: grant.slug || sanitizeSlug(grant.funderName || 'grant'),
      published: false,
      amountRequested: grant.amountRequested || 0,
      createdAt: now,
      updatedAt: now,
      ...grant,
    };

    const docRef = await addDoc(collRef, dataToSave);

    if (user) {
      await logGrantAudit({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'CREATE_GRANT',
        newValue: { id: docRef.id, ...dataToSave },
        summary: `Created grant for ${grant.funderName} (${dataToSave.stage})`,
      });
    }

    triggerGrantRevalidation({ id: docRef.id, ...dataToSave });

    return { id: docRef.id, ...dataToSave } as Grant;
  }
}
