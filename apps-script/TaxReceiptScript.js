// ═══════════════════════════════════════════════════════════════════════════
// KYO CHARITABLE TAX RECEIPT AUTOMATION SCRIPT
// ═══════════════════════════════════════════════════════════════════════════
//
// INSTRUCTIONS FOR DEPLOYMENT:
// 1. Open your Google Doc Receipt Template.
// 2. Click Extensions -> Apps Script.
// 3. Paste this entire file into the Apps Script editor (replacing previous code).
// 4. Update the properties using setupProperties() or Project Settings -> Script Properties:
//    - TRACKING_SHEET_ID: The Google Sheet ID to log receipts (e.g. 1oMrFa1OgL6ghU3HlxeQv9QHPeOFqoYiWkQ9wazht3XI)
//    - TEMPLATE_DOC_ID:   The Google Doc Template ID (or leave blank to use the active doc)
//    - DRIVE_FOLDER_ID:   The Google Drive Folder ID to save generated receipts in
//    - SHARED_SECRET:     A secret string to authorize requests from your KYO website
// 5. Deploy as a Web App:
//    - Click "Deploy" -> "New deployment"
//    - Select type: "Web app"
//    - Description: "KYO Tax Receipt Webhook"
//    - Execute as: "Me"
//    - Who has access: "Anyone" (requests are authenticated with SHARED_SECRET)
//    - Click "Deploy" and authorize permissions.
// 6. Copy the "Web app URL" and paste it into the KYO Admin Panel under
//    Admin -> Donations & Tax Receipts, along with the same SHARED_SECRET.
//
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Run this function once from the Apps Script editor to initialize your properties.
 * You can also set/update these anytime under Project Settings -> Script Properties.
 */
function setupProperties() {
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    'TRACKING_SHEET_ID': '1oMrFa1OgL6ghU3HlxeQv9QHPeOFqoYiWkQ9wazht3XI',
    'TEMPLATE_DOC_ID':   '', // Leave blank if bound to the template doc, or enter ID
    'DRIVE_FOLDER_ID':   '', // Enter root Google Drive folder ID for receipts
    'SHARED_SECRET':     'CHANGE_ME_TO_A_SECURE_SECRET_STRING'
  });
  Logger.log('Default properties set successfully.');
}

function getSettings() {
  const props = PropertiesService.getScriptProperties();
  return {
    trackingSheetId: props.getProperty('TRACKING_SHEET_ID') || '1oMrFa1OgL6ghU3HlxeQv9QHPeOFqoYiWkQ9wazht3XI',
    templateDocId:   props.getProperty('TEMPLATE_DOC_ID') || '',
    driveFolderId:   props.getProperty('DRIVE_FOLDER_ID') || '',
    secret:          props.getProperty('SHARED_SECRET') || ''
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK ENTRY POINT (CALLED FROM KYO WEBSITE ON SUCCESSFUL DONATION)
// ─────────────────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOutput({ error: 'No POST data received' }, 400);
    }

    const params = JSON.parse(e.postData.contents);
    const settings = getSettings();

    // Verify shared secret authentication
    if (settings.secret && params.secret !== settings.secret) {
      return jsonOutput({ error: 'Unauthorized: Invalid secret' }, 401);
    }

    // Format date as MM/DD/YYYY if given as YYYY-MM-DD
    let donDate = params.donationDate || '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(donDate)) {
      const parts = donDate.split('-');
      donDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
    }

    // Handle action: 'log_only' (used for monthly recurring donations pending 12-month verification)
    if (params.action === 'log_only') {
      const annualVal = params.assumedAnnualAmount || (parseFloat(params.amount || '0') * 12).toFixed(2);
      const noteText = params.notes || `Monthly Support ($${params.amount}/mo - Assumed 12-Mo Annual Total: $${annualVal} CAD - Verification Required)`;
      logToSheet({
        donorName:    params.donorName || 'Generous Donor',
        donorAddress: params.donorAddress || 'N/A',
        amount:       annualVal,
        advantage:    '0.00',
        eligible:     annualVal
      }, donDate || formatTodayDate(), noteText, settings.trackingSheetId);

      return jsonOutput({ 
        status: 'logged_only', 
        message: 'Monthly donation logged with assumed 12-month annual total. Receipt generation withheld until verified.' 
      }, 200);
    }

    const data = {
      donDate:        donDate || formatTodayDate(),
      donorName:      params.donorName || 'Generous Donor',
      donorAddress:   params.donorAddress || 'N/A',
      donationType:   'Cash & Liquid Assets',
      amount:         parseFloat(params.amount || '0').toFixed(2),
      advantage:      '0.00',
      eligible:       parseFloat(params.amount || '0').toFixed(2),
      sendPdf:        true,
      recipientEmail: params.donorEmail || ''
    };

    const result = processReceiptFromWeb(data, settings);
    return jsonOutput(result, 200);

  } catch (err) {
    console.error('Error processing web receipt:', err);
    return jsonOutput({ error: err.message || err.toString() }, 500);
  }
}

