import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getGrantPublicUrl } from '@/lib/grants/constants';

/**
 * Two-Way Sync Webhook: Google Doc / Google Sheet -> KYO Grants Portal
 * Called by the template-bound Google Apps Script ("KYO Grants -> Sync Back to KYO Website").
 */
export async function POST(request: NextRequest) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Firebase project ID not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.docId || !body.type) {
      return NextResponse.json({ success: false, error: 'Missing required fields: docId, type' }, { status: 400 });
    }

    const { secret, docId, type, questions, budgetBreakdown } = body;

    // 1. Verify shared secret against grants_settings/config (or env var)
    const settingsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/grants_settings/config`;
    const settingsRes = await fetch(settingsUrl, { cache: 'no-store' });
    let expectedSecret = process.env.GRANTS_DOC_SYNC_SECRET || '';
    if (settingsRes.ok) {
      const settingsDoc = await settingsRes.json();
      const firestoreSecret = settingsDoc?.fields?.appsScriptSecret?.stringValue;
      if (firestoreSecret) expectedSecret = firestoreSecret;
    }

    if (!expectedSecret || !secret || secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing secret' }, { status: 401 });
    }

    // 2. Find matching grant in grant_records where qaDocId == docId
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents:runQuery`;
    const queryRes = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'grant_records' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'qaDocId' },
              op: 'EQUAL',
              value: { stringValue: docId },
            },
          },
          limit: 1,
        },
      }),
    });

    if (!queryRes.ok) {
      return NextResponse.json({ success: false, error: 'Failed to query grant_records' }, { status: 500 });
    }

    const queryData = await queryRes.json();
    const matchedDoc = Array.isArray(queryData) ? queryData.find((d: any) => d.document)?.document : null;

    if (!matchedDoc) {
      return NextResponse.json(
        { success: false, error: `No grant found linked to document ID: ${docId}` },
        { status: 404 }
      );
    }

    const grantId = matchedDoc.name.split('/').pop();
    const now = new Date().toISOString();
    const updateFields: Record<string, any> = {
      updatedAt: { stringValue: now },
      qaLastSyncedAt: { stringValue: now },
    };
    const updateMask: string[] = ['updatedAt', 'qaLastSyncedAt'];
    let syncedCount = 0;

    // 3. Build Firestore REST update payload
    if (type === 'doc' && Array.isArray(questions)) {
      const existingQuestions = (matchedDoc.fields?.questions?.arrayValue?.values || []).map((v: any) => {
        const f = v.mapValue?.fields || {};
        return {
          question: f.question?.stringValue || '',
          publicVisible: f.publicVisible?.booleanValue ?? true,
          charLimit: f.charLimit?.integerValue ? Number(f.charLimit.integerValue) : undefined,
        };
      });

      const firestoreQuestions = questions
        .filter((q: any) => q && String(q.question || '').trim())
        .map((q: any, idx: number) => {
          const qText = String(q.question).trim();
          const aText = String(q.answerHtml || q.answer || '').trim();
          const existing = existingQuestions.find(
            (eq: any) => eq.question.toLowerCase() === qText.toLowerCase()
          );

          const fields: Record<string, any> = {
            id: { stringValue: `q_${idx + 1}` },
            question: { stringValue: qText },
            answerHtml: { stringValue: aText },
            order: { integerValue: String(idx + 1) },
            publicVisible: { booleanValue: existing ? existing.publicVisible : true },
          };
          if (existing?.charLimit) {
            fields.charLimit = { integerValue: String(existing.charLimit) };
          }
          return { mapValue: { fields } };
        });

      updateFields.questions = { arrayValue: { values: firestoreQuestions } };
      updateMask.push('questions');
      syncedCount = firestoreQuestions.length;
    } else if (type === 'sheet' && Array.isArray(budgetBreakdown)) {
      const firestoreBudget = budgetBreakdown
        .filter((b: any) => b && Object.values(b).some(v => String(v ?? '').trim()))
        .map((b: any) => ({
          mapValue: {
            fields: Object.fromEntries(
              Object.entries(b).map(([k, v]) => [k, { stringValue: String(v ?? '').trim() }])
            ),
          },
        }));

      updateFields.budgetBreakdown = { arrayValue: { values: firestoreBudget } };
      updateFields.budgetLastSyncedAt = { stringValue: now };
      updateMask.push('budgetBreakdown', 'budgetLastSyncedAt');

      if (Array.isArray(body.budgetHeaders)) {
        updateFields.budgetHeaders = {
          arrayValue: { values: body.budgetHeaders.map((h: string) => ({ stringValue: String(h) })) },
        };
        updateMask.push('budgetHeaders');
      }
      syncedCount = firestoreBudget.length;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid sync payload for type: ' + type }, { status: 400 });
    }

    // 4. Patch grant document in Firestore
    const maskParams = updateMask.map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
    const patchUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/grant_records/${grantId}?${maskParams}`;
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: updateFields }),
    });

    if (!patchRes.ok) {
      const errText = await patchRes.text();
      return NextResponse.json({ success: false, error: `Firestore update failed: ${errText}` }, { status: 500 });
    }

    // 5. Revalidate public Case for Support page if published
    const isPublished = matchedDoc.fields?.published?.booleanValue === true;
    if (isPublished) {
      const publicUrl = getGrantPublicUrl({
        id: grantId,
        funderName: matchedDoc.fields?.funderName?.stringValue,
        slug: matchedDoc.fields?.slug?.stringValue,
        grantCycleYear: matchedDoc.fields?.grantCycleYear?.stringValue,
        startedAt: matchedDoc.fields?.startedAt?.stringValue,
        createdAt: matchedDoc.fields?.createdAt?.stringValue,
        programSlug: matchedDoc.fields?.programSlug?.stringValue,
      });
      revalidatePath('/support-us/case-for-support', 'page');
      revalidatePath(publicUrl, 'page');
    }

    return NextResponse.json({
      success: true,
      grantId,
      type,
      syncedCount,
      timestamp: now,
    });
  } catch (err: any) {
    console.error('[SyncFromDocAPI] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
