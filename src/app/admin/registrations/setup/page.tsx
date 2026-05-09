
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Check, ExternalLink, Zap, Terminal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT: Form Sync Webhook
 * 
 * This script will receive form data from your website and
 * automatically append it to this Google Sheet.
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // 1. Get existing headers or create them
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    const incomingKeys = Object.keys(data).sort();
    
    // 2. Identify all unique columns (existing + new ones from the form)
    let allHeaders = Array.from(new Set([...headers, ...incomingKeys])).filter(h => h !== "");
    
    // 3. Update headers in the sheet if we have new fields
    if (allHeaders.length > headers.length || headers[0] === "") {
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
    <div className="container mx-auto py-8 max-w-4xl">
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/admin/registrations">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold font-headline mb-1 flex items-center gap-2">
          <Zap className="h-6 w-6 text-amber-500" />
          Google Sheets Sync Setup
        </h1>
        <p className="text-muted-foreground text-sm">
          Follow these steps to automatically sync your form registrations to a Google Sheet.
        </p>
      </div>

      <div className="grid gap-3">
        {/* Step 1 & 2 combined or tightened */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col">
              <div className="flex items-start gap-3 p-4 border-b">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold">Prepare your Google Sheet</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Open the Google Sheet where you want to receive registration data.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold">Open Apps Script</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Go to <strong>Extensions</strong> &gt; <strong>Apps Script</strong> in your Google Sheet.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card>
          <div className="flex items-start gap-3 p-4">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
            <div className="space-y-3 flex-1 min-w-0">
              <h2 className="text-sm font-semibold">Paste the Sync Code</h2>
              <div className="relative">
                <pre className="bg-muted p-3 rounded-md text-[11px] font-mono overflow-x-auto max-h-[250px] border">
                  {APPS_SCRIPT_CODE}
                </pre>
                <Button
                  size="xs"
                  variant="secondary"
                  className="absolute top-2 right-2 shadow-sm h-7 text-[10px]"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <><Check className="h-3 w-3 mr-1 text-green-600" /> Copied</>
                  ) : (
                    <><Copy className="h-3 w-3 mr-1" /> Copy</>
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
              <div className="flex items-start gap-3 p-4 border-b">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold">Deploy as a Web App</h2>
                  <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1">
                    <li>Click <strong>Deploy</strong> (top right) &gt; <strong>New deployment</strong>.</li>
                    <li>Select type <strong>Web App</strong>.</li>
                    <li>Set "Execute as" to <strong>Me</strong>.</li>
                    <li>Set "Who has access" to <strong>Anyone</strong>.</li>
                    <li>Click <strong>Deploy</strong> and copy the <strong>Web App URL</strong>.</li>
                  </ol>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</div>
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold">Connect to your Form</h2>
                  <div className="bg-destructive/10 border border-destructive/20 p-2.5 rounded mb-2">
                    <p className="text-[10px] text-destructive font-bold uppercase tracking-tight mb-1">Important:</p>
                    <p className="text-[11px] text-destructive leading-tight">
                      Do <strong>NOT</strong> use the URL from your browser's address bar. Use the <strong>Web App URL</strong> generated in the previous step.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Paste the <strong>Web App URL</strong> into the <strong>Integrations &gt; Google Sheets Webhook URL</strong> field of your Form Editor.
                  </p>
                  <div className="bg-amber-50 border border-amber-100 p-2.5 rounded flex gap-2">
                    <Terminal className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-tight">
                      The link should look like: <code className="bg-amber-100/50 px-1 rounded">https://script.google.com/macros/s/.../exec</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4 flex justify-center">
           <Button asChild size="sm" className="gap-2">
             <Link href="/admin/registrations">
               Done, take me back
             </Link>
           </Button>
        </div>
      </div>
    </div>
  );
}
