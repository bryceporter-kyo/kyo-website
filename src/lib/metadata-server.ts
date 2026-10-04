export type PageMetadata = {
  path: string;
  title: string;
  description: string;
  index: boolean;
  follow: boolean;
  ogDescription?: string;
  aiSummary?: string;
  keywords?: string;
};

/**
 * Fetch page metadata from Firestore REST API (Server Component safe)
 */
export async function fetchPageMetadataServer(path: string): Promise<PageMetadata | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  const docId = path === "/" ? "root" : path.replace(/\//g, '_');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/page-metadata/${docId}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.fields) return null;

    return {
      path,
      title: data.fields.title?.stringValue || "",
      description: data.fields.description?.stringValue || "",
      index: data.fields.index?.booleanValue ?? true,
      follow: data.fields.follow?.booleanValue ?? true,
      ogDescription: data.fields.ogDescription?.stringValue,
      aiSummary: data.fields.aiSummary?.stringValue,
      keywords: data.fields.keywords?.stringValue,
    };
  } catch (error) {
    console.error(`[MetadataServer] Error fetching metadata for ${path}:`, error);
    return null;
  }
}

/**
 * Fetch all page metadata from Firestore REST API
 */
export async function fetchAllPageMetadataServer(): Promise<PageMetadata[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/page-metadata`;

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

    return data.documents.map((doc: any) => {
      const docName = doc.name.split('/').pop() || "";
      const path = docName === "root" ? "/" : docName.replace(/_/g, '/');
      const fields = doc.fields || {};
      return {
        path,
        title: fields.title?.stringValue || "",
        description: fields.description?.stringValue || "",
        index: fields.index?.booleanValue ?? true,
        follow: fields.follow?.booleanValue ?? true,
        ogDescription: fields.ogDescription?.stringValue,
        aiSummary: fields.aiSummary?.stringValue,
        keywords: fields.keywords?.stringValue,
      };
    });
  } catch (error) {
    console.error("[MetadataServer] Error fetching all metadata:", error);
    return [];
  }
}
