/**
 * KYO Grants Google Apps Script Template
 * This script runs in Google Apps Script under the KYO Google account.
 * It manages Drive year/grant folders, doc copying from templates, and Calendar events.
 */

export const EXPECTED_APPS_SCRIPT_VERSION = "2.1.0";

export interface GenerateGrantsAppsScriptOptions {
  grantApplicationsFolderId?: string;
  letterheadTemplateDocId?: string;
  qaTemplateDocId?: string;
  grantsCalendarId?: string;
  secret?: string;
  boardMinutesFolderId?: string;
  boardMinutesSecret?: string;
  websiteUrl?: string;
}

export function generateGrantsAppsScriptCode(options: GenerateGrantsAppsScriptOptions = {}): string {
  const {
    grantApplicationsFolderId = '',
    letterheadTemplateDocId = '',
    qaTemplateDocId = '',
    grantsCalendarId = '',
    secret = '',
    boardMinutesFolderId = '',
    boardMinutesSecret = '',
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
  BOARD_MINUTES_FOLDER_ID: "${boardMinutesFolderId}",
  BOARD_MINUTES_SECRET: "${boardMinutesSecret}",
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

    const action = payload.action;

    // 1. Authenticate Request (Board Minutes uses its own secret if configured)
    const expectedSecret = action === "saveBoardMinutesPdf" && CONFIG.BOARD_MINUTES_SECRET
      ? CONFIG.BOARD_MINUTES_SECRET
      : CONFIG.SHARED_SECRET;
    if (expectedSecret && payload.secret !== expectedSecret) {
      return jsonResponse({ success: false, error: "Unauthorized: Invalid secret" }, 401);
    }

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

      case "createQaDocFromQuestions":
        return handleCreateQaDocFromQuestions(payload);

      case "createBudgetSheet":
        return handleCreateBudgetSheet(payload);

      case "pullQaDoc":
        return handlePullQaDoc(payload);

      case "pullBudgetSheet":
        return handlePullBudgetSheet(payload);

      case "pushQaDoc":
        return handlePushQaDoc(payload);

      case "saveSubmissionEvidence":
        return handleSaveSubmissionEvidence(payload);

      case "syncCalendarEvent":
        return handleSyncCalendarEvent(payload);

      case "deleteCalendarEvent":
        return handleDeleteCalendarEvent(payload);

      case "saveBoardMinutesPdf":
        return handleSaveBoardMinutesPdf(payload);

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
  let hasRootFolder = false;
  if (CONFIG.ROOT_FOLDER_ID) {
    try {
      hasRootFolder = Boolean(DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID));
    } catch (e) {}
  }
  return jsonResponse({
    success: true,
    version: "${EXPECTED_APPS_SCRIPT_VERSION}",
    message: "Handshake verified successfully with KYO Grants Apps Script",
    timestamp: new Date().toISOString(),
    configStatus: {
      hasRootFolder: hasRootFolder,
      hasCalendar: Boolean(CONFIG.CALENDAR_ID),
      hasLetterhead: Boolean(CONFIG.LETTERHEAD_DOC_ID),
      hasQaTemplate: Boolean(CONFIG.QA_DOC_ID),
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
    const numCells = row.getNumCells();
    pulledData.push({
      rowIndex: i,
      question: numCells > 0 ? row.getCell(0).getText().trim() : "",
      description: numCells > 1 ? row.getCell(1).getText().trim() : "",
      questionType: numCells > 2 ? row.getCell(2).getText().trim() : "",
      answerText: numCells > 3 ? row.getCell(3).getText().trim() : (numCells > 1 ? row.getCell(1).getText().trim() : ""),
    });
  }

  // Pull optional Case for Support Narrative table (Table 1)
  const narrative = {};
  if (tables.length > 1) {
    const nTable = tables[1];
    for (let j = 1; j < nTable.getNumRows(); j++) {
      const nRow = nTable.getRow(j);
      if (nRow.getNumCells() < 2) continue;
      const label = nRow.getCell(0).getText().trim().toLowerCase();
      const val = nRow.getCell(1).getText().trim();
      if (label.indexOf("letter") !== -1) narrative.customLetterBody = val ? val.split(/\\n\\s*\\n/).map(function(s) { return s.trim(); }).filter(Boolean) : [];
      else if (label.indexOf("impact") !== -1) narrative.impactStatement = val;
      else if (label.indexOf("align") !== -1) narrative.valuesAlignment = val;
      else if (label.indexOf("community need") !== -1) narrative.communityNeed = val;
      else if (label.indexOf("program description") !== -1) narrative.programDescription = val;
      else if (label.indexOf("capacity") !== -1) narrative.organizationalCapacity = val;
      else if (label.indexOf("reporting") !== -1) narrative.reportingPlan = val;
      else if (label.indexOf("recognition") !== -1) narrative.recognitionPlan = val;
    }
  }

  return jsonResponse({
    success: true,
    rowCount: pulledData.length,
    rows: pulledData,
    narrative: narrative,
    syncedAt: new Date().toISOString(),
  });
}

/**
 * Create Application Q&A Doc from CSV-imported questions (4-column table)
 */
function handleCreateQaDocFromQuestions(payload) {
  const folder = DriveApp.getFolderById(payload.folderId);
  const dateStr = Utilities.formatDate(new Date(), "GMT-5", "MMddyyyy");
  const docName = payload.funderName + ": Application Q&A: " + dateStr;

  const doc = DocumentApp.create(docName);
  DriveApp.getFileById(doc.getId()).moveTo(folder);
  const body = doc.getBody();

  body.appendParagraph("KYO Application Q&A: " + payload.funderName).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph("Deadline: " + (payload.deadline || "TBD")).setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph("");

  const tableData = [["Question", "Description / Notes", "Type / Options", "Draft Answer"]];
  (payload.questions || []).forEach(function(q) {
    const qLabel = q.charLimit ? q.question + " (Limit: " + q.charLimit + ")" : q.question;
    tableData.push([
      qLabel,
      q.description || "",
      q.questionType ? q.questionType + (q.optionSelected ? ": " + q.optionSelected : "") : "",
      q.answerHtml || ""
    ]);
  });

  const table = body.appendTable(tableData);
  table.getRow(0).editAsText().setBold(true);

  body.appendParagraph("");
  body.appendParagraph("Case for Support Narrative").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  const n = payload.narrative || {};
  const narrativeRows = [
    ["Section", "Content"],
    ["Letter to Organization", Array.isArray(n.customLetterBody) ? n.customLetterBody.join("\\n\\n") : (n.customLetterBody || "")],
    ["Short Impact Statement", n.impactStatement || ""],
    ["Why KYO Aligns with Funder", n.valuesAlignment || ""],
    ["Community Need", n.communityNeed || ""],
    ["Program Description", n.programDescription || ""],
    ["Organizational Capacity", n.organizationalCapacity || ""],
    ["Reporting Plan", n.reportingPlan || ""],
    ["Recognition Plan", n.recognitionPlan || ""],
  ];
  const nTable = body.appendTable(narrativeRows);
  nTable.getRow(0).editAsText().setBold(true);

  doc.saveAndClose();

  return jsonResponse({
    success: true,
    docId: doc.getId(),
    docUrl: doc.getUrl(),
    docName: docName,
  });
}

/**
 * Create Budget Google Sheet verbatim from CSV headers & rows (no formulas)
 */
function handleCreateBudgetSheet(payload) {
  const headers = payload.headers || ["Item", "Amount"];
  const rows = payload.rows || [];
  const folder = DriveApp.getFolderById(payload.folderId);
  const dateStr = Utilities.formatDate(new Date(), "GMT-5", "MMddyyyy");
  const sheetName = payload.funderName + ": Budget: " + dateStr;

  const ss = SpreadsheetApp.create(sheetName);
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  const sheet = ss.getActiveSheet().setName("Budget");

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");

  if (rows.length > 0) {
    const data = rows.map(function(row) {
      return headers.map(function(h) { return row[h] || ""; });
    });
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }

  ss.setSpreadsheetTimeZone("America/Toronto");
  return jsonResponse({
    success: true,
    sheetId: ss.getId(),
    sheetUrl: ss.getUrl(),
    sheetName: sheetName,
  });
}

/**
 * Pull Budget Google Sheet using getDisplayValues() (captures computed values, not formulas)
 */
function handlePullBudgetSheet(payload) {
  const ss = SpreadsheetApp.openById(payload.sheetId);
  const sheet = ss.getActiveSheet();
  const values = sheet.getDataRange().getDisplayValues();

  if (!values || values.length < 2) {
    return jsonResponse({ success: true, headers: [], rows: [], rowCount: 0 });
  }

  const headers = values[0].map(function(h) { return String(h).trim(); });
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const rowObj = {};
    let empty = true;
    headers.forEach(function(h, j) {
      const v = String(values[i][j] || "").trim();
      rowObj[h] = v;
      if (v) empty = false;
    });
    if (!empty) rows.push(rowObj);
  }

  return jsonResponse({
    success: true,
    headers: headers,
    rows: rows,
    rowCount: rows.length,
    syncedAt: new Date().toISOString(),
  });
}

/**
 * Save Submission Evidence PDF to the grant's Google Drive folder
 */
function handleSaveSubmissionEvidence(payload) {
  const folder = DriveApp.getFolderById(payload.folderId);
  const bytes = Utilities.base64Decode(payload.pdfBase64);
  const blob = Utilities.newBlob(bytes, "application/pdf", payload.fileName || "Submission-Evidence.pdf");

  const existing = folder.getFilesByName(blob.getName());
  while (existing.hasNext()) {
    existing.next().setTrashed(true);
  }

  const file = folder.createFile(blob);
  return jsonResponse({
    success: true,
    fileId: file.getId(),
    fileUrl: file.getUrl(),
  });
}

/**
 * Push Questions to Q&A Doc (Website -> Doc)
 * Updates questions in Column A, preserves existing draft answers in Column B,
 * and appends any newly added questions.
 */
function handlePushQaDoc(payload) {
  const docId = payload.docId;
  const questions = payload.questions || [];

  if (!docId) {
    return jsonResponse({ success: false, error: "Missing docId" }, 400);
  }

  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  const tables = body.getTables();

  let table;
  if (tables.length === 0) {
    // If no table exists, create one
    const tableData = [["Question", "Draft Answer"]];
    questions.forEach(function(q) {
      const qLabel = q.charLimit ? q.question + " (Limit: " + q.charLimit + " chars)" : q.question;
      tableData.push([qLabel, ""]);
    });
    table = body.appendTable(tableData);
    table.getRow(0).editAsText().setBold(true);
  } else {
    table = tables[0];
    const existingRowCount = table.getNumRows();

    // Map existing answers in Column B by index
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qLabel = q.charLimit ? q.question + " (Limit: " + q.charLimit + " chars)" : q.question;
      const targetRowIndex = i + 1; // row 0 is header

      if (targetRowIndex < existingRowCount) {
        // Update Column A, preserve Column B answer
        table.getRow(targetRowIndex).getCell(0).setText(qLabel);
      } else {
        // Append row
        const newRow = table.appendTableRow();
        newRow.appendTableCell(qLabel);
        newRow.appendTableCell("");
      }
    }
  }

  doc.saveAndClose();

  return jsonResponse({
    success: true,
    rowsPushed: questions.length,
    syncedAt: new Date().toISOString(),
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
 * Save Board Meeting Minutes PDF to Google Drive: <ROOT_FOLDER_ID>/Board Minutes/<year>/
 */
function handleSaveBoardMinutesPdf(payload) {
  if (!CONFIG.BOARD_MINUTES_FOLDER_ID) {
    return jsonResponse({ success: false, error: "BOARD_MINUTES_FOLDER_ID is not configured in Apps Script." }, 400);
  }
  const bmRoot = DriveApp.getFolderById(CONFIG.BOARD_MINUTES_FOLDER_ID);

  const yearStr = String(payload.year || new Date().getFullYear());
  const yrFolders = bmRoot.getFoldersByName(yearStr);
  const yrFolder = yrFolders.hasNext() ? yrFolders.next() : bmRoot.createFolder(yearStr);

  const bytes = Utilities.base64Decode(payload.pdfBase64);
  const blob = Utilities.newBlob(bytes, "application/pdf", payload.fileName || "Board-Minutes.pdf");

  // Replace existing file with same name if present
  const existing = yrFolder.getFilesByName(blob.getName());
  while (existing.hasNext()) {
    existing.next().setTrashed(true);
  }

  const file = yrFolder.createFile(blob);
  return jsonResponse({
    success: true,
    fileId: file.getId(),
    fileUrl: file.getUrl(),
  });
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

/**
 * Template-Bound Google Apps Script (for Google Docs & Google Sheets templates)
 * Copy-pasteable into Extensions > Apps Script on any template document or sheet.
 * Adds a "KYO Grants -> Sync Back to KYO Website" menu item with zero manual edits.
 */
export function generateTemplateBoundAppsScriptCode(options: {
  secret?: string;
  websiteUrl?: string;
} = {}): string {
  const {
    secret = '',
    websiteUrl = 'https://thekyo.ca',
  } = options;

  return `/**
 * ============================================================================
 * KYO GRANTS - TEMPLATE SYNC SCRIPT (GOOGLE DOCS & GOOGLE SHEETS)
 * ============================================================================
 * Paste this into Extensions > Apps Script in your template Doc or Sheet.
 * No edits required — your secret and website URL are already configured.
 */
const SYNC_CONFIG = {
  SHARED_SECRET: "${secret}",
  WEBSITE_URL: "${websiteUrl}",
};

/**
 * Automatically adds the "KYO Grants" menu when the Doc or Sheet is opened.
 */
function onOpen() {
  var ui = null;
  try {
    ui = DocumentApp.getUi();
  } catch (e) {
    try {
      ui = SpreadsheetApp.getUi();
    } catch (e2) {}
  }
  if (ui) {
    ui.createMenu("KYO Grants")
      .addItem("Sync Back to KYO Website", "syncToKyoWebsite")
      .addToUi();
  }
}

/**
 * Syncs this Document (Q&A table) or Spreadsheet (Budget) back to the KYO Grants Portal.
 */
function syncToKyoWebsite() {
  var isDoc = false;
  var doc = null;
  var ss = null;

  try {
    doc = DocumentApp.getActiveDocument();
    if (doc) isDoc = true;
  } catch (e) {}

  if (!isDoc) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {}
  }

  var ui = isDoc ? DocumentApp.getUi() : SpreadsheetApp.getUi();

  if (!SYNC_CONFIG.SHARED_SECRET) {
    ui.alert("Configuration Error", "Shared secret is missing. Please re-copy this script from /grants/admin.", ui.ButtonSet.OK);
    return;
  }

  var payload = null;

  if (isDoc && doc) {
    var tables = doc.getBody().getTables();
    if (!tables || tables.length === 0) {
      ui.alert("No Table Found", "Could not find a Q&A table in this document.", ui.ButtonSet.OK);
      return;
    }

    // Use the first table with at least 2 columns
    var qaTable = null;
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].getNumRows() > 0 && tables[t].getRow(0).getNumCells() >= 2) {
        qaTable = tables[t];
        break;
      }
    }

    if (!qaTable) {
      ui.alert("Invalid Table", "Expected a table with at least 2 columns (Question | Answer).", ui.ButtonSet.OK);
      return;
    }

    var questions = [];
    for (var r = 1; r < qaTable.getNumRows(); r++) {
      var row = qaTable.getRow(r);
      var qText = row.getCell(0).getText().trim();
      var aText = row.getCell(1).getText().trim();
      if (qText) {
        questions.push({
          question: qText,
          answerHtml: aText,
        });
      }
    }

    payload = {
      secret: SYNC_CONFIG.SHARED_SECRET,
      docId: doc.getId(),
      type: "doc",
      questions: questions,
    };
  } else if (ss) {
    var sheet = ss.getActiveSheet();
    var values = sheet.getDataRange().getDisplayValues();
    if (!values || values.length < 2) {
      ui.alert("No Data Found", "Expected a header row and at least one budget row.", ui.ButtonSet.OK);
      return;
    }

    var headers = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
    var itemCol = headers.findIndex(function (h) { return h.indexOf("item") !== -1 || h.indexOf("description") !== -1 || h.indexOf("name") !== -1; });
    var amountCol = headers.findIndex(function (h) { return h.indexOf("amount") !== -1 || h.indexOf("cost") !== -1 || h.indexOf("total") !== -1; });
    var catCol = headers.findIndex(function (h) { return h === "category" || h.indexOf("cat") !== -1; });
    var subCol = headers.findIndex(function (h) { return h.indexOf("sub") !== -1; });

    if (itemCol === -1) itemCol = 0;
    if (amountCol === -1) amountCol = 1;

    var budgetBreakdown = [];
    for (var i = 1; i < values.length; i++) {
      var rowVals = values[i];
      var itemVal = String(rowVals[itemCol] || "").trim();
      var amountVal = String(rowVals[amountCol] || "").trim();
      if (!itemVal && !amountVal) continue;

      var entry = {
        item: itemVal,
        amount: amountVal,
      };
      if (catCol !== -1 && rowVals[catCol]) entry.category = String(rowVals[catCol]).trim();
      if (subCol !== -1 && rowVals[subCol]) entry.subcategory = String(rowVals[subCol]).trim();
      budgetBreakdown.push(entry);
    }

    payload = {
      secret: SYNC_CONFIG.SHARED_SECRET,
      docId: ss.getId(),
      type: "sheet",
      budgetBreakdown: budgetBreakdown,
    };
  } else {
    ui.alert("Unsupported File", "Please run this script from a Google Doc or Google Sheet.", ui.ButtonSet.OK);
    return;
  }

  try {
    var response = UrlFetchApp.fetch(SYNC_CONFIG.WEBSITE_URL + "/api/grants/sync-from-doc", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    var status = response.getResponseCode();
    var resJson = JSON.parse(response.getContentText() || "{}");

    if (status >= 200 && status < 300 && resJson.success) {
      ui.alert("Sync Complete", "Successfully synced " + resJson.syncedCount + " item(s) back to the KYO Grants Portal.", ui.ButtonSet.OK);
    } else {
      ui.alert("Sync Failed (" + status + ")", resJson.error || "Unknown error occurred.", ui.ButtonSet.OK);
    }
  } catch (err) {
    ui.alert("Connection Error", "Could not reach KYO Website: " + err.toString(), ui.ButtonSet.OK);
  }
}
`;
}
