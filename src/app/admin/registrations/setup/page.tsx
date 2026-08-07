
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Check, Zap, Terminal, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT: Form Sync Webhook
 * 
 * This script receives structured form data from the website and
 * appends it to this Google Sheet with properly ordered headers.
 */

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // The payload provides the exact order the fields appear in the form
    const orderedHeaders = payload.orderedHeaders || [];
    const data = payload.data || {};
    
    // Find or create a specific tab/sheet based on the "Program" metadata
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheetName = data["Program"] || "Submissions";
    sheetName = sheetName.charAt(0).toUpperCase() + sheetName.slice(1);
    
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // 1. Get existing headers (if any)
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    
    // 2. Combine headers ensuring the form's order is respected
    // We add any existing headers that might have been manually added, followed by the form headers.
    let allHeaders = Array.from(new Set([...existingHeaders, ...orderedHeaders])).filter(h => h !== "");
    
    // 3. Update headers in the sheet if we have new fields
    if (allHeaders.length > existingHeaders.length || existingHeaders[0] === "") {
      sheet.getRange(1, 1, 1, allHeaders.length).setValues([allHeaders]);
      sheet.getRange(1, 1, 1, allHeaders.length).setFontWeight("bold").setBackground("#f3f3f3");
    }
    
    // 4. Map data to columns
    const row = allHeaders.map(header => {
      const val = data[header];
      if (Array.isArray(val)) return val.join(", "); // Handle multiple choice
      return val !== undefined ? val : "";
    });
    
    // 5. Append row
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function RegistrationSetupPage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <Button asChild variant="outline" size="sm" className="mb-8">
        <Link href="/admin/registrations">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Registration Forms
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline mb-2 flex items-center gap-3">
          <Zap className="h-7 w-7 text-amber-500" />
          Google Sheets Sync Setup
        </h1>
        <p className="text-muted-foreground">
          Optionally sync your form registrations to a Google Sheet in real-time.
        </p>
      </div>

      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="bg-primary/10 p-2 rounded-full mt-1">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Did you know?</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              You don't <strong>need</strong> to use Google Sheets! Your submissions are securely saved in the built-in database. You can directly export new submissions using the <strong>Submissions Data</strong> tab in each form's editor. However, setting up a Google Sheet webhook is great if you want to share real-time data with external team members.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {/* Step 1 & 2 */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col">
              <div className="flex items-start gap-4 p-5 border-b">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Prepare your Google Sheet</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create or open a blank Google Sheet where you want to receive registration data.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Open Apps Script</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Go to <strong>Extensions</strong> &gt; <strong>Apps Script</strong> in your Google Sheet menu.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card>
          <div className="flex items-start gap-4 p-5">
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
            <div className="space-y-3 flex-1 min-w-0">
              <h2 className="text-base font-semibold">Paste the Sync Code</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Delete any existing code in the editor, and paste the following code block. It will automatically detect your form questions and create headers in the exact order they appear.
              </p>
              <div className="relative mt-2">
                <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-[300px] border">
                  {APPS_SCRIPT_CODE}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 shadow-sm h-8"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <><Check className="h-4 w-4 mr-2 text-green-600" /> Copied</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-2" /> Copy</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 4 & 5 */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col">
              <div className="flex items-start gap-4 p-5 border-b">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                <div className="space-y-3">
                  <h2 className="text-base font-semibold">Deploy as a Web App</h2>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-1">
                    <li>Click the blue <strong>Deploy</strong> button (top right) &gt; <strong>New deployment</strong>.</li>
                    <li>Click the gear icon next to "Select type" and choose <strong>Web App</strong>.</li>
                    <li>Set "Execute as" to <strong>Me</strong>.</li>
                    <li>Set "Who has access" to <strong>Anyone</strong>.</li>
                    <li>Click <strong>Deploy</strong> (you may need to authorize the script).</li>
                    <li>Copy the resulting <strong>Web App URL</strong>.</li>
                  </ol>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</div>
                <div className="space-y-3">
                  <h2 className="text-base font-semibold">Connect to your Form</h2>
                  <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md mb-2">
                    <p className="text-xs text-destructive font-bold uppercase tracking-wide mb-1">Important:</p>
                    <p className="text-sm text-destructive leading-relaxed">
                      Do <strong>NOT</strong> use the URL from your browser's address bar. Use the <strong>Web App URL</strong> generated in the final deployment step.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Open your program's Form Editor, find the <strong>Integrations</strong> section, and paste the Web App URL into the <strong>Google Sheets Webhook URL</strong> field. Save your form.
                  </p>
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-md flex gap-3 items-center">
                    <Terminal className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-800 leading-tight">
                      The link should look like: <code className="bg-amber-100/60 px-1.5 py-0.5 rounded text-amber-900 font-mono">https://script.google.com/macros/s/.../exec</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