function jsonOutput(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatTodayDate() {
  const today = new Date();
  const mm = ('0' + (today.getMonth() + 1)).slice(-2);
  const dd = ('0' + today.getDate()).slice(-2);
  return `${mm}/${dd}/${today.getFullYear()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL DOCUMENT MENU (STILL WORKS DIRECTLY INSIDE GOOGLE DOCS)
// ─────────────────────────────────────────────────────────────────────────────

function onOpen() {
  DocumentApp.getUi()
    .createMenu('New Receipt')
    .addItem('Create a New Receipt', 'fillReceipt')
    .addToUi();
}

function fillReceipt() {
  const html = HtmlService.createHtmlOutput(getDialogHtml())
    .setWidth(420)
    .setHeight(620)
    .setTitle('Fill Donation Receipt');

  DocumentApp.getUi().showModalDialog(html, 'Fill Donation Receipt');
}

function getDialogHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; padding: 16px; background: #fff; }
    h2 { font-size: 15px; margin-bottom: 14px; color: #333; }
    label { display: block; margin-bottom: 3px; font-weight: bold; color: #444; }
    input, select { width: 100%; padding: 6px 8px; border: 1px solid #ccc; border-radius: 3px; margin-bottom: 4px; font-size: 13px; }
    input.error, select.error { border-color: #c0392b; }
    .err-msg { color: #c0392b; font-size: 11px; margin-bottom: 8px; min-height: 14px; }
    .field { margin-bottom: 10px; }
    .computed { background: #f4f4f4; color: #555; cursor: not-allowed; }
    .buttons { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
    button { padding: 7px 18px; border: none; border-radius: 3px; cursor: pointer; font-size: 13px; }
    #submitBtn { background: #1a73e8; color: #fff; }
    #submitBtn:hover:not(:disabled) { background: #1558b0; }
    #submitBtn:disabled { background: #aac4f0; cursor: not-allowed; }
    #cancelBtn { background: #e0e0e0; color: #333; }
    #cancelBtn:hover { background: #c0c0c0; }

    /* PDF email toggle section */
    .divider { border: none; border-top: 1px solid #e0e0e0; margin: 14px 0 12px; }
    .checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; cursor: pointer; }
    .checkbox-row input[type="checkbox"] {
      width: 15px; height: 15px; margin: 0; padding: 0;
      border: 1px solid #ccc; border-radius: 2px; cursor: pointer;
      accent-color: #1a73e8;
    }
    .checkbox-row span { font-weight: bold; color: #444; user-select: none; }
    #emailSection { display: none; margin-top: 2px; }
    #emailSection.visible { display: block; }
  </style>
</head>
<body>
  <h2>Fill Donation Receipt</h2>

  <div class="field">
    <label for="donDate">Donation Date (MM/DD/YYYY)</label>
    <input type="text" id="donDate" placeholder="e.g. 03/10/2026" maxlength="10">
    <div class="err-msg" id="donDateErr"></div>
  </div>

  <div class="field">
    <label for="donorName">Donor Full Name</label>
    <input type="text" id="donorName" placeholder="e.g. Jane Smith">
    <div class="err-msg" id="donorNameErr"></div>
  </div>

  <div class="field">
    <label for="donorAddress">Donor Address</label>
    <input type="text" id="donorAddress" placeholder="e.g. 123 Main St, City, Province, Postal">
    <div class="err-msg" id="donorAddressErr"></div>
  </div>

  <div class="field">
    <label for="donationType">Type of Donation</label>
    <select id="donationType">
      <option value="">-- Select a type --</option>
      <option value="Cash &amp; Liquid Assets">Cash &amp; Liquid Assets</option>
      <option value="Stocks &amp; Securities">Stocks &amp; Securities</option>
      <option value="Valuable Assets">Valuable Assets</option>
    </select>
    <div class="err-msg" id="donationTypeErr"></div>
  </div>

  <div class="field">
    <label for="amount">Donation Amount ($)</label>
    <input type="text" id="amount" placeholder="e.g. 100.00" oninput="recalcEligible()">
    <div class="err-msg" id="amountErr"></div>
  </div>

  <div class="field">
    <label for="advantage">Advantage Received ($) <span style="font-weight:normal;">(enter 0 if none)</span></label>
    <input type="text" id="advantage" placeholder="e.g. 0" oninput="recalcEligible()">
    <div class="err-msg" id="advantageErr"></div>
  </div>

  <div class="field">
    <label for="eligible">Eligible Amount ($) <span style="font-weight:normal;">(auto-calculated)</span></label>
    <input type="text" id="eligible" class="computed" readonly tabindex="-1">
    <div class="err-msg"></div>
  </div>

  <hr class="divider">

  <!-- PDF email toggle -->
  <label class="checkbox-row" for="sendPdf">
    <input type="checkbox" id="sendPdf" onchange="toggleEmailSection()">
    <span>Send receipt as PDF attachment</span>
  </label>

  <div id="emailSection">
    <div class="field">
      <label for="recipientEmail">Recipient Email Address</label>
      <input type="email" id="recipientEmail" placeholder="e.g. donor@example.com">
      <div class="err-msg" id="recipientEmailErr"></div>
    </div>
  </div>

  <div class="buttons">
    <button id="cancelBtn" onclick="google.script.host.close()">Cancel</button>
    <button id="submitBtn" onclick="submitForm()">Create Receipt</button>
  </div>

  <script>
    const parseAmount = (str) => parseFloat(str.replace(/[^0-9.-]/g, ''));

    function toggleEmailSection() {
      const checked = document.getElementById('sendPdf').checked;
      document.getElementById('emailSection').classList.toggle('visible', checked);
    }

    function setError(fieldId, msg) {
      const errEl   = document.getElementById(fieldId + 'Err');
      const inputEl = document.getElementById(fieldId);
      if (errEl)   errEl.textContent = msg;
      if (inputEl) inputEl.classList.toggle('error', !!msg);
    }

    function clearErrors() {
      ['donDate', 'donorName', 'donorAddress', 'donationType', 'amount', 'advantage', 'recipientEmail']
        .forEach(id => setError(id, ''));
    }

    function isValidDate(val) {
      if (!/^\\d{2}\\/\\d{2}\\/\\d{4}$/.test(val)) return false;
      const [mm, dd, yyyy] = val.split('/').map(Number);
      if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900 || yyyy > 2100) return false;
      const d = new Date(yyyy, mm - 1, dd);
      return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
    }

    function isValidEmail(val) {
      return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(val);
    }

    function setSubmitting(isSubmitting) {
      const btn = document.getElementById('submitBtn');
      btn.disabled    = isSubmitting;
      btn.textContent = isSubmitting ? 'Creating…' : 'Create Receipt';
    }

    function recalcEligible() {
      const amt    = parseAmount(document.getElementById('amount').value);
      const advRaw = document.getElementById('advantage').value.trim();
      const adv    = advRaw === '' ? 0 : parseAmount(advRaw);
      const el     = document.getElementById('eligible');
      el.value     = (!isNaN(amt) && !isNaN(adv)) ? Math.max(0, amt - adv).toFixed(2) : '';
    }

    function validate() {
      clearErrors();
      let valid = true;

      const donDate        = document.getElementById('donDate').value.trim();
      const donorName      = document.getElementById('donorName').value.trim();
      const donorAddress   = document.getElementById('donorAddress').value.trim();
      const donationType   = document.getElementById('donationType').value.trim();
      const amountRaw      = document.getElementById('amount').value.trim();
      const advantageRaw   = document.getElementById('advantage').value.trim();
      const sendPdf        = document.getElementById('sendPdf').checked;
      const recipientEmail = document.getElementById('recipientEmail').value.trim();
      const amount         = parseAmount(amountRaw);
      const advantage      = advantageRaw === '' ? 0 : parseAmount(advantageRaw);

      if (!isValidDate(donDate)) {
        setError('donDate', 'Required. Must be a valid date in MM/DD/YYYY format.');
        valid = false;
      }
      if (!donorName) {
        setError('donorName', 'Donor name is required.');
        valid = false;
      }
      if (!donorAddress) {
        setError('donorAddress', 'Donor address is required.');
        valid = false;
      }
      if (!donationType) {
        setError('donationType', 'Please select a donation type.');
        valid = false;
      }
      if (amountRaw === '' || isNaN(amount) || amount < 0) {
        setError('amount', 'Enter a valid positive number (e.g. 100.00).');
        valid = false;
      }
      if (isNaN(advantage) || advantage < 0) {
        setError('advantage', 'Enter a valid number, or 0 for none.');
        valid = false;
      }
      if (sendPdf && !isValidEmail(recipientEmail)) {
        setError('recipientEmail', 'Please enter a valid email address.');
        valid = false;
      }

      if (!valid) return null;

      return {
        donDate,
        donorName,
        donorAddress,
        donationType,
        amount:         amount.toFixed(2),
        advantage:      advantage.toFixed(2),
        eligible:       Math.max(0, amount - advantage).toFixed(2),
        sendPdf:        sendPdf,
        recipientEmail: sendPdf ? recipientEmail : null
      };
    }

    function submitForm() {
      const data = validate();
      if (!data) return;

      setSubmitting(true);

      google.script.run
        .withSuccessHandler(function(result) {
          window.open(result.receiptUrl);
          google.script.host.close();
        })
        .withFailureHandler(function(err) {
          setSubmitting(false);
          alert('Something went wrong:\\n\\n' + (err.message || err));
        })
        .processReceipt(data);
    }
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECEIPT PROCESSING CORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Processing called from the UI modal in Google Docs
 */
function processReceipt(data) {
  const doc          = DocumentApp.getActiveDocument();
  const originalFile = DriveApp.getFileById(doc.getId());
  const parentFolder = getParentFolder(originalFile);
  const yearFolder   = getOrCreateYearFolder(parentFolder);

  const { receiptId, issueDateStr } = buildReceiptMeta();
  const newName    = buildFileName(data.donorName, data.donDate, receiptId);
  const newFile    = copyAndFill(originalFile, yearFolder, newName, data, issueDateStr, receiptId);
  const receiptUrl = `https://docs.google.com/document/d/${newFile.getId()}/edit`;

  const settings = getSettings();
  logToSheet(data, issueDateStr, receiptUrl, settings.trackingSheetId);

  if (data.sendPdf && data.recipientEmail) {
    sendReceiptByEmail(newFile, data, issueDateStr);
  }

  return { receiptId, receiptUrl };
}

/**
 * Processing called via HTTP POST webhook from website
 */
function processReceiptFromWeb(data, settings) {
  let templateFile;
  if (settings.templateDocId) {
    templateFile = DriveApp.getFileById(settings.templateDocId);
  } else {
    // Fallback to active document if script is bound to the template
    const doc = DocumentApp.getActiveDocument();
    templateFile = DriveApp.getFileById(doc.getId());
  }

  let parentFolder;
  if (settings.driveFolderId) {
    parentFolder = DriveApp.getFolderById(settings.driveFolderId);
  } else {
    parentFolder = getParentFolder(templateFile);
  }

  // Filter into subfolders by year
  const yearFolder = getOrCreateYearFolder(parentFolder);

  const { receiptId, issueDateStr } = buildReceiptMeta();
  const newName    = buildFileName(data.donorName, data.donDate, receiptId);
  const newFile    = copyAndFill(templateFile, yearFolder, newName, data, issueDateStr, receiptId);
  const receiptUrl = `https://docs.google.com/document/d/${newFile.getId()}/edit`;

  logToSheet(data, issueDateStr, receiptUrl, settings.trackingSheetId);

  if (data.sendPdf && data.recipientEmail) {
    sendReceiptByEmail(newFile, data, issueDateStr);
  }

  return { receiptId, receiptUrl };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getParentFolder(file) {
  const parents = file.getParents();
  return parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
}

/**
 * Gets or creates a subfolder named after the current calendar year (e.g. "2026")
 */
function getOrCreateYearFolder(parentFolder) {
  const year = new Date().getFullYear().toString();
  const existingFolders = parentFolder.getFoldersByName(year);
  if (existingFolders.hasNext()) {
    return existingFolders.next();
  }
  return parentFolder.createFolder(year);
}

function buildReceiptMeta() {
  const today        = new Date();
  const mm           = ('0' + (today.getMonth() + 1)).slice(-2);
  const dd           = ('0' + today.getDate()).slice(-2);
  const yy           = today.getFullYear().toString().slice(-2);
  const rand         = Math.floor(1000 + Math.random() * 9000);
  const receiptId    = `${mm}_${dd}_${yy}_${rand}`;
  const issueDateStr = `${mm}/${dd}/${today.getFullYear()}`;
  return { receiptId, issueDateStr };
}

function buildFileName(donorName, donDate, receiptId) {
  const safeName  = donorName.replace(/[^a-zA-Z0-9]/g, '_');
  const parts     = donDate.split('/');
  const dateStamp = `${parts[0]}${parts[1]}${parts[2]}`;
  return `KYO_Charitable_Tax_Receipt_${safeName}_${dateStamp}_${receiptId}`;
}

function copyAndFill(originalFile, destinationFolder, newName, data, issueDateStr, receiptId) {
  const newFile = originalFile.makeCopy(newName, destinationFolder);
  const newDoc  = DocumentApp.openById(newFile.getId());
  const body    = newDoc.getBody();

  const replacements = {
    '{{DONATION_DATE}}':      data.donDate,
    '{{RECEIPT_ISSUE_DATE}}': issueDateStr,
    '{{DONOR_NAME}}':         data.donorName,
    '{{DONOR_ADDRESS}}':      data.donorAddress,
    '{{DONATION_TYPE}}':      data.donationType,
    '{{DONATION_AMOUNT}}':    data.amount,
    '{{ADVANTAGE_RECEIVED}}': data.advantage,
    '{{ELIGIBLE_AMOUNT}}':    data.eligible,
    '{{RECEIPT_ID}}':         receiptId
  };

  const missing = [];

  for (const [placeholder, value] of Object.entries(replacements)) {
    const before = body.getText();
    body.replaceText(placeholder, value);
    if (body.getText() === before) missing.push(placeholder);
  }

  newDoc.saveAndClose();

  if (missing.length > 0) {
    console.warn(`[copyAndFill] Placeholders not found: ${missing.join(', ')}`);
  }

  return newFile;
}

function sendReceiptByEmail(file, data, issueDateStr) {
  const docId     = file.getId();
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=pdf`;
  const token     = ScriptApp.getOAuthToken();
  const response  = UrlFetchApp.fetch(exportUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const pdfBlob = response.getBlob().setName(`${file.getName()}.pdf`);

  const subject = `Charitable Donation Receipt – ${data.donorName} (${issueDateStr})`;
  const body    = [
    `Dear ${data.donorName},`,
    '',
    'Please find attached your official charitable donation receipt from the Kawartha Youth Orchestra.',
    '',
    `  Donation Date:      ${data.donDate}`,
    `  Donation Type:      ${data.donationType}`,
    `  Donation Amount:    $${data.amount}`,
    `  Advantage Received: $${data.advantage}`,
    `  Eligible Amount:    $${data.eligible}`,
    '',
    'Thank you for your generous contribution to our young musicians.',
    '',
    'Sincerely,',
    'Kawartha Youth Orchestra',
    Session.getActiveUser().getEmail()
  ].join('\n');

  GmailApp.sendEmail(data.recipientEmail, subject, body, {
    attachments: [pdfBlob],
    name: 'KYO Charitable Receipts'
  });
}

function logToSheet(data, issueDateStr, receiptUrl, trackingSheetId) {
  const sheetId = trackingSheetId || '1oMrFa1OgL6ghU3HlxeQv9QHPeOFqoYiWkQ9wazht3XI';
  const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  sheet.appendRow([
    issueDateStr,
    data.donorName,
    data.amount,
    data.advantage,
    data.eligible,
    data.donorAddress,
    receiptUrl
  ]);
}

