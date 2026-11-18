/**
 * KYO Grants Google Apps Script Template
 * This script runs in Google Apps Script under the KYO Google account.
 * It manages Drive year/grant folders, doc copying from templates, and Calendar events.
 */

export interface GenerateGrantsAppsScriptOptions {
  grantApplicationsFolderId?: string;
  letterheadTemplateDocId?: string;
  qaTemplateDocId?: string;
  grantsCalendarId?: string;
  secret?: string;
  websiteUrl?: string;
}

export function generateGrantsAppsScriptCode(options: GenerateGrantsAppsScriptOptions = {}): string {
  const {
    grantApplicationsFolderId = '',
    letterheadTemplateDocId = '',
    qaTemplateDocId = '',
    grantsCalendarId = '',
    secret = '',
    websiteUrl = 'https://thekyo.ca',
  } = options;

  return `/**
 * ============================================================================
 * KYO GRANTS MANAGEMENT APPS SCRIPT
 * ============================================================================
 * Handles Google Drive folder structuring, template copying, and Calendar events
 * for the KYO Grants Portal.
 *
 * Configuration values below are injected automatically from your Grants Settings:
 */
const CONFIG = {
  SHARED_SECRET: "${secret}",
  ROOT_FOLDER_ID: "${grantApplicationsFolderId}",
  LETTERHEAD_DOC_ID: "${letterheadTemplateDocId}",
  QA_DOC_ID: "${qaTemplateDocId}",
  CALENDAR_ID: "${grantsCalendarId}",
  WEBSITE_URL: "${websiteUrl}",
};

/**
 * Main Webhook Entrypoint for POST requests
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Empty request body" }, 400);
    }

    const payload = JSON.parse(e.postData.contents);

    // 1. Authenticate Request
    if (CONFIG.SHARED_SECRET && payload.secret !== CONFIG.SHARED_SECRET) {
      return jsonResponse({ success: false, error: "Unauthorized: Invalid secret" }, 401);
    }

    const action = payload.action;

    // 2. Route Actions
    switch (action) {
      case "ping":
        return handlePing(payload);

      case "createGrantFolder":
        return handleCreateGrantFolder(payload);

      case "renameGrantFolder":
        return handleRenameGrantFolder(payload);

      case "createLoiLetter":
        return handleCreateLoiLetter(payload);

      case "createQaDoc":
        return handleCreateQaDoc(payload);

      case "pullQaDoc":
        return handlePullQaDoc(payload);

      case "syncCalendarEvent":
        return handleSyncCalendarEvent(payload);

      case "deleteCalendarEvent":
        return handleDeleteCalendarEvent(payload);

      default:
        return jsonResponse({ success: false, error: "Unknown action: " + action }, 400);
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString(), stack: err.stack }, 500);
  }
}

/**
 * Handle Ping / Handshake Verification
 */
function handlePing(payload) {
  return jsonResponse({
    success: true,
    message: "Handshake verified successfully with KYO Grants Apps Script",
    timestamp: new Date().toISOString(),
    configStatus: {
      hasRootFolder: Boolean(CONFIG.ROOT_FOLDER_ID),
      hasCalendar: Boolean(CONFIG.CALENDAR_ID),
      hasLetterhead: Boolean(CONFIG.LETTERHEAD_DOC_ID),
    }
  });
}

/**
 * Get or Create Year Folder inside Root
 */
function getOrCreateYearFolder(yearStr) {
  const root = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  const folders = root.getFoldersByName(yearStr);
  if (folders.hasNext()) {
    return folders.next();
  }
  return root.createFolder(yearStr);
}

/**
 * Create Grant Folder: "[Funder]: : "
 */
function handleCreateGrantFolder(payload) {
  const funderName = payload.funderName;
  const year = payload.year || new Date().getFullYear().toString();

  const yearFolder = getOrCreateYearFolder(year);
  const folderName = funderName + ": : ";
  const grantFolder = yearFolder.createFolder(folderName);

  return jsonResponse({
    success: true,
    folderId: grantFolder.getId(),
    folderUrl: grantFolder.getUrl(),
    folderName: folderName,
  });
}

/**
 * Rename Grant Folder: "[Funder]: [MMDDYYYY]: [Status]"
 */
function handleRenameGrantFolder(payload) {
  const folderId = payload.folderId;
  const funderName = payload.funderName;
  const dateStr = payload.submissionDate || ""; // MMDDYYYY or blank
  const statusStr = payload.folderStatusText || ""; // e.g. "Closed: Won" or blank

  const folder = DriveApp.getFolderById(folderId);
  const newName = funderName + ": " + dateStr + ": " + statusStr;
  folder.setName(newName);

  return jsonResponse({
    success: true,
    folderId: folder.getId(),
    folderName: newName,
  });
}

/**
 * Create LOI Letter from Letterhead Template
 */
function handleCreateLoiLetter(payload) {
  const folderId = payload.folderId;
  const funderName = payload.funderName;
  const dateStr = Utilities.formatDate(new Date(), "GMT-5", "MMddyyyy");

  const folder = DriveApp.getFolderById(folderId);
  const template = DriveApp.getFileById(CONFIG.LETTERHEAD_DOC_ID);

  const docName = funderName + ": LOI Letter: " + dateStr;
  const copy = template.makeCopy(docName, folder);

  return jsonResponse({
    success: true,
    docId: copy.getId(),
    docUrl: copy.getUrl(),
    docName: docName,
  });
}

/**
 * Create Application Q&A Doc with questions table
 */
function handleCreateQaDoc(payload) {
  const folderId = payload.folderId;
  const funderName = payload.funderName;
  const programName = payload.programName || "General Fund";
  const deadline = payload.deadline || "TBD";
  const questions = payload.questions || [];
  const dateStr = Utilities.formatDate(new Date(), "GMT-5", "MMddyyyy");

  const folder = DriveApp.getFolderById(folderId);
  const docName = funderName + ": Application Q&A: " + dateStr;
  const doc = DocumentApp.create(docName);
  const file = DriveApp.getFileById(doc.getId());
  file.moveTo(folder);

  const body = doc.getBody();
  body.appendParagraph("KYO Application Q&A: " + funderName + " (" + programName + ")").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph("Application Deadline: " + deadline).setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph("");

  // Create two-column table
  const tableData = [["Question", "Draft Answer"]];
  questions.forEach(function(q) {
    const qLabel = q.charLimit ? q.question + " (Limit: " + q.charLimit + " chars)" : q.question;
    tableData.push([qLabel, ""]);
  });

  const table = body.appendTable(tableData);
  table.getRow(0).editAsText().setBold(true);

  doc.saveAndClose();

  return jsonResponse({
    success: true,
    docId: doc.getId(),
    docUrl: doc.getUrl(),
    docName: docName,
  });
}

/**
 * Pull Answers from Q&A Doc
 */
function handlePullQaDoc(payload) {
  const docId = payload.docId;
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  const tables = body.getTables();

  if (tables.length === 0) {
    return jsonResponse({ success: false, error: "No question table found in doc." }, 400);
  }

  const table = tables[0];
  const numRows = table.getNumRows();
  const pulledData = [];

  for (let i = 1; i < numRows; i++) {
    const row = table.getRow(i);
    const qText = row.getCell(0).getText().trim();
    const aText = row.getCell(1).getText().trim();
    pulledData.push({
      rowIndex: i,
      question: qText,
      answerText: aText,
    });
  }

  return jsonResponse({
    success: true,
    rowCount: pulledData.length,
    rows: pulledData,
  });
}

/**
 * Create or Update Calendar Event
 */
function handleSyncCalendarEvent(payload) {
  if (!CONFIG.CALENDAR_ID) {
    return jsonResponse({ success: false, error: "CALENDAR_ID not configured" }, 400);
  }

  const cal = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  const title = payload.title;
  const dateStr = payload.date; // YYYY-MM-DD
  const description = payload.description || "";
  const ownerEmail = payload.ownerEmail;
  const existingEventId = payload.eventId;

  const eventDate = new Date(dateStr + "T09:00:00");

  let event;
  if (existingEventId) {
    try {
      event = cal.getEventById(existingEventId);
    } catch (e) {
      // Event not found, will create new
    }
  }

  if (event) {
    event.setTitle(title);
    event.setTime(eventDate, new Date(eventDate.getTime() + 60 * 60 * 1000));
    event.setDescription(description);
  } else {
    event = cal.createEvent(title, eventDate, new Date(eventDate.getTime() + 60 * 60 * 1000), {
      description: description,
      guests: ownerEmail ? ownerEmail : undefined,
      sendInvites: Boolean(ownerEmail),
    });
    // Add day-of reminder (10 minutes before)
    event.addPopupReminder(10);
  }

  return jsonResponse({
    success: true,
    eventId: event.getId(),
  });
}

/**
 * Delete Calendar Event
 */
function handleDeleteCalendarEvent(payload) {
  if (!CONFIG.CALENDAR_ID || !payload.eventId) {
    return jsonResponse({ success: true, deleted: false });
  }

  const cal = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  try {
    const event = cal.getEventById(payload.eventId);
    if (event) {
      event.deleteEvent();
    }
  } catch (e) {
    // Ignore if already deleted
  }

  return jsonResponse({ success: true, deleted: true });
}

/**
 * Helper: Output JSON
 */
function jsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
}
