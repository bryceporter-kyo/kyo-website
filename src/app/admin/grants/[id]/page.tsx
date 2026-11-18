"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FolderKanban, ArrowLeft, Save, ExternalLink, RefreshCw, FileText, 
  Calendar, CheckCircle2, Clock, DollarSign, Layers, Plus, Trash2, 
  Copy, Globe, Shield, Sparkles, Send, AlertTriangle, ChevronRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  getGrantById, saveGrant, getGrantsSettings, fetchGrantAuditLogs 
} from "@/lib/grants/grants-service";
import { 
  transitionGrantStage, pullAnswersFromGoogleDoc, cloneGrantForNewCycle, callGrantsAppsScript 
} from "@/lib/grants/grant-actions";
import { Grant, GrantsSettings, GrantAuditLogEntry } from "@/lib/grants/types";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const grantId = params.id as string;

  const [grant, setGrant] = useState<Grant | null>(null);
  const [settings, setSettings] = useState<GrantsSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<GrantAuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Q&A Pull state
  const [isPullingQa, setIsPullingQa] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    if (grantId) {
      loadData();
    }
  }, [grantId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [g, s, logs] = await Promise.all([
        getGrantById(grantId),
        getGrantsSettings(),
        fetchGrantAuditLogs(grantId),
      ]);
      setGrant(g);
      setSettings(s);
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error loading grant",
        description: "Failed to load grant record.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFields = async () => {
    if (!grant) return;
    setIsSaving(true);
    try {
      await saveGrant(grant, user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined);
      toast({
        title: "Saved",
        description: "Grant details have been updated.",
      });
      loadData();
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (!grant) return;
    setIsSaving(true);
    try {
      const updated = await transitionGrantStage(
        grant, 
        newStage, 
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );
      setGrant(updated);
      toast({
        title: "Stage Updated",
        description: `Advanced to "${newStage}". Automated Drive & status rules executed.`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: "Stage update error",
        description: err.message || "Could not transition stage.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePullDoc = async () => {
    if (!grant?.qaDocId) {
      toast({
        title: "No Q&A Doc linked",
        description: "Please attach or create an Application Q&A Google Doc first.",
        variant: "destructive",
      });
      return;
    }

    setIsPullingQa(true);
    try {
      const result = await pullAnswersFromGoogleDoc(
        grant,
        grant.qaDocId,
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      toast({
        title: "Answers Synchronized!",
        description: `Imported and updated ${result.rowsUpdated} answers from Google Doc.`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: "Doc Pull Failed",
        description: err.message || "Could not pull tables from Google Doc.",
        variant: "destructive",
      });
    } finally {
      setIsPullingQa(false);
    }
  };

  const handleCloneCycle = async (prefill: boolean) => {
    if (!grant) return;
    setIsCloning(true);
    try {
      const cloned = await cloneGrantForNewCycle(
        grant, 
        { prefillAnswers: prefill },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      toast({
        title: "Grant Cloned for Current Year!",
        description: `Created new application record: ${cloned.funderName}.`,
      });

      router.push(`/admin/grants/${cloned.id}`);
    } catch (err: any) {
      toast({
        title: "Clone error",
        description: err.message || "Could not clone grant.",
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
  };

  if (isLoading || !grant) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading grant details...
      </div>
    );
  }

  const publicPageUrl = `/support-us/case-for-support/org/grant/${new Date(grant.startedAt || grant.createdAt || Date.now()).getFullYear()}/${grant.slug}${grant.programSlug ? `/${grant.programSlug}` : ''}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-7 px-2">
              <Link href="/admin/grants">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Pipeline
              </Link>
            </Button>
            <Badge variant="outline" className="text-xs bg-muted/40 font-mono">
              ID: {grant.id.slice(0, 8)}
            </Badge>
          </div>

          <h2 className="text-2xl font-bold font-headline text-foreground">
            {grant.funderName} — {grant.programName}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Stage: <strong>{grant.stage}</strong></span>
            <span>•</span>
            <span>Assignee: <strong>{grant.assignedOwnerName || grant.assignedOwnerEmail || "None"}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Stage Dropdown */}
          <Select value={grant.stage} onValueChange={handleStageChange}>
            <SelectTrigger className="w-[200px] h-9 text-xs font-semibold bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(settings?.stages || []).map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSaveFields} disabled={isSaving} size="sm" className="gap-1.5 h-9 shadow-sm">
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 max-w-2xl">
          <TabsTrigger value="overview">Overview &amp; Dates</TabsTrigger>
          <TabsTrigger value="money">Financials &amp; Splits</TabsTrigger>
          <TabsTrigger value="qa">Q&amp;A Document</TabsTrigger>
          <TabsTrigger value="publishing">Public Page</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW & DATES */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Core Dates */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Timeline &amp; Deadlines</span>
                </CardTitle>
                <CardDescription>
                  Deadlines drive your calendar reminders and home table priority.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Application Deadline</Label>
                    <Input
                      type="date"
                      value={grant.applicationDeadline || ""}
                      onChange={(e) => setGrant({ ...grant, applicationDeadline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Submitted Date</Label>
                    <Input
                      type="date"
                      value={grant.submittedOn || ""}
                      onChange={(e) => setGrant({ ...grant, submittedOn: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Expected Decision Date</Label>
                    <Input
                      type="date"
                      value={grant.decisionDate || ""}
                      onChange={(e) => setGrant({ ...grant, decisionDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Awarded Date</Label>
                    <Input
                      type="date"
                      value={grant.dateAwarded || ""}
                      onChange={(e) => setGrant({ ...grant, dateAwarded: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Grant Period Start</Label>
                    <Input
                      type="date"
                      value={grant.periodStart || ""}
                      onChange={(e) => setGrant({ ...grant, periodStart: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Grant Period End</Label>
                    <Input
                      type="date"
                      value={grant.periodEnd || ""}
                      onChange={(e) => setGrant({ ...grant, periodEnd: e.target.value })}
                    />
                  </div>
                </div>

                {/* Follow-up Automations */}
                <div className="border-t pt-4 p-3 bg-muted/30 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Automated Return &amp; Renewal Reminders (Spec §4)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Return To Date (Timing Not Right / Reapply)</Label>
                      <Input
                        type="date"
                        value={grant.returnToDate || ""}
                        onChange={(e) => setGrant({ ...grant, returnToDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Renewal Date (Annual Cycle Clones)</Label>
                      <Input
                        type="date"
                        value={grant.renewalDate || ""}
                        onChange={(e) => setGrant({ ...grant, renewalDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Clone */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Google Workspace Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-xs">
                    <span className="text-muted-foreground font-semibold">Google Drive Folder:</span>
                    {grant.driveFolderUrl ? (
                      <a href={grant.driveFolderUrl} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1 hover:underline font-mono">
                        <span>Open Drive Folder</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-muted-foreground italic">Created automatically upon advancing stage</p>
                    )}
                  </div>

                  <div className="space-y-1 text-xs border-t pt-2">
                    <span className="text-muted-foreground font-semibold">LOI Letter Doc ID:</span>
                    <Input
                      value={grant.loiLetterDocId || ""}
                      onChange={(e) => setGrant({ ...grant, loiLetterDocId: e.target.value })}
                      placeholder="Doc ID"
                      className="font-mono text-xs h-7"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-muted-foreground font-semibold">Application Q&amp;A Doc ID:</span>
                    <Input
                      value={grant.qaDocId || ""}
                      onChange={(e) => setGrant({ ...grant, qaDocId: e.target.value })}
                      placeholder="Doc ID"
                      className="font-mono text-xs h-7"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Spec §4: New Grant [Current Year] Clone Button */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-primary">
                    <Copy className="w-4 h-4" />
                    <span>New Grant [Current Year]</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Clone this application into a fresh cycle for {new Date().getFullYear()}, carrying over question schemas and contacts.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs" 
                      onClick={() => handleCloneCycle(true)}
                      disabled={isCloning}
                    >
                      Clone (Prefill Previous Answers)
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full text-xs text-muted-foreground" 
                      onClick={() => handleCloneCycle(false)}
                      disabled={isCloning}
                    >
                      Clone (Start with Blank Answers)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: FINANCIALS & PROGRAM SPLITS (Spec §5) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="money" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span>Award Tracking &amp; Program Allocations</span>
              </CardTitle>
              <CardDescription>
                Record funding requests, multi-year totals, and program division (Spec §5).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Amount Requested ($)</Label>
                  <Input
                    type="number"
                    value={grant.amountRequested || ""}
                    onChange={(e) => setGrant({ ...grant, amountRequested: parseFloat(e.target.value) || 0 })}
                    placeholder="15000"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Award Calculation Mode</Label>
                  <Select 
                    value={grant.awardMode || "total"} 
                    onValueChange={(val: any) => setGrant({ ...grant, awardMode: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total Value Mode</SelectItem>
                      <SelectItem value="per-year">Per-Year Value Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Total Amount Awarded ($)</Label>
                  <Input
                    type="number"
                    value={grant.amountAwarded || ""}
                    onChange={(e) => setGrant({ ...grant, amountAwarded: parseFloat(e.target.value) || 0 })}
                    placeholder="15000"
                  />
                </div>
              </div>

              {/* Program Division */}
              <div className="space-y-2 border-t pt-4">
                <Label className="text-xs font-bold">KYO Programs Supported</Label>
                <div className="flex flex-wrap gap-2">
                  {["The Orchestras", "Upbeat!", "Chamber Music", "Lessons"].map((prog) => {
                    const isChecked = grant.kyoPrograms?.includes(prog);
                    return (
                      <Button
                        key={prog}
                        type="button"
                        size="sm"
                        variant={isChecked ? "default" : "outline"}
                        className="text-xs h-8"
                        onClick={() => {
                          const current = grant.kyoPrograms || [];
                          const next = isChecked 
                            ? current.filter(p => p !== prog)
                            : [...current, prog];
                          setGrant({ ...grant, kyoPrograms: next });
                        }}
                      >
                        {prog}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Fund Restrictions */}
              <div className="space-y-1.5 border-t pt-4">
                <Label className="text-xs font-bold">Funds Restrictions &amp; Stipulations</Label>
                <Textarea
                  value={grant.fundsRestrictions || ""}
                  onChange={(e) => setGrant({ ...grant, fundsRestrictions: e.target.value })}
                  placeholder="e.g. Restricted strictly to instrument purchase for Upbeat! Peterborough..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: Q&A DOCUMENT & SYNC (Spec §7) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="qa" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Proposal Questions &amp; Answers</span>
                </CardTitle>
                <CardDescription>
                  Google Doc is the writing surface. Pulling from doc overwrites stored answers.
                </CardDescription>
              </div>

              <Button 
                onClick={handlePullDoc} 
                disabled={isPullingQa || !grant.qaDocId} 
                className="gap-2 shadow-sm text-xs"
              >
                {isPullingQa ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Pull from Google Doc</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!grant.questions || grant.questions.length === 0) ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <FileText className="w-8 h-8 mx-auto opacity-30" />
                  <p>No questions recorded yet. Link a Q&amp;A doc or advance to <strong>Drafting</strong> to auto-create.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grant.questions.map((q, idx) => (
                    <div key={q.id || idx} className="p-4 border rounded-xl bg-card space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-bold text-sm text-foreground">
                          {idx + 1}. {q.question}
                        </span>
                        {q.charLimit && (
                          <Badge variant="outline" className="text-[10px]">
                            Limit: {q.charLimit} chars
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                        {q.answerHtml ? q.answerHtml : <em className="text-slate-400">No answer drafted yet in Google Doc.</em>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: PUBLIC CASE FOR SUPPORT PAGE (Spec §12) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="publishing" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>Public Case for Support Link</span>
              </CardTitle>
              <CardDescription>
                Publish customized proposal pages at <code>/support-us/case-for-support/[uid]/grant/...</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/30 border rounded-xl flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-foreground">Publication Status</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {grant.published ? (
                      <Badge className="bg-emerald-600 text-white">Live &amp; Published</Badge>
                    ) : (
                      <Badge variant="outline">Unpublished (Returns 404)</Badge>
                    )}
                  </div>
                </div>

                <Button
                  variant={grant.published ? "destructive" : "default"}
                  size="sm"
                  onClick={() => {
                    const next = !grant.published;
                    setGrant({ ...grant, published: next, slugLocked: next ? true : grant.slugLocked });
                  }}
                >
                  {grant.published ? "Unpublish Page" : "Publish Public Page"}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Funder Slug *</Label>
                  <Input
                    value={grant.slug || ""}
                    onChange={(e) => setGrant({ ...grant, slug: e.target.value })}
                    disabled={Boolean(grant.slugLocked)}
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {grant.slugLocked ? "🔒 Locked permanently on first publication to prevent link rot." : "Sanitized slug (lowercase, single hyphens)."}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Program Disambiguation Slug (Optional)</Label>
                  <Input
                    value={grant.programSlug || ""}
                    onChange={(e) => setGrant({ ...grant, programSlug: e.target.value })}
                    placeholder="e.g. general-fund"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Appended if applying for multiple grants in the same year with one funder.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-foreground">Public URL Preview:</span>
                <div className="flex items-center gap-2">
                  <code className="text-primary font-mono">{publicPageUrl}</code>
                  {grant.published && (
                    <a href={publicPageUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: AUDIT LOG (Spec §9) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="audit" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Immutable Audit Trail (Spec §9)</span>
              </CardTitle>
              <CardDescription>
                Read-only event log tracking every change, stage transition, and Google Doc pull.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No recorded audit events for this grant.
                </div>
              ) : (
                <div className="divide-y text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="font-bold text-foreground">{log.summary}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Actor: {log.userName || log.userEmail || "System"} ({log.action})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
