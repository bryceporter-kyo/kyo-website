import { GrantCase } from './case-for-support';

/**
 * Decodes Firestore REST field types into standard JavaScript values.
 */
function decodeFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(decodeFirestoreValue);
  }
  if ('mapValue' in val) {
    const fields = val.mapValue.fields || {};
    const res: any = {};
    for (const key of Object.keys(fields)) {
      res[key] = decodeFirestoreValue(fields[key]);
    }
    return res;
  }
  return val;
}

function decodeFirestoreDocument(doc: any): any {
  const fields = doc.fields || {};
  const decoded: any = {
    id: doc.name.split('/').pop(),
  };
  for (const key of Object.keys(fields)) {
    decoded[key] = decodeFirestoreValue(fields[key]);
  }
  return decoded;
}

/**
 * Fetch all published grants via Firestore REST API (Server Component safe)
 */
export async function fetchPublishedGrantsServer(): Promise<GrantCase[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/grants`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.documents || data.documents.length === 0) return [];

    const grants: GrantCase[] = data.documents
      .map(decodeFirestoreDocument)
      .filter((g: any) => g.published === true);

    return grants;
  } catch (error) {
    console.error('[CaseForSupportServer] Error fetching published grants:', error);
    return [];
  }
}

/**
 * Fetch a single grant by truncated UID via Firestore REST API
 */
export async function fetchGrantByTruncatedUidServer(truncatedUid: string): Promise<GrantCase | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || !truncatedUid) return null;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/grants`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.documents || data.documents.length === 0) return null;

    for (const doc of data.documents) {
      const id = doc.name.split('/').pop();
      if (id && id.substring(0, 6) === truncatedUid) {
        return decodeFirestoreDocument(doc) as GrantCase;
      }
    }

    return null;
  } catch (error) {
    console.error('[CaseForSupportServer] Error fetching grant by truncated UID:', error);
    return null;
  }
}
