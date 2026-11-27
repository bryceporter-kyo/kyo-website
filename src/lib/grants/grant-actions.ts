import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Grant, Funder, QuestionItem, BudgetRow, BudgetHeaders, GrantSubmission } from './types';
import { getGrantsSettings, saveGrant, logGrantAudit } from './grants-service';
import { sanitizeSlug } from './constants';

const GRANTS_COLL = 'grant_records';

/**
 * Fetch a single grant by ID
 */
export async function getGrantById(id: string): Promise<Grant | null> {
  try {
    const docRef = doc(db, GRANTS_COLL, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Grant;
    }
  } catch (e) {
    console.error('[GrantDetails] Fetch error:', e);
  }
  return null;
}

/**
 * Delete a grant
 */
export async function deleteGrant(
  grantId: string, 
  user?: { id: string; email: string; name?: string }
): Promise<void> {
  const docRef = doc(db, GRANTS_COLL, grantId);
  const snap = await getDoc(docRef);
  const oldData = snap.exists() ? snap.data() : null;

  await deleteDoc(docRef);

  if (user && oldData) {
    await logGrantAudit({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      action: 'DELETE_GRANT',
      oldValue: oldData,
      summary: `Deleted grant record for ${oldData.funderName}`,
    });
  }
}

/**
 * Google Apps Script Trigger Wrapper
 * Calls the deployed Apps Script Web App securely using the configured shared secret.
 */
