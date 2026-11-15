"use client";

import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, Save, RefreshCw, ExternalLink, CheckCircle2, XCircle, 
  Clock, Eye, EyeOff, Copy, Check, FileCode, Shield, Info, HelpCircle, 
  AlertCircle, Key, Sparkles, ChevronRight, CheckCircle, FileText, Send, 
  FolderOpen, Activity, History, Play
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
  getTaxReceiptSettings, saveTaxReceiptSettings, fetchTaxReceipts, fetchTaxReceiptAuditLogs,
  logTaxReceiptAudit, TaxReceiptSettings, TaxReceiptRecord, TaxReceiptAuditLog
} from "@/lib/taxReceipts";
import { generateAppsScriptCode } from "@/lib/appsScriptTemplate";
import { fetchLegalPages, LegalPage } from "@/lib/legal-pages";

export default function DonationsAdminPage() {
  const { toast } = useToast();
  // Tab order as requested: Receipt Log FIRST, Setup/Code/Email in between, Audit Log LAST
  const [activeTab, setActiveTab] = useState("receipts");
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(true);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [receipts, setReceipts] = useState<TaxReceiptRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<TaxReceiptAuditLog[]>([]);
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);

  const [settings, setSettings] = useState<Partial<TaxReceiptSettings>>({
    googleDocTemplateId: '',
    googleDriveFolderId: '',
    googleSheetId: '',
    appsScriptWebAppUrl: '',
    appsScriptSecret: '',
    senderName: '',
    senderEmail: '',
    replyToEmail: '',
    googleAccountUser: '',
    gmailAppPassword: '',
    termsLegalSlug: '',
  });

  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const loadData = () => {
    getTaxReceiptSettings().then((data) => {
      if (!data.appsScriptSecret) {
        const autoSecret = 'sec_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
        setSettings({ ...data, appsScriptSecret: autoSecret });
      } else {
        setSettings(data);
      }
    }).catch(console.error);

    fetchLegalPages().then(setLegalPages).catch(console.error);

    setIsLoadingReceipts(true);
    fetchTaxReceipts()
      .then(setReceipts)
      .catch(console.error)
      .finally(() => setIsLoadingReceipts(false));

    setIsLoadingAuditLogs(true);
    fetchTaxReceiptAuditLogs()
      .then(setAuditLogs)
      .catch(console.error)
      .finally(() => setIsLoadingAuditLogs(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTaxReceiptSettings(settings);
      await logTaxReceiptAudit({
        eventType: 'settings_saved',
        title: 'Tax Receipt Settings Saved',
        description: 'Updated tax receipt configuration in database.',
        metadata: {
          hasTemplate: !!settings.googleDocTemplateId,
          hasFolder: !!settings.googleDriveFolderId,
          hasSheet: !!settings.googleSheetId,
          hasUrl: !!settings.appsScriptWebAppUrl,
          senderEmail: settings.senderEmail,
        },
        status: 'success'
      });
      toast({ title: "Settings saved!", description: "Tax receipt settings have been successfully updated." });
      // Refresh audit logs
      fetchTaxReceiptAuditLogs().then(setAuditLogs).catch(console.error);
    } catch (err: any) {
      toast({ title: "Error saving", description: "Failed to save settings. Please try again.", variant: "destructive" });
      await logTaxReceiptAudit({
        eventType: 'settings_saved',
        title: 'Failed to Save Settings',
        description: err.message || 'Unknown error occurred while saving settings.',
        status: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof TaxReceiptSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const dynamicAppsScriptCode = generateAppsScriptCode({
    trackingSheetId: settings.googleSheetId,
    templateDocId: settings.googleDocTemplateId,
    driveFolderId: settings.googleDriveFolderId,
    secret: settings.appsScriptSecret,
    websiteUrl: origin,
  });

  const copyScriptToClipboard = async () => {
    navigator.clipboard.writeText(dynamicAppsScriptCode);
    setCopiedCode(true);
    toast({ title: "Code Copied!", description: "Pre-configured Google Apps Script copied to clipboard." });
    setTimeout(() => setCopiedCode(false), 3000);

    // Record copy action in audit logs
    await logTaxReceiptAudit({
      eventType: 'script_copied',
      title: 'Google Apps Script Code Copied',
      description: 'Admin user copied the generated Apps Script code to clipboard for deployment.',
      metadata: { trackingSheetId: settings.googleSheetId, hasTemplate: !!settings.googleDocTemplateId },
      status: 'info'
    });
    fetchTaxReceiptAuditLogs().then(setAuditLogs).catch(console.error);
  };

  const generateNewSecret = async () => {
    const newSecret = 'sec_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    handleChange('appsScriptSecret', newSecret);
    toast({ title: "New Secret Generated", description: "Remember to click 'Save Settings' to apply." });
    await logTaxReceiptAudit({
      eventType: 'settings_edited',
      title: 'New Webhook Secret Generated',
      description: 'Generated a fresh shared secret key.',
      status: 'warning'
    });
    fetchTaxReceiptAuditLogs().then(setAuditLogs).catch(console.error);
  };

  const handleTestConnection = async () => {
    if (!settings.appsScriptWebAppUrl) {
      toast({ 
        title: "Missing Web App URL", 
        description: "Please paste your deployed Apps Script Web App URL first.", 
        variant: "destructive" 
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      // First save current settings to ensure secret & URL match
      await saveTaxReceiptSettings(settings);

      const res = await fetch('/api/tax-receipts/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appsScriptWebAppUrl: settings.appsScriptWebAppUrl,
          appsScriptSecret: settings.appsScriptSecret,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Connection failed.');
      }

      toast({
        title: "Connection Confirmed!",
        description: "A handshake was sent: a test verification row was added to your Google Sheet and to the Receipt Log!",
      });

      // Reload both receipts and audit logs
      fetchTaxReceipts().then(setReceipts).catch(console.error);
      fetchTaxReceiptAuditLogs().then(setAuditLogs).catch(console.error);

    } catch (err: any) {
      toast({
        title: "Connection Test Failed",
        description: err.message || "Failed to reach Google Apps Script.",
        variant: "destructive",
      });
      fetchTaxReceiptAuditLogs().then(setAuditLogs).catch(console.error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'emailed') return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1" />Emailed</Badge>;
    if (status === 'failed') return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    if (status === 'requires-verification') return <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100"><AlertCircle className="w-3 h-3 mr-1" />Requires Verification (Monthly)</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const auditBadge = (status?: string) => {
    if (status === 'success') return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Success</Badge>;
    if (status === 'error') return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>;
    if (status === 'warning') return <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">Warning</Badge>;
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info</Badge>;
  };

  const hasStep1Ids = !!(settings.googleDocTemplateId && settings.googleDriveFolderId && settings.googleSheetId && settings.appsScriptSecret);
  const hasStep3Url = !!(settings.appsScriptWebAppUrl && settings.appsScriptWebAppUrl.startsWith('https://script.google.com'));

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Admin</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-headline text-slate-900">Donations & Tax Receipts</h1>
            <p className="text-sm text-slate-600">Automated CRA charitable receipts via Google Docs, Drive, Sheets & Stripe.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="shadow-sm">
            {isSaving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Settings</>}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* TAB ORDER REQUESTED:
            1. Receipt Log (FIRST)
            2. Setup Guide & Script
            3. Email & Legal
            4. Script Code View
            5. Audit Log (LAST)
        */}
        <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-5 max-w-3xl">
          <TabsTrigger value="receipts" className="font-medium">Receipt Log</TabsTrigger>
          <TabsTrigger value="setup" className="font-medium">Setup Guide</TabsTrigger>
          <TabsTrigger value="email" className="font-medium">Email & Legal</TabsTrigger>
          <TabsTrigger value="raw-code" className="font-medium">Script Code</TabsTrigger>
          <TabsTrigger value="audit-log" className="font-medium">Event & Audit Log</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: RECEIPT LOG (FIRST TAB) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="receipts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Receipt Log</CardTitle>
                <CardDescription>Live audit record of all tax receipts processed by the website and Google Docs.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
                <RefreshCw className="w-3 h-3" /> Refresh
              </Button>
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
                        <TableHead>Donation</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Receipt Doc / Sheet</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((r) => {
                        const isMonthly = r.frequency === 'monthly';
                        return (
                          <TableRow key={r.id}>
                            <TableCell>
                              <div className="font-medium text-slate-900">{r.donorName}</div>
                              <div className="text-xs text-muted-foreground">{r.donorEmail}</div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-600 max-w-[200px] truncate">
                              <div>{r.donorPhone || 'No phone'}</div>
                              <div className="truncate text-muted-foreground" title={r.donorAddress}>{r.donorAddress || 'No address'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">${r.amount?.toFixed(2)} CAD</div>
                              {isMonthly && (
                                <div className="text-[11px] text-amber-700 font-medium">
                                  Monthly (Assumed 12-Mo: ${(r.assumedAnnualAmount ?? (r.amount * 12)).toFixed(2)})
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{r.donationDate}</TableCell>
                            <TableCell>{statusBadge(r.status)}</TableCell>
                            <TableCell>
                              {r.driveUrl ? (
                                <a href={r.driveUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                                    <ExternalLink className="w-3.5 h-3.5 mr-1" />View
                                  </Button>
                                </a>
                              ) : isMonthly && r.status === 'requires-verification' ? (
                                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                  Held for 12-mo verification
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">{r.errorMessage?.slice(0, 45) || '—'}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: SETUP GUIDE & SCRIPT */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="setup" className="space-y-6">

          {/* Quick Explainer Banner */}
          <div className="p-5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                How the Automated Receipt System Works
              </div>
              <p className="text-xs text-blue-800 leading-relaxed max-w-2xl">
                When a donor completes a payment on the website, our server calls your Google Apps Script Web App. 
                Google creates a duplicate of your receipt template, fills it with donor details, saves it into that year’s Drive folder (e.g. <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">/2026/</code>), logs it to your Google Sheet, and emails the official CRA PDF receipt to the donor.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 px-3 py-2 rounded-lg border border-blue-100 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {hasStep1Ids && hasStep3Url ? "Fully Configured" : "Setup Incomplete"}
            </div>
          </div>

          {/* STEP 1 */}
          <Card className={`border-2 transition-colors ${hasStep1Ids ? 'border-emerald-200 bg-white' : 'border-primary/30 bg-slate-50/40'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${hasStep1Ids ? 'bg-emerald-600 text-white' : 'bg-primary text-white'}`}>
                    1
                  </div>
                  <div>
                    <CardTitle className="text-lg">Step 1: Fill in your Google Workspace IDs</CardTitle>
                    <CardDescription>
                      The script code below automatically adopts these IDs as you enter them.
                    </CardDescription>
                  </div>
                </div>
                {hasStep1Ids && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1">
                    <Check className="w-3.5 h-3.5" /> IDs Ready
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Doc Template ID */}
                <div className="space-y-1.5 p-3.5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" /> Google Doc Template ID
                    </Label>
                  </div>
                  <Input
                    value={settings.googleDocTemplateId || ''}
                    onChange={(e) => handleChange('googleDocTemplateId', e.target.value)}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgm..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Open your Google Doc template &rarr; copy the string between <code className="bg-slate-100 px-1 py-0.5 rounded">/d/</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">/edit</code> in your address bar.
                  </p>
                </div>

                {/* Drive Folder ID */}
                <div className="space-y-1.5 p-3.5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-primary" /> Drive Destination Folder ID
                    </Label>
                  </div>
                  <Input
                    value={settings.googleDriveFolderId || ''}
                    onChange={(e) => handleChange('googleDriveFolderId', e.target.value)}
                    placeholder="1a2b3c4d5e6f7g8h9i..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Open the Google Drive folder where you want receipts saved &rarr; copy the ID at the end of the folder URL.
                  </p>
                </div>

                {/* Tracking Sheet ID */}
                <div className="space-y-1.5 p-3.5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5 text-primary inline" /> Tracking Google Sheet ID
                    </Label>
                  </div>
                  <Input
                    value={settings.googleSheetId || ''}
                    onChange={(e) => handleChange('googleSheetId', e.target.value)}
                    placeholder="1oMrFa1OgL6ghU3HlxeQv9QHPeOFqoYiWkQ9wazht3XI"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Open the Google Sheet where all receipts are logged &rarr; copy the ID from between <code className="bg-slate-100 px-1 py-0.5 rounded">/d/</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">/edit</code>.
                  </p>
                </div>
              </div>

              {/* Shared Security Secret */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" /> Webhook Security Key (Shared Secret)
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      This secret prevents anyone unauthorized from triggering your Apps Script. It is already automatically placed inside your script code below.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={generateNewSecret} className="text-xs h-7 gap-1">
                    <RefreshCw className="w-3 h-3" /> Generate New
                  </Button>
                </div>
                <Input
                  value={settings.appsScriptSecret || ''}
                  onChange={(e) => handleChange('appsScriptSecret', e.target.value)}
                  placeholder="sec_..."
                  className="font-mono text-xs bg-white max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* STEP 2 */}
          <Card className="border-2 border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-lg">Step 2: Copy Code & Paste into Google Apps Script</CardTitle>
                    <CardDescription>
                      Open your Google Doc template, open Apps Script, and paste this ready-to-run code.
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={copyScriptToClipboard} variant="default" className="shadow-sm gap-2">
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? "Copied to Clipboard!" : "Copy Full Script Code"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-primary block">Action 2.1</span>
                  <p>In your Google Doc template, click <b>Extensions</b> in the top toolbar &rarr; select <b>Apps Script</b>.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-primary block">Action 2.2</span>
                  <p>Select everything in the code editor (<kbd className="bg-white px-1 border rounded">Ctrl+A</kbd> or <kbd className="bg-white px-1 border rounded">Cmd+A</kbd>) and delete it.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-primary block">Action 2.3</span>
                  <p>Click the blue <b>"Copy Full Script Code"</b> button above, paste it into the editor, and click <b>Save</b> (disk icon).</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-primary block">Action 2.4</span>
                  <p>Click <b>Deploy</b> (top right) &rarr; <b>New deployment</b> &rarr; gear icon &rarr; <b>Web app</b> &rarr; Who has access: <b>Anyone</b> &rarr; <b>Deploy</b>.</p>
                </div>
              </div>

              <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 text-slate-300 text-xs">
                  <span className="font-mono flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-primary" />
                    Auto-Configured Script Preview (IDs automatically injected)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Full code also accessible under "Script Code" tab
                  </span>
                </div>
                <pre className="p-4 text-slate-200 font-mono text-xs overflow-x-auto max-h-48 leading-relaxed">
                  <code>{dynamicAppsScriptCode.slice(0, 1600)}
                    {"\n// ... [Remainder of code includes automatic PDF emailing, Drive year-subfolder sorting, Sheet logging, and modal dialog] ..."}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* STEP 3 */}
          <Card className={`border-2 transition-colors ${hasStep3Url ? 'border-emerald-200 bg-white' : 'border-amber-300 bg-amber-50/20'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${hasStep3Url ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                    3
                  </div>
                  <div>
                    <CardTitle className="text-lg">Step 3: Paste the Deployed Web App URL & Test Handshake</CardTitle>
                    <CardDescription>
                      Once deployed in Google, paste your Web App URL here, then click "Test Two-Way Connection" to verify.
                    </CardDescription>
                  </div>
                </div>
                {hasStep3Url && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1">
                    <Check className="w-3.5 h-3.5" /> URL Configured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  Copy the <b>Web app URL</b> from Google’s deployment window (starts with <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">https://script.google.com/macros/s/.../exec</code>) and paste it below.
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Apps Script Web App URL</Label>
                <Input
                  value={settings.appsScriptWebAppUrl || ''}
                  onChange={(e) => handleChange('appsScriptWebAppUrl', e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycby.../exec"
                  className="font-mono text-sm bg-white"
                />
              </div>

              {/* Handshake Verification Testing Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-primary" />
                      Two-Way Connection Test (Handshake)
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Sends a test ping from this website to your Apps Script Web App. The script verifies authorization, writes a test confirmation row to your Google Sheet, and logs the event in your website logs!
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleTestConnection} 
                    disabled={isTestingConnection || !settings.appsScriptWebAppUrl}
                    variant="outline"
                    className="shrink-0 bg-white border-primary/30 text-primary hover:bg-primary/5 gap-1.5 shadow-sm text-xs"
                  >
                    {isTestingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    {isTestingConnection ? "Sending Test Ping..." : "Test Two-Way Connection"}
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="px-6 shadow-md">
                  {isSaving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save All Settings</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: EMAIL SENDER & LEGAL DISCLOSURES */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Sender & Google App Password</CardTitle>
              <CardDescription>
                Customize who donor receipts appear from, where replies are sent, and your Google account App Password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-1">
                  <Label className="text-xs font-bold">Sender Display Name</Label>
                  <Input
                    value={settings.senderName || ''}
                    onChange={(e) => handleChange('senderName', e.target.value)}
                    placeholder="Kawartha Youth Orchestra"
                  />
                  <p className="text-[11px] text-muted-foreground">The friendly organization name donors see in their inbox.</p>
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <Label className="text-xs font-bold">From Email Address</Label>
                  <Input
                    type="email"
                    value={settings.senderEmail || ''}
                    onChange={(e) => handleChange('senderEmail', e.target.value)}
                    placeholder="donations@thekyo.ca"
                  />
                  <p className="text-[11px] text-muted-foreground">The address the email receipt originates from.</p>
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <Label className="text-xs font-bold">Reply-To Email Address</Label>
                  <Input
                    type="email"
                    value={settings.replyToEmail || ''}
                    onChange={(e) => handleChange('replyToEmail', e.target.value)}
                    placeholder="info@thekyo.ca"
                  />
                  <p className="text-[11px] text-muted-foreground">Where donor replies will be delivered.</p>
                </div>
              </div>

              {/* Google App Password Box */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Google Workspace / Gmail Account & App Password</h4>
                  <p className="text-xs text-slate-600">
                    Google App Passwords allow the server to deliver receipts through your Google Workspace without exposing your personal Google account password.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Google Account Username</Label>
                    <Input
                      type="email"
                      value={settings.googleAccountUser || ''}
                      onChange={(e) => handleChange('googleAccountUser', e.target.value)}
                      placeholder="e.g. bryce@thekyo.ca or donations@thekyo.ca"
                    />
                    <p className="text-[11px] text-muted-foreground">The Google account generating the App Password.</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">16-Character Google App Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={settings.gmailAppPassword || ''}
                        onChange={(e) => handleChange('gmailAppPassword', e.target.value)}
                        placeholder="xxxx xxxx xxxx xxxx"
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
                      Created in Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App Passwords.
                    </p>
                  </div>
                </div>
              </div>

              {/* CRA Legal Link Selector */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">CRA Tax Receipt Terms & Conditions Legal Link</h4>
                  <p className="text-xs text-slate-600">
                    Controls which legal policy is linked on the public donation checkout form (<code className="bg-slate-100 px-1 py-0.5 rounded">/support-us/donate</code>).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Select Existing Legal Page</Label>
                    <select
                      value={settings.termsLegalSlug || ''}
                      onChange={(e) => handleChange('termsLegalSlug', e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">-- Choose a Legal Page --</option>
                      {legalPages.map((lp) => (
                        <option key={lp.id} value={lp.slug}>
                          {lp.title} (/legal/{lp.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Or Enter Custom Relative URL / Slug</Label>
                    <Input
                      value={settings.termsLegalSlug || ''}
                      onChange={(e) => handleChange('termsLegalSlug', e.target.value)}
                      placeholder="e.g. cra-tax-receipt-terms"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button onClick={handleSave} disabled={isSaving} className="px-6 shadow-md">
                  {isSaving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save All Settings</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: FULL APPS SCRIPT CODE VIEW */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="raw-code">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-primary" />
                  Full Google Apps Script Code
                </CardTitle>
                <CardDescription>
                  This code automatically incorporates your Google Doc Template ID, Drive Folder ID, Tracking Sheet ID, and Shared Secret.
                </CardDescription>
              </div>
              <Button onClick={copyScriptToClipboard} variant="default" className="gap-2 shadow-sm">
                {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? "Copied to Clipboard!" : "Copy Full Script"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-xs font-mono max-h-[600px] leading-relaxed">
                  <code>{dynamicAppsScriptCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: EVENT & AUDIT LOG (LAST TAB) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="audit-log">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  System Event & Audit Log
                </CardTitle>
                <CardDescription>
                  Tracks all configuration edits, script copies, connection handshake tests, webhook syncs, and manual receipts.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
                <RefreshCw className="w-3 h-3" /> Refresh Logs
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingAuditLogs ? (
                <div className="text-center py-8 text-muted-foreground">Loading audit log events...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No events recorded yet. Actions like saving settings, testing connections, or copying script will appear here.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => {
                        let dateStr = 'Just now';
                        if (log.createdAt && typeof (log.createdAt as any).toDate === 'function') {
                          dateStr = (log.createdAt as any).toDate().toLocaleString();
                        }
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="font-semibold text-slate-900 text-xs whitespace-nowrap">
                              {log.title}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600 max-w-md">
                              <div>{log.description}</div>
                              {log.metadata && (
                                <div className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                                  {JSON.stringify(log.metadata)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{auditBadge(log.status)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{dateStr}</TableCell>
                          </TableRow>
                        );
                      })}
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
