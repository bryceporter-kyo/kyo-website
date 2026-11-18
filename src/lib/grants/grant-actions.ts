import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Grant, Funder } from './types';
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

    await saveGrant({
      id: grant.id,
      questions: updatedQuestions,
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
    slug: `${oldGrant.slug}-${currentYear}`,
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