export async function callGrantsAppsScript(action: string, payload: Record<string, any> = {}): Promise<any> {
  const settings = await getGrantsSettings();
  if (!settings.appsScriptWebAppUrl) {
    throw new Error('Google Apps Script Web App URL is not configured in Settings.');
  }

  const res = await fetch(settings.appsScriptWebAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action,
      secret: settings.appsScriptSecret,
      ...payload,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Apps Script action "${action}" failed.`);
  }
  return data;
}

/**
 * Stage Transition Logic with Automated File Creation & Folder Renaming (Spec §4 & §6)
 */
export async function transitionGrantStage(
  grant: Grant,
  newStage: string,
  user?: { id: string; email: string; name?: string }
): Promise<Grant> {
  const settings = await getGrantsSettings();
  const stageConfig = settings.stages.find(s => s.name === newStage);

  const updates: Partial<Grant> = {
    stage: newStage,
    stageEnteredAt: new Date().toISOString(),
  };

  // Check if moving to a terminal/cancelled stage -> auto unpublish & wipe calendar
  if (stageConfig?.isTerminal || newStage.startsWith('Cancelled') || newStage === 'Archived') {
    if (grant.published) {
      updates.published = false;
    }
  }

  // 1. File & Folder Auto-Creation Check
  // Spec: Moving to Writing LOI, LOI Submitted, Drafting, or In Review automatically creates folder if missing
  const isFileCreationStage = stageConfig?.createsFiles || 
    ['Writing LOI', 'LOI Submitted', 'Drafting', 'In Review (internal)'].includes(newStage);

  if (isFileCreationStage && settings.appsScriptWebAppUrl) {
    try {
      // Create folder if missing
      if (!grant.driveFolderId) {
        const folderRes = await callGrantsAppsScript('createGrantFolder', {
          funderName: grant.funderName,
          year: grant.startedAt ? new Date(grant.startedAt).getFullYear().toString() : new Date().getFullYear().toString(),
        });
        updates.driveFolderId = folderRes.folderId;
        updates.driveFolderUrl = folderRes.folderUrl;
      }

      const activeFolderId = updates.driveFolderId || grant.driveFolderId;

      // Stage-specific document creation
      if (newStage === 'Writing LOI' && !grant.loiLetterDocId && settings.letterheadTemplateDocId) {
        const docRes = await callGrantsAppsScript('createLoiLetter', {
          folderId: activeFolderId,
          funderName: grant.funderName,
        });
        updates.loiLetterDocId = docRes.docId;
      }

      if (newStage === 'Drafting' && !grant.qaDocId) {
        const qaRes = await callGrantsAppsScript('createQaDoc', {
          folderId: activeFolderId,
          funderName: grant.funderName,
          programName: grant.programName,
          deadline: grant.applicationDeadline || 'TBD',
          questions: grant.questions || [],
        });
        updates.qaDocId = qaRes.docId;
      }
    } catch (err) {
      console.error('[StageTransition] Drive file creation warning:', err);
      // Non-fatal: stage update still saves
    }
  }

  // 2. Folder Renaming Rule (Spec §6)
  // When submission date or status changes, rename folder if one exists
  const activeFolderId = updates.driveFolderId || grant.driveFolderId;
  if (activeFolderId && settings.appsScriptWebAppUrl) {
    try {
      const submissionDateStr = grant.submittedOn 
        ? grant.submittedOn.replace(/-/g, '') 
        : '';
      const folderStatus = stageConfig?.folderStatusText || '';
      
      await callGrantsAppsScript('renameGrantFolder', {
        folderId: activeFolderId,
        funderName: grant.funderName,
        submissionDate: submissionDateStr,
        folderStatusText: folderStatus,
      });
    } catch (err) {
      console.error('[StageTransition] Folder rename warning:', err);
    }
  }

  // Save changes to Firestore
  const updatedGrant = await saveGrant({ id: grant.id, ...updates }, user);
  return updatedGrant;
}

/**
 * Pull and sync questions/answers from Google Doc into Grant
 */
export async function pullAnswersFromGoogleDoc(
  grant: Grant,
  docId: string,
  user?: { id: string; email: string; name?: string }
): Promise<{ success: boolean; rowsUpdated: number; rows: any[] }> {
  const result = await callGrantsAppsScript('pullQaDoc', { docId });

  if (result.success && result.rows) {
    const updatedQuestions = result.rows.map((r: any, idx: number) => ({
      id: `q_${idx + 1}`,
      question: r.question,
      answerHtml: r.answerText,
      order: idx + 1,
      publicVisible: true,
    }));

    const syncedAt = result.syncedAt || new Date().toISOString();

    await saveGrant({
      id: grant.id,
      questions: updatedQuestions,
      qaLastSyncedAt: syncedAt,
    }, user);

    if (user) {
      await logGrantAudit({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'PULL_QA_DOC',
        summary: `Pulled ${updatedQuestions.length} questions & answers from Google Doc (${docId}). Overwrote stored answers.`,
      });
    }

    return { success: true, rowsUpdated: updatedQuestions.length, rows: result.rows };
  }

  return { success: false, rowsUpdated: 0, rows: [] };
}

/**
 * Push questions from website to Google Doc (Website -> Doc)
 * Updates Column A and appends new questions, preserving existing Column B draft answers.
 */
export async function pushQuestionsToGoogleDoc(
  grant: Grant,
  docId: string,
  user?: { id: string; email: string; name?: string }
): Promise<{ success: boolean; rowsPushed: number }> {
  const questions = grant.questions || [];
  const result = await callGrantsAppsScript('pushQaDoc', { docId, questions });

  if (result.success) {
    const syncedAt = result.syncedAt || new Date().toISOString();

    await saveGrant({
      id: grant.id,
      qaLastSyncedAt: syncedAt,
    }, user);

    if (user) {
      await logGrantAudit({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'PUSH_QA_DOC',
        summary: `Pushed ${questions.length} questions to Google Doc (${docId}). Preserved draft answers.`,
      });
    }

    return { success: true, rowsPushed: questions.length };
  }

  return { success: false, rowsPushed: 0 };
}

/**
 * Clone Grant for New Current Year / Reapply (Spec §4 & §8)
 */
export async function cloneGrantForNewCycle(
  oldGrant: Grant,
  options: { prefillAnswers: boolean },
  user?: { id: string; email: string; name?: string }
): Promise<Grant> {
  const currentYear = new Date().getFullYear();

  const clonedQuestions = (oldGrant.questions || []).map(q => ({
    ...q,
    answerHtml: options.prefillAnswers ? q.answerHtml : '',
  }));

  const newGrantData: Partial<Grant> = {
    funderId: oldGrant.funderId,
    funderName: oldGrant.funderName,
    programId: oldGrant.programId,
    programName: oldGrant.programName,
    stage: 'Qualified: To Apply',
    amountRequested: oldGrant.amountRequested || 0,
    kyoPrograms: oldGrant.kyoPrograms || ['Upbeat!'],
    assignedOwnerEmail: oldGrant.assignedOwnerEmail || user?.email || '',
    assignedOwnerName: oldGrant.assignedOwnerName || user?.name || '',
    questions: clonedQuestions,
    clonedFromGrantId: oldGrant.id,
    clonedYear: currentYear,
    slug: `${oldGrant.slug}-${currentYear}-${Math.random().toString(36).substring(2, 6)}`,
    published: false,
    // Drive files start empty until triggered
    driveFolderId: undefined,
    driveFolderUrl: undefined,
    loiLetterDocId: undefined,
    qaDocId: undefined,
  };

  const newGrant = await saveGrant(newGrantData, user);

  // Update old grant lineage
  await saveGrant({
    id: oldGrant.id,
    renewalUsed: true,
    returnToUsed: true,
  });

  if (user) {
    await logGrantAudit({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      action: 'CLONE_GRANT',
      summary: `Cloned grant from ${oldGrant.id} into new application ${newGrant.id} (Year: ${currentYear})`,
    });
  }

  return newGrant;
}

/**
 * Step 4: Generate Google Doc + Google Sheet from imported CSV data.
 */
export async function generateWorkspaceFromCsvs(
  grant: Grant,
  questions: QuestionItem[],
  budgetRows: BudgetRow[],
  budgetHeaders: BudgetHeaders,
  user?: { id: string; email: string; name?: string }
): Promise<{ qaDocId: string; budgetSheetId: string; budgetSheetUrl: string }> {
  let folderId = grant.driveFolderId;
  if (!folderId) {
    const folderRes = await callGrantsAppsScript('createGrantFolder', {
      funderName: grant.funderName,
      year: grant.startedAt ? new Date(grant.startedAt).getFullYear().toString() : new Date().getFullYear().toString(),
    });
    folderId = folderRes.folderId;
    await saveGrant({ id: grant.id, driveFolderId: folderId, driveFolderUrl: folderRes.folderUrl }, user);
  }

  const [qaRes, sheetRes] = await Promise.all([
    callGrantsAppsScript('createQaDocFromQuestions', {
      folderId,
      funderName: grant.funderName,
      programName: grant.programName,
      deadline: grant.applicationDeadline || 'TBD',
      questions,
      narrative: {
        customLetterBody: grant.customLetterBody || [],
        impactStatement: grant.impactStatement || '',
        valuesAlignment: grant.valuesAlignment || '',
        communityNeed: grant.communityNeed || '',
        programDescription: grant.programDescription || '',
        organizationalCapacity: grant.organizationalCapacity || '',
        reportingPlan: grant.reportingPlan || '',
        recognitionPlan: grant.recognitionPlan || '',
      },
    }),
    callGrantsAppsScript('createBudgetSheet', {
      folderId,
      funderName: grant.funderName,
      headers: budgetHeaders,
      rows: budgetRows,
    }),
  ]);

  await saveGrant({
    id: grant.id,
    questions,
    budgetHeaders,
    budgetBreakdown: budgetRows,
    qaDocId: qaRes.docId,
    budgetSheetId: sheetRes.sheetId,
    budgetSheetUrl: sheetRes.sheetUrl,
  }, user);

  if (user) {
    await logGrantAudit({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      grantId: grant.id,
      action: 'GENERATE_WORKSPACE',
      summary: `Generated Google Doc (${questions.length} questions) and Budget Sheet (${budgetHeaders.length} columns) from CSV import.`,
    });
  }

  return { qaDocId: qaRes.docId, budgetSheetId: sheetRes.sheetId, budgetSheetUrl: sheetRes.sheetUrl };
}

/**
 * Step 6: Unified Sync with Portal — pulls both Google Doc (Q&A) and Google Sheet (Budget).
 */
export async function syncWithPortal(
  grant: Grant,
  user?: { id: string; email: string; name?: string }
): Promise<{ questionsSynced: number; budgetRowsSynced: number }> {
  const now = new Date().toISOString();
  const updates: Partial<Grant> = {};
  let questionsSynced = 0;
  let budgetRowsSynced = 0;

  if (grant.qaDocId) {
    const qaResult = await callGrantsAppsScript('pullQaDoc', { docId: grant.qaDocId });
    if (qaResult.success && qaResult.rows) {
      updates.questions = qaResult.rows.map((r: any, idx: number) => ({
        ...(grant.questions?.[idx] || {}),
        id: `q_${idx + 1}`,
        question: r.question,
        answerHtml: r.answerText,
        order: idx + 1,
        publicVisible: grant.questions?.[idx]?.publicVisible ?? true,
      }));
      updates.qaLastSyncedAt = now;
      questionsSynced = updates.questions?.length ?? 0;
    }
    if (qaResult.narrative && typeof qaResult.narrative === 'object') {
      const n = qaResult.narrative;
      if (n.customLetterBody !== undefined) updates.customLetterBody = n.customLetterBody;
      if (n.impactStatement !== undefined) updates.impactStatement = n.impactStatement;
      if (n.valuesAlignment !== undefined) updates.valuesAlignment = n.valuesAlignment;
      if (n.communityNeed !== undefined) updates.communityNeed = n.communityNeed;
      if (n.programDescription !== undefined) updates.programDescription = n.programDescription;
      if (n.organizationalCapacity !== undefined) updates.organizationalCapacity = n.organizationalCapacity;
      if (n.reportingPlan !== undefined) updates.reportingPlan = n.reportingPlan;
      if (n.recognitionPlan !== undefined) updates.recognitionPlan = n.recognitionPlan;
    }
  }

  if (grant.budgetSheetId) {
    const sheetResult = await callGrantsAppsScript('pullBudgetSheet', { sheetId: grant.budgetSheetId });
    if (sheetResult.success) {
      updates.budgetHeaders = sheetResult.headers;
      updates.budgetBreakdown = sheetResult.rows;
      updates.budgetLastSyncedAt = now;
      budgetRowsSynced = (sheetResult.rows || []).length;
    }
  }

  await saveGrant({ id: grant.id, ...updates }, user);

  if (user) {
    await logGrantAudit({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      grantId: grant.id,
      action: 'SYNC_WITH_PORTAL',
      summary: `Synced ${questionsSynced} Q&A rows and ${budgetRowsSynced} budget rows from Google Workspace.`,
    });
  }

  return { questionsSynced, budgetRowsSynced };
}

/**
 * Step 8: Record submission details and optionally upload evidence PDF to Drive.
 */
export async function recordSubmission(
  grant: Grant,
  submission: GrantSubmission,
  evidencePdfBase64?: string,
  evidenceFileName?: string,
  user?: { id: string; email: string; name?: string }
): Promise<Grant> {
  const finalSubmission: GrantSubmission = { ...submission };

  if (evidencePdfBase64 && evidenceFileName && grant.driveFolderId) {
    const uploadRes = await callGrantsAppsScript('saveSubmissionEvidence', {
      folderId: grant.driveFolderId,
      pdfBase64: evidencePdfBase64,
      fileName: evidenceFileName,
    });
    finalSubmission.evidenceFileId = uploadRes.fileId;
    finalSubmission.evidenceFileUrl = uploadRes.fileUrl;
    finalSubmission.evidenceFileName = evidenceFileName;
  }

  finalSubmission.recordedAt = new Date().toISOString();
  finalSubmission.recordedBy = user?.email;

  const updates: Partial<Grant> = {
    submission: finalSubmission,
    ...(submission.submittedOn ? { submittedOn: submission.submittedOn } : {}),
    ...(submission.isComplete && grant.stage !== 'Submitted: Pending Decision'
      ? { stage: 'Submitted: Pending Decision', stageEnteredAt: new Date().toISOString() }
      : {}),
  };

  if (user) {
    await logGrantAudit({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      grantId: grant.id,
      action: 'RECORD_SUBMISSION',
      summary: `Submission recorded. Method: ${submission.submissionMethod || 'Not specified'}${evidenceFileName ? `. Evidence: ${evidenceFileName}` : ''}.`,
    });
  }

  return saveGrant({ id: grant.id, ...updates }, user);
}
