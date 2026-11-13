"use client";

import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, Save, RefreshCw, ExternalLink, CheckCircle2, XCircle, 
  Clock, Eye, EyeOff, Copy, Check, FileCode, Shield, Info, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  getTaxReceiptSettings, saveTaxReceiptSettings, fetchTaxReceipts, 
  TaxReceiptSettings, TaxReceiptRecord 
} from "@/lib/taxReceipts";
import { APPS_SCRIPT_CODE } from "@/lib/appsScriptTemplate";

export default function DonationsAdminPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [receipts, setReceipts] = useState<TaxReceiptRecord[]>([]);

  const [settings, setSettings] = useState<Partial<TaxReceiptSettings>>({
    googleDocTemplateId: '',
    googleDriveFolderId: '',
    googleSheetId: '',
    appsScriptWebAppUrl: '',
    appsScriptSecret: '',
    senderEmail: '',
    senderName: '',
    gmailAppPassword: '',
  });

  useEffect(() => {
    getTaxReceiptSettings().then(setSettings).catch(console.error);
    fetchTaxReceipts()
      .then(setReceipts)
      .catch(console.error)
      .finally(() => setIsLoadingReceipts(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTaxReceiptSettings(settings);
      toast({ title: "Settings saved", description: "Tax receipt settings have been updated." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof TaxReceiptSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    toast({ title: "Copied!", description: "Apps Script code copied to clipboard." });
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const statusBadge = (status: string) => {
    if (status === 'emailed') return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1" />Emailed</Badge>;
    if (status === 'failed') return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Admin</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Donations & Tax Receipts</h1>
          <p className="text-muted-foreground">Configure automated CRA charitable tax receipt generation, Google Apps Script bridge, and review logged receipts.</p>
        </div>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="mb-6">
          <TabsTrigger value="settings">Settings & Configuration</TabsTrigger>
          <TabsTrigger value="appscript">Google Apps Script Code</TabsTrigger>
          <TabsTrigger value="instructions">Setup Instructions</TabsTrigger>
          <TabsTrigger value="receipts">Receipt Log</TabsTrigger>
        </TabsList>

        {/* 1. SETTINGS TAB */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Google Drive / Docs / Sheets IDs */}
            <Card>
              <CardHeader>
                <CardTitle>Google Workspace Integration</CardTitle>
                <CardDescription>
                  Configure your Google Doc template, target Google Drive folder, and tracking spreadsheet. Receipts will be automatically categorized into year-based subfolders (e.g. /2026/).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Google Doc Template ID</Label>
                  <Input
                    value={settings.googleDocTemplateId || ''}
                    onChange={(e) => handleChange('googleDocTemplateId', e.target.value)}
                    placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">The ID from your template URL: docs.google.com/document/d/<b>[ID]</b>/edit</p>
                </div>

                <div className="space-y-1">
                  <Label>Google Drive Destination Folder ID</Label>
                  <Input
                    value={settings.googleDriveFolderId || ''}
                    onChange={(e) => handleChange('googleDriveFolderId', e.target.value)}
                    placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">The folder where receipts are stored. The script automatically creates and sorts receipts into year folders (e.g., 2026).</p>
                </div>

                <div className="space-y-1">
                  <Label>Tracking Google Sheet ID</Label>
                  <Input
                    value={settings.googleSheetId || ''}
                    onChange={(e) => handleChange('googleSheetId', e.target.value)}
                    placeholder="1oMrFa1OgL6ghU3HlxeQv9QHPeOFqoYiWkQ9wazht3XI"
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Every receipt generated (both automatic from website and manual from Docs) is logged as a new row here.</p>
                </div>
              </CardContent>
            </Card>

            {/* Apps Script Web App Bridge */}
            <Card>
              <CardHeader>
                <CardTitle>Apps Script Webhook Integration</CardTitle>
                <CardDescription>
                  Deploy the Apps Script as a Web App to enable automatic receipt generation whenever Stripe payments succeed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Apps Script Web App URL</Label>
                  <Input
                    value={settings.appsScriptWebAppUrl || ''}
                    onChange={(e) => handleChange('appsScriptWebAppUrl', e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycby.../exec"
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Obtained when deploying your script as a Web App in Google Apps Script.</p>
                </div>

                <div className="space-y-1">
                  <Label>Shared Secret Key</Label>
                  <Input
                    value={settings.appsScriptSecret || ''}
                    onChange={(e) => handleChange('appsScriptSecret', e.target.value)}
                    placeholder="e.g. kyo_receipt_sec_99384729184"
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Must match the SHARED_SECRET configured in your Apps Script to prevent unauthorized requests.</p>
                </div>
              </CardContent>
            </Card>

            {/* Email Sender Configuration & App Password */}
            <Card>
              <CardHeader>
                <CardTitle>Email Sender Configuration & Google App Password</CardTitle>
                <CardDescription>
                  Receipts will be sent as PDF attachments. You can update the sender details and Google App Password here anytime.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Sender Display Name</Label>
                    <Input
                      value={settings.senderName || ''}
                      onChange={(e) => handleChange('senderName', e.target.value)}
                      placeholder="Kawartha Youth Orchestra"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Sender Email Address</Label>
                    <Input
                      type="email"
                      value={settings.senderEmail || ''}
                      onChange={(e) => handleChange('senderEmail', e.target.value)}
                      placeholder="donations@thekyo.ca"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Gmail / Google Workspace App Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={settings.gmailAppPassword || ''}
                      onChange={(e) => handleChange('gmailAppPassword', e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx (16-character app password)"
                      className="pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Stored securely in your database. See the "Setup Instructions" tab for step-by-step instructions on creating a Google App Password.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={isSaving} className="px-8 shadow-md">
                {isSaving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save All Settings</>}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* 2. APPS SCRIPT CODE TAB */}
        <TabsContent value="appscript">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-primary" />
                  Google Apps Script Code
                </CardTitle>
                <CardDescription>
                  Copy this entire script and paste it into your Google Doc/Drive Apps Script editor.
                </CardDescription>
              </div>
              <Button onClick={copyScriptToClipboard} variant="default" className="gap-2">
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? "Copied!" : "Copy Full Script"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-xs font-mono max-h-[550px] leading-relaxed">
                  <code>{APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. SETUP INSTRUCTIONS TAB */}
        <TabsContent value="instructions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Step-by-Step Setup Instructions</CardTitle>
                <CardDescription>Follow these 3 quick steps to complete your automated tax receipt setup.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-slate-700 leading-relaxed">
                
                {/* Step 1 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                    Deploy Google Apps Script
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 pl-2 text-xs text-slate-600">
                    <li>Open your Google Doc receipt template in Google Docs.</li>
                    <li>Click <b>Extensions</b> &rarr; <b>Apps Script</b> in the top menu.</li>
                    <li>Delete any existing code in the editor, switch to the <b>Google Apps Script Code</b> tab above, click <b>Copy Full Script</b>, and paste it in.</li>
                    <li>Click <b>Save</b> (disk icon).</li>
                    <li>Click <b>Deploy</b> (blue button top-right) &rarr; <b>New deployment</b>.</li>
                    <li>Click the gear icon next to "Select type" and choose <b>Web app</b>.</li>
                    <li>Configure the deployment:
                      <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5">
                        <li><b>Description:</b> KYO Tax Receipt Webhook</li>
                        <li><b>Execute as:</b> Me (your Google account)</li>
                        <li><b>Who has access:</b> Anyone</li>
                      </ul>
                    </li>
                    <li>Click <b>Deploy</b> and authorize permissions when prompted.</li>
                    <li>Copy the <b>Web app URL</b> and paste it into the <b>Apps Script Web App URL</b> field in the Settings tab.</li>
                  </ol>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                    How to Create a Google App Password
                  </h4>
                  <p className="text-xs text-slate-600">
                    Google App Passwords allow automated services to send emails securely without giving away your personal account password.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 pl-2 text-xs text-slate-600">
                    <li>Sign in to your Google Account at <a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">myaccount.google.com</a>.</li>
                    <li>In the left navigation, click <b>Security</b>.</li>
                    <li>Under "How you sign in to Google", ensure <b>2-Step Verification</b> is turned ON.</li>
                    <li>Click on <b>2-Step Verification</b> &rarr; scroll to the very bottom and click <b>App passwords</b>.</li>
                    <li>Enter an App name (e.g., <i>KYO Website Receipts</i>) and click <b>Create</b>.</li>
                    <li>Google will display a 16-character password (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded">abcd efgh ijkl mnop</code>).</li>
                    <li>Copy that 16-character code and paste it into the <b>Gmail App Password</b> field in the Settings tab above.</li>
                  </ol>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
                    How Year Filtering & Storage Works
                  </h4>
                  <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-slate-600">
                    <li>All generated receipts are stored in the Google Drive folder specified in Settings.</li>
                    <li>The script automatically checks for a subfolder named after the current calendar year (e.g. <b>2026</b>) and creates it if it doesn't already exist.</li>
                    <li>Receipt files are named following the standard format: <br/><code className="bg-slate-200 px-1 py-0.5 rounded mt-1 inline-block">KYO_Charitable_Tax_Receipt_[DonorName]_[Date]_[ReceiptID].pdf</code></li>
                    <li>Every transaction is automatically logged into your tracking Google Sheet.</li>
                    <li>If a donor fills out the donation form without requesting a tax receipt, standard Stripe receipts are sent and no charitable receipt is generated.</li>
                  </ul>
                </div>

              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 4. RECEIPT LOG TAB */}
        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Log</CardTitle>
              <CardDescription>Live audit log of all tax receipts processed by the website.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReceipts ? (
                <div className="text-center py-8 text-muted-foreground">Loading receipts...</div>
              ) : receipts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No receipts generated yet. Receipts will appear here automatically when donations complete.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donor</TableHead>
                        <TableHead>Phone / Address</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Receipt Doc</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="font-medium text-slate-900">{r.donorName}</div>
                            <div className="text-xs text-muted-foreground">{r.donorEmail}</div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 max-w-[200px] truncate">
                            <div>{r.donorPhone || 'No phone'}</div>
                            <div className="truncate text-muted-foreground" title={r.donorAddress}>{r.donorAddress || 'No address'}</div>
                          </TableCell>
                          <TableCell className="font-semibold">${r.amount?.toFixed(2)} CAD</TableCell>
                          <TableCell className="text-sm">{r.donationDate}</TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell>
                            {r.driveUrl ? (
                              <a href={r.driveUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                                  <ExternalLink className="w-3.5 h-3.5 mr-1" />View
                                </Button>
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">{r.errorMessage?.slice(0, 45) || '—'}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
