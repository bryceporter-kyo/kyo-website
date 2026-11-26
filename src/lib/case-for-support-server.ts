import { Grant } from './grants/types';

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
 * Fetch all published grants from grant_records collection via Firestore REST API (Server Component safe)
 */
export async function fetchPublishedGrantsServer(): Promise<Grant[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents:runQuery`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'grant_records' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'published' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
        },
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];

    const grants: Grant[] = data
      .filter((item: any) => item.document)
      .map((item: any) => decodeFirestoreDocument(item.document));

    return grants;
  } catch (error) {
    console.error('[CaseForSupportServer] Error fetching published grants:', error);
    return [];
  }
}

/**
 * Fetch a single grant by full or truncated UID from grant_records via Firestore REST API
 */
export async function fetchGrantByTruncatedUidServer(truncatedUid: string): Promise<Grant | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || !truncatedUid) return null;

  try {
    // Fast path: if full Firestore document ID is provided, fetch directly (O(1))
    if (truncatedUid.length >= 20) {
      const directUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/grant_records/${encodeURIComponent(truncatedUid)}`;
      const directRes = await fetch(directUrl, {
        next: { revalidate: 300 },
        headers: { 'Content-Type': 'application/json' },
      });
      if (directRes.ok) {
        const doc = await directRes.json();
        if (doc && doc.name) return decodeFirestoreDocument(doc) as Grant;
      }
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/grant_records`;
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
      if (id && id.startsWith(truncatedUid)) {
        return decodeFirestoreDocument(doc) as Grant;
      }
    }

    return null;
  } catch (error) {
    console.error('[CaseForSupportServer] Error fetching grant by truncated UID:', error);
    return null;
  }
}

/**
 * Fetch all board members from Firebase REST API (Server safe)
 */
export async function fetchBoardMembersServer(): Promise<any[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/board`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.documents || data.documents.length === 0) return [];

    const members = data.documents.map(decodeFirestoreDocument);
    // Sort by `order` field (ascending), fallback to name alphabetically
    return members.sort((a: any, b: any) => {
      const orderA = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999999;
      const orderB = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || '').localeCompare(b.name || '');
    });
  } catch (error) {
    console.error('[CaseForSupportServer] Error fetching board members:', error);
    return [];
  }
}

/**
 * Fetch governance documents from Firebase REST API (Server safe)
 */
export async function fetchGovernanceDocumentsServer(): Promise<any[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/legal-documents`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.documents || data.documents.length === 0) return [];

    return data.documents.map(decodeFirestoreDocument);
  } catch (error) {
    console.error('[CaseForSupportServer] Error fetching governance documents:', error);
    return [];
  }
}

