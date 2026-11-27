"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FolderKanban, ArrowLeft, Save, ExternalLink, RefreshCw, FileText, 
  Calendar, CheckCircle2, Clock, DollarSign, Layers, Plus, Trash2, 
  Copy, Globe, Shield, Sparkles, Send, AlertTriangle, ChevronRight,
  BookOpen, Eye, EyeOff, UploadCloud, Info, FileSpreadsheet, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  saveGrant, getGrantsSettings, fetchGrantAuditLogs 
} from "@/lib/grants/grants-service";
import { 
  getGrantById, transitionGrantStage, pullAnswersFromGoogleDoc, pushQuestionsToGoogleDoc, cloneGrantForNewCycle, callGrantsAppsScript,
  generateWorkspaceFromCsvs, syncWithPortal, recordSubmission
} from "@/lib/grants/grant-actions";
import { Grant, GrantsSettings, GrantAuditLogEntry, QuestionItem, BudgetRow, GrantSubmission } from "@/lib/grants/types";
import { CsvManagerDialog } from "@/components/shared/CsvManagerDialog";
import { getGrantPublicUrl, getGrantPortalUrl } from "@/lib/grants/constants";
import { useAuthContext } from "@/components/providers/AuthProvider";

const VALID_TABS = ["overview", "qa", "financials", "content", "documents", "publish", "submit", "audit"] as const;
type TabKey = typeof VALID_TABS[number];

export default function GrantDetailTabView() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthContext();
  
  const grantId = params.id as string;
  const tabParam = (params.tab as string) || "overview";
  const currentTab: TabKey = VALID_TABS.includes(tabParam as any) ? (tabParam as TabKey) : "overview";

  const [grant, setGrant] = useState<Grant | null>(null);
  const [settings, setSettings] = useState<GrantsSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<GrantAuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Sync & workspace state
  const [isPullingQa, setIsPullingQa] = useState(false);
  const [isPushingQa, setIsPushingQa] = useState(false);
  const [isSyncingPortal, setIsSyncingPortal] = useState(false);
  const [isGeneratingWorkspace, setIsGeneratingWorkspace] = useState(false);
  const [isGeneratingLoi, setIsGeneratingLoi] = useState(false);
  const [isGeneratingBlankDoc, setIsGeneratingBlankDoc] = useState(false);
  const [isGeneratingBlankSheet, setIsGeneratingBlankSheet] = useState(false);
  const [showManualLinkIds, setShowManualLinkIds] = useState(false);
  const [pendingQuestionSets, setPendingQuestionSets] = useState<
    {
      id: string;
      fileName: string;
      labelType: "LOI" | "Application" | "Custom";
      customLabel: string;
      questions: QuestionItem[];
    }[]
  >([]);
  const [pendingBudgetRows, setPendingBudgetRows] = useState<BudgetRow[] | null>(null);
  const [pendingBudgetHeaders, setPendingBudgetHeaders] = useState<string[]>([]);
  const [isCloning, setIsCloning] = useState(false);

  // Submission state
  const [isRecordingSubmission, setIsRecordingSubmission] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<{ base64: string; name: string } | null>(null);

  // Form helpers for Q&A additions
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionLimit, setNewQuestionLimit] = useState("");

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

  // Two-way sync: Pull answers from Google Doc into Grant
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
        description: `Imported and updated ${result.rowsUpdated} questions & answers from Google Doc.`,
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

  // Two-way sync: Push questions from Website to Google Doc
  const handlePushDoc = async () => {
    if (!grant?.qaDocId) {
      toast({
        title: "No Q&A Doc linked",
        description: "Please attach or create an Application Q&A Google Doc first.",
        variant: "destructive",
      });
      return;
    }

    setIsPushingQa(true);
    try {
      const result = await pushQuestionsToGoogleDoc(
        grant,
        grant.qaDocId,
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      toast({
        title: "Questions Pushed to Doc",
        description: `Updated ${result.rowsPushed} questions in Google Doc table. Draft answers preserved.`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: "Doc Push Failed",
        description: err.message || "Could not push questions to Google Doc.",
        variant: "destructive",
      });
    } finally {
      setIsPushingQa(false);
    }
  };

  // Unified Sync with Portal (Step 6)
  const handleSyncWithPortal = async () => {
    if (!grant) return;
    setIsSyncingPortal(true);
    try {
      const res = await syncWithPortal(
        grant,
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );
      toast({
        title: "Synced with Portal",
        description: `Pulled ${res.questionsSynced} questions and ${res.budgetRowsSynced} budget rows from Google Workspace.`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message || "Could not sync from Google Workspace.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingPortal(false);
    }
  };

  // Step 4: Generate Google Doc & Sheet from imported CSVs
  const handleGenerateWorkspace = async () => {
    if (!grant) return;
    const budgetRows = pendingBudgetRows || grant.budgetBreakdown || [];
    const budgetHeaders = pendingBudgetHeaders.length > 0 ? pendingBudgetHeaders : (grant.budgetHeaders || ["Category", "Item/Description", "Amount"]);

    const getEffectiveLabel = (s: { labelType: "LOI" | "Application" | "Custom"; customLabel: string; fileName: string }) =>
      s.labelType === "Custom" ? (s.customLabel.trim() || s.fileName.replace(/\.csv$/i, "")) : s.labelType;

    setIsGeneratingWorkspace(true);
    try {
      await saveGrant(
        grant,
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      const primarySet = pendingQuestionSets.find((s) => s.labelType === "Application") || pendingQuestionSets[0];
      const primaryQuestions = primarySet ? primarySet.questions : (grant.questions || []);

      const primaryGrant = primarySet
        ? {
            ...grant,
            programName: `${grant.programName ? grant.programName + " — " : ""}${getEffectiveLabel(primarySet)}`,
          }
        : grant;

      const res = await generateWorkspaceFromCsvs(
        primaryGrant,
        primaryQuestions,
        budgetRows,
        budgetHeaders,
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      // Create separate Google Docs for any additional labeled question sets
      const extraSets = pendingQuestionSets.filter((s) => s.id !== primarySet?.id);
      if (extraSets.length > 0) {
        const updatedGrant = await getGrantById(grant.id);
        const folderId = updatedGrant?.driveFolderId || grant.driveFolderId;
        if (folderId) {
          await Promise.all(
            extraSets.map((set) =>
              callGrantsAppsScript("createQaDocFromQuestions", {
                folderId,
                funderName: grant.funderName,
                programName: `${grant.programName ? grant.programName + " — " : ""}${getEffectiveLabel(set)}`,
                deadline: grant.applicationDeadline || "TBD",
                questions: set.questions,
                narrative: {
                  customLetterBody: grant.customLetterBody || [],
                  impactStatement: grant.impactStatement || "",
                  valuesAlignment: grant.valuesAlignment || "",
                  communityNeed: grant.communityNeed || "",
                  programDescription: grant.programDescription || "",
                  organizationalCapacity: grant.organizationalCapacity || "",
                  reportingPlan: grant.reportingPlan || "",
                  recognitionPlan: grant.recognitionPlan || "",
                },
              })
            )
          );
        }
      }

      toast({
        title: "Workspace Generated",
        description:
          pendingQuestionSets.length > 1
            ? `Created ${pendingQuestionSets.length} separate Google Docs and Budget Sheet in Drive.`
            : "Created linked Google Doc and Budget Sheet in the grant's Drive folder.",
      });
      setPendingQuestionSets([]);
      setPendingBudgetRows(null);
      setPendingBudgetHeaders([]);
      loadData();
    } catch (err: any) {
      toast({
        title: "Workspace Generation Failed",
        description: err.message || "Could not create Google Doc / Sheet.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingWorkspace(false);
    }
  };

  // Generate Free-Response LOI Letter on KYO letterhead directly from Workspace tab
  const handleGenerateLoiLetter = async () => {
    if (!grant) return;
    setIsGeneratingLoi(true);
    try {
      let folderId = grant.driveFolderId;
      let folderUrl = grant.driveFolderUrl;
      if (!folderId) {
        const folderRes = await callGrantsAppsScript("createGrantFolder", {
          funderName: grant.funderName,
          year: grant.startedAt ? new Date(grant.startedAt).getFullYear().toString() : new Date().getFullYear().toString(),
        });
        folderId = folderRes.folderId;
        folderUrl = folderRes.folderUrl;
      }
      const docRes = await callGrantsAppsScript("createLoiLetter", {
        folderId,
        funderName: grant.funderName,
      });
      await saveGrant(
        { id: grant.id, driveFolderId: folderId, driveFolderUrl: folderUrl, loiLetterDocId: docRes.docId },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );
      toast({
        title: "LOI Letter Created",
        description: "Generated free-response LOI letter on KYO letterhead in Drive.",
      });
      loadData();
    } catch (err: any) {
      toast({
        title: "LOI Generation Failed",
        description: err.message || "Could not create LOI letter.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLoi(false);
    }
  };

  // Generate Blank Questions Document (without CSV)
  const handleGenerateBlankQuestionsDoc = async () => {
    if (!grant) return;
    setIsGeneratingBlankDoc(true);
    try {
      let folderId = grant.driveFolderId;
      let folderUrl = grant.driveFolderUrl;
      if (!folderId) {
        const folderRes = await callGrantsAppsScript("createGrantFolder", {
          funderName: grant.funderName,
          year: grant.startedAt ? new Date(grant.startedAt).getFullYear().toString() : new Date().getFullYear().toString(),
        });
        folderId = folderRes.folderId;
        folderUrl = folderRes.folderUrl;
      }
      const qaRes = await callGrantsAppsScript("createQaDocFromQuestions", {
        folderId,
        funderName: grant.funderName,
        programName: grant.programName,
        deadline: grant.applicationDeadline || "TBD",
        questions: grant.questions || [],
        narrative: {
          customLetterBody: grant.customLetterBody || [],
          impactStatement: grant.impactStatement || "",
          valuesAlignment: grant.valuesAlignment || "",
          communityNeed: grant.communityNeed || "",
          programDescription: grant.programDescription || "",
          organizationalCapacity: grant.organizationalCapacity || "",
          reportingPlan: grant.reportingPlan || "",
          recognitionPlan: grant.recognitionPlan || "",
        },
      });
      await saveGrant(
        { id: grant.id, driveFolderId: folderId, driveFolderUrl: folderUrl, qaDocId: qaRes.docId },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );
      toast({ title: "Questions Document Created", description: "Blank Q&A Google Doc created in Drive." });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not create Questions Doc.", variant: "destructive" });
    } finally {
      setIsGeneratingBlankDoc(false);
    }
  };

  // Generate Blank Budget File (without CSV)
  const handleGenerateBlankBudgetSheet = async () => {
    if (!grant) return;
    setIsGeneratingBlankSheet(true);
    try {
      let folderId = grant.driveFolderId;
      let folderUrl = grant.driveFolderUrl;
      if (!folderId) {
        const folderRes = await callGrantsAppsScript("createGrantFolder", {
          funderName: grant.funderName,
          year: grant.startedAt ? new Date(grant.startedAt).getFullYear().toString() : new Date().getFullYear().toString(),
        });
        folderId = folderRes.folderId;
        folderUrl = folderRes.folderUrl;
      }
      const defaultHeaders = ["Category", "Item/Description", "Amount"];
      const sheetRes = await callGrantsAppsScript("createBudgetSheet", {
        folderId,
        funderName: grant.funderName,
        headers: defaultHeaders,
        rows: [],
      });
      await saveGrant(
        {
          id: grant.id,
          driveFolderId: folderId,
          driveFolderUrl: folderUrl,
          budgetHeaders: defaultHeaders,
          budgetSheetId: sheetRes.sheetId,
          budgetSheetUrl: sheetRes.sheetUrl,
        },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );
      toast({ title: "Budget File Created", description: "Blank Budget Google Sheet created in Drive." });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not create Budget Sheet.", variant: "destructive" });
    } finally {
      setIsGeneratingBlankSheet(false);
    }
  };

  // Step 8: Record Submission & Upload Evidence PDF
  const handleRecordSubmission = async () => {
    if (!grant) return;
    setIsRecordingSubmission(true);
    try {
      const sub: GrantSubmission = grant.submission || {};
      await recordSubmission(
        grant,
        sub,
        evidenceFile?.base64,
        evidenceFile?.name,
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );
      toast({
        title: "Submission Recorded",
        description: evidenceFile ? `Saved submission details and uploaded ${evidenceFile.name} to Drive.` : "Saved submission details.",
      });
      setEvidenceFile(null);
      loadData();
    } catch (err: any) {
      toast({
        title: "Submission Save Failed",
        description: err.message || "Could not record submission.",
        variant: "destructive",
      });
    } finally {
      setIsRecordingSubmission(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !grant) return;
    const currentQuestions = grant.questions || [];
    const newQ: QuestionItem = {
      id: `q_${Date.now()}`,
      question: newQuestionText.trim(),
      charLimit: newQuestionLimit ? parseInt(newQuestionLimit, 10) : undefined,
      order: currentQuestions.length + 1,
      publicVisible: true,
      answerHtml: "",
    };
    setGrant({
      ...grant,
      questions: [...currentQuestions, newQ],
    });
    setNewQuestionText("");
    setNewQuestionLimit("");
  };

  const handleToggleQuestionVisibility = (idx: number) => {
    if (!grant || !grant.questions) return;
    const updated = [...grant.questions];
    updated[idx] = {
      ...updated[idx],
      publicVisible: updated[idx].publicVisible === false ? true : false,
    };
    setGrant({ ...grant, questions: updated });
  };

  const handleDeleteQuestion = (idx: number) => {
    if (!grant || !grant.questions) return;
    const updated = grant.questions.filter((_, i) => i !== idx);
    setGrant({ ...grant, questions: updated });
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

      router.push(`/grants/${cloned.id}/overview`);
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

  const publicPageUrl = getGrantPublicUrl(grant);

  return (
    <div className="space-y-6 pt-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-7 px-2">
              <Link href="/grants">
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

      {/* URL-based Tab Navigation (Workflow Order) */}
      <div className="border-b">
        <div className="flex items-center gap-1 overflow-x-auto pb-px text-sm font-medium">
          <Link
            href={getGrantPortalUrl(grant, "overview")}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              currentTab === "overview"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            1. Overview &amp; Dates
          </Link>
          <Link
            href={getGrantPortalUrl(grant, "qa")}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === "qa"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>2. Workspace &amp; Sync</span>
            {grant.questions && grant.questions.length > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {grant.questions.length}
              </Badge>
            )}
          </Link>
          <Link
            href={getGrantPortalUrl(grant, "financials")}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              currentTab === "financials"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            3. Budget &amp; Financials
          </Link>
          <Link
            href={getGrantPortalUrl(grant, "content")}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              currentTab === "content"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            4. Case for Support
          </Link>
          <Link
            href={getGrantPortalUrl(grant, "documents")}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              currentTab === "documents"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            5. Documents &amp; Drive
          </Link>
          <Link
            href={getGrantPortalUrl(grant, "publish")}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === "publish"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>6. Public Page</span>
            {grant.published ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : null}
          </Link>
          <Link
            href={getGrantPortalUrl(grant, "submit")}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === "submit"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>7. Submission</span>
            {grant.submission?.isComplete && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </Link>
          <Link
            href={getGrantPortalUrl(grant, "audit")}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              currentTab === "audit"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Audit Log
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: OVERVIEW & DATES */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentTab === "overview" && (
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Identifiers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Grant Identity</CardTitle>
                <CardDescription>Primary linkages and ownership</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Funder Name</Label>
                  <Input value={grant.funderName || ""} disabled className="bg-muted/40 text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Grant Program Name</Label>
                  <Input 
                    value={grant.programName || ""} 
                    onChange={(e) => setGrant({ ...grant, programName: e.target.value })} 
                    placeholder="e.g. Vital Communities Grant"
                    className="text-xs" 
                  />
                  <p className="text-[11px] text-muted-foreground">
                    The funder&apos;s funding stream or program name (leave blank if the funder only has one general fund).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Specific Grant Name (Optional)</Label>
                  <Input 
                    value={grant.grantName || ""} 
                    onChange={(e) => setGrant({ ...grant, grantName: e.target.value })} 
                    placeholder="e.g. Upbeat! Peterborough 2026"
                    className="text-xs" 
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Your specific project or application name, used to distinguish multiple applications to the same funder/program.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Assigned Owner Email</Label>
                  <Input 
                    value={grant.assignedOwnerEmail || ""} 
                    onChange={(e) => setGrant({ ...grant, assignedOwnerEmail: e.target.value })} 
                    placeholder="owner@thekyo.ca" 
                    className="text-xs" 
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Team member responsible for drafting, tracking, and calendar reminders for this grant.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stage Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Critical Dates</CardTitle>
                <CardDescription>Deadlines, submissions, and decision milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Application Deadline</Label>
                    <Input 
                      type="date"
                      value={grant.applicationDeadline || ""} 
                      onChange={(e) => setGrant({ ...grant, applicationDeadline: e.target.value })} 
                      className="text-xs" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">LOI Submitted On</Label>
                    <Input 
                      type="date"
                      value={grant.loiSubmittedOn || ""} 
                      onChange={(e) => setGrant({ ...grant, loiSubmittedOn: e.target.value })} 
                      className="text-xs" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Final Application Submitted</Label>
                    <Input 
                      type="date"
                      value={grant.submittedOn || ""} 
                      onChange={(e) => setGrant({ ...grant, submittedOn: e.target.value })} 
                      className="text-xs" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Expected Decision Date</Label>
                    <Input 
                      type="date"
                      value={grant.decisionDate || ""} 
                      onChange={(e) => setGrant({ ...grant, decisionDate: e.target.value })} 
                      className="text-xs" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Return-To Date</Label>
                    <Input 
                      type="date"
                      value={grant.returnToDate || ""} 
                      onChange={(e) => setGrant({ ...grant, returnToDate: e.target.value })} 
                      className="text-xs" 
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Date to revisit if timing isn&apos;t right now.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Renewal Date</Label>
                    <Input 
                      type="date"
                      value={grant.renewalDate || ""} 
                      onChange={(e) => setGrant({ ...grant, renewalDate: e.target.value })} 
                      className="text-xs" 
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Target date to reapply for the next cycle.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: FINANCIALS & SPLITS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentTab === "financials" && (
        <div className="space-y-6 pt-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span>Award Structure &amp; Allocations</span>
              </CardTitle>
              <CardDescription>Requested sums, awarded amounts, and restrictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Amount Requested ($CAD)</Label>
                  <Input
                    type="number"
                    value={grant.amountRequested || ""}
                    onChange={(e) => setGrant({ ...grant, amountRequested: parseFloat(e.target.value) || 0 })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Amount Awarded ($CAD)</Label>
                  <Input
                    type="number"
                    value={grant.amountAwarded || ""}
                    onChange={(e) => setGrant({ ...grant, amountAwarded: parseFloat(e.target.value) || 0 })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Funding Type</Label>
                  <Select
                    value={grant.fundingType || "one-time"}
                    onValueChange={(val: any) => setGrant({ ...grant, fundingType: val })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time grant</SelectItem>
                      <SelectItem value="multi-year">Multi-year commitment</SelectItem>
                      <SelectItem value="matching">Matching grant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
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
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: Q&A DOCUMENT & TWO-WAY SYNC */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentTab === "qa" && (
        <div className="space-y-6 pt-2">
          {/* Step 2-4: CSV Import & Workspace Generation Wizard */}
          {!grant.qaDocId && (
            <Card className="border-primary/30 bg-primary/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-primary" />
                  <span>Set Up Application Workspace from CSV</span>
                </CardTitle>
                <CardDescription>
                  Download the CSV templates, format your funder&apos;s instructions, upload both CSVs, and generate your linked Google Doc &amp; Budget Sheet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <CsvManagerDialog
                    title="Questions CSVs"
                    description="Select one or more CSV files (e.g., LOI questions and Application questions). Each file will become its own separate Google Doc."
                    templateHeaders={["Question", "Description", "Question Type", "Option Selected/Answer", "Char Limit"]}
                    templateSampleRow={["\"Describe your project goals\"", "\"Provide a 1-2 paragraph summary\"", "\"long_text\"", "\"\"", "500"]}
                    instructionText="Format each grant question as a row. Columns: Question, Description, Question Type (short_text, long_text, multiple_choice, etc.), Option Selected/Answer, Char Limit."
                    existingData={undefined}
                    multiple={true}
                    triggerButtonText={
                      pendingQuestionSets.length > 0
                        ? `Questions CSVs (${pendingQuestionSets.length} file${pendingQuestionSets.length > 1 ? "s" : ""} — Add More)`
                        : "Questions CSV Template & Import"
                    }
                    onUploadMultiple={(files) => {
                      const newSets = files.map((f, fIdx) => {
                        const mapped: QuestionItem[] = f.data
                          .filter((r: any) => r.Question || r.question)
                          .map((r: any, idx: number) => {
                            const desc = String(r.Description || r.description || "").trim();
                            const qType = String(r["Question Type"] || r.questionType || "").trim();
                            const optSel = String(r["Option Selected/Answer"] || r.optionSelected || "").trim();
                            const cLimit = r["Char Limit"] ? parseInt(String(r["Char Limit"]), 10) || 0 : 0;
                            const item: QuestionItem = {
                              id: `q_${Date.now()}_${fIdx}_${idx}`,
                              question: String(r.Question || r.question || "").trim(),
                              order: idx + 1,
                              publicVisible: true,
                              answerHtml: "",
                            };
                            if (desc) item.description = desc;
                            if (qType) item.questionType = qType;
                            if (optSel) item.optionSelected = optSel;
                            if (cLimit > 0) item.charLimit = cLimit;
                            return item;
                          });
                        const isLoi = /loi/i.test(f.fileName);
                        return {
                          id: `set_${Date.now()}_${fIdx}`,
                          fileName: f.fileName,
                          labelType: (isLoi ? "LOI" : "Application") as "LOI" | "Application" | "Custom",
                          customLabel: "",
                          questions: mapped,
                        };
                      });
                      setPendingQuestionSets((prev) => [...prev, ...newSets]);
                      toast({
                        title: "Questions CSVs Loaded",
                        description: `Loaded ${newSets.length} separate file${newSets.length > 1 ? "s" : ""}. Label each below before generating.`,
                      });
                    }}
                  />

                  <CsvManagerDialog
                    title="Budget CSV"
                    description="Upload your funder-specific Budget CSV with any custom columns and rows."
                    templateHeaders={["Category", "Item/Description", "Amount"]}
                    templateSampleRow={["\"Personnel\"", "\"Artistic Director\"", "\"5000\""]}
                    instructionText="Use whatever columns and rows the funder requires. The sheet will be created verbatim."
                    existingData={undefined}
                    triggerButtonText={pendingBudgetRows ? `Budget CSV (${pendingBudgetRows.length} rows)` : "Budget CSV Template & Import"}
                    onUploadWithHeaders={(data, headers, mode) => {
                      const cleanHeaders = headers.filter((h) => h && h.trim() !== "");
                      const cleanData = data.map((row) => {
                        const cleanRow: Record<string, any> = {};
                        for (const key of cleanHeaders) {
                          cleanRow[key] = row[key] ?? "";
                        }
                        return cleanRow;
                      });
                      setPendingBudgetHeaders(cleanHeaders);
                      setPendingBudgetRows(mode === "append" && pendingBudgetRows ? [...pendingBudgetRows, ...cleanData] : cleanData);
                      toast({ title: "Budget CSV Loaded", description: `Loaded ${cleanData.length} rows (${cleanHeaders.length} columns).` });
                    }}
                  />

                  <Button
                    onClick={handleGenerateWorkspace}
                    disabled={isGeneratingWorkspace || (pendingQuestionSets.length === 0 && !pendingBudgetRows)}
                    className="gap-2 text-xs shadow-sm"
                  >
                    {isGeneratingWorkspace ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    <span>Generate Workspace in Drive</span>
                  </Button>
                </div>

                {pendingQuestionSets.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-semibold text-foreground">
                      Uploaded Question Files (each will be created as a separate Google Doc):
                    </p>
                    <div className="space-y-2">
                      {pendingQuestionSets.map((set) => (
                        <div key={set.id} className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg border bg-card text-xs">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-medium truncate max-w-[200px]" title={set.fileName}>
                            {set.fileName}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {set.questions.length} questions
                          </Badge>
                          <select
                            value={set.labelType}
                            onChange={(e) => {
                              const val = e.target.value as "LOI" | "Application" | "Custom";
                              setPendingQuestionSets((prev) =>
                                prev.map((item) => (item.id === set.id ? { ...item, labelType: val } : item))
                              );
                            }}
                            className="h-7 rounded-md border border-input bg-background px-2 text-xs"
                          >
                            <option value="LOI">LOI</option>
                            <option value="Application">Application</option>
                            <option value="Custom">Custom Name...</option>
                          </select>
                          {set.labelType === "Custom" && (
                            <Input
                              value={set.customLabel}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPendingQuestionSets((prev) =>
                                  prev.map((item) => (item.id === set.id ? { ...item, customLabel: val } : item))
                                );
                              }}
                              placeholder="Enter document label..."
                              className="h-7 w-44 text-xs"
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 ml-auto text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setPendingQuestionSets((prev) => prev.filter((item) => item.id !== set.id))
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Blank File Generation (Skip CSV) */}
                <div className="pt-2 border-t space-y-2">
                  <p className="text-xs font-semibold text-foreground">Or skip CSVs and generate blank files directly:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateBlankQuestionsDoc}
                      disabled={isGeneratingBlankDoc}
                      className="gap-1.5 text-xs"
                    >
                      {isGeneratingBlankDoc ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>Generate Questions Document</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateBlankBudgetSheet}
                      disabled={isGeneratingBlankSheet}
                      className="gap-1.5 text-xs"
                    >
                      {isGeneratingBlankSheet ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                      <span>Generate Budget File</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateBlankQuestionsDoc}
                      disabled={isGeneratingBlankDoc}
                      className="gap-1.5 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Generate LOI</span>
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted/40 border rounded-xl text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Letter of Inquiry (LOI):</p>
                    <p>
                      You can import multiple sets of questions (e.g., LOI questions first, then full application questions) using <strong>Append</strong> in the Questions CSV uploader. For a free-response LOI letter on KYO letterhead, generate it directly here:
                    </p>
                  </div>
                  {grant.loiLetterDocId ? (
                    <a
                      href={`https://docs.google.com/document/d/${grant.loiLetterDocId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open LOI Letter</span>
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateLoiLetter}
                      disabled={isGeneratingLoi}
                      className="gap-1.5 text-xs shrink-0"
                    >
                      {isGeneratingLoi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>Generate Free-Response LOI</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Two-Way Sync Header Card */}
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Proposal Questions &amp; Workspace Sync</span>
                </CardTitle>
                <CardDescription>
                  The Google Doc &amp; Sheet are the writing surfaces. Click &quot;Sync with Portal&quot; to ingest all updates.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  onClick={handleSyncWithPortal} 
                  disabled={isSyncingPortal || (!grant.qaDocId && !grant.budgetSheetId)} 
                  className="gap-2 shadow-sm text-xs"
                >
                  {isSyncingPortal ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Sync with Portal</span>
                </Button>

                <Button 
                  variant="outline"
                  onClick={handlePushDoc} 
                  disabled={isPushingQa || !grant.qaDocId} 
                  className="gap-2 shadow-sm text-xs"
                >
                  {isPushingQa ? <UploadCloud className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  <span>Push Questions to Doc</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {grant.qaDocId && (
                    <a
                      href={`https://docs.google.com/document/d/${grant.qaDocId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Q&amp;A Doc</span>
                      </Button>
                    </a>
                  )}
                  {grant.budgetSheetId && (
                    <a
                      href={grant.budgetSheetUrl || `https://docs.google.com/spreadsheets/d/${grant.budgetSheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Budget Sheet</span>
                      </Button>
                    </a>
                  )}
                  {(grant.qaLastSyncedAt || grant.budgetLastSyncedAt) && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Last synced: {new Date(grant.qaLastSyncedAt || grant.budgetLastSyncedAt || "").toLocaleString()}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualLinkIds(!showManualLinkIds)}
                  className="text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <span>Already have Q&amp;A or Budget Files?</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showManualLinkIds ? "rotate-90" : ""}`} />
                </Button>
              </div>

              {showManualLinkIds && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Linked Q&amp;A Google Doc ID</Label>
                    <Input
                      value={grant.qaDocId || ""}
                      onChange={(e) => setGrant({ ...grant, qaDocId: e.target.value })}
                      placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Linked Budget Google Sheet ID</Label>
                    <Input
                      value={grant.budgetSheetId || ""}
                      onChange={(e) => setGrant({ ...grant, budgetSheetId: e.target.value })}
                      placeholder="e.g. 1x2y3z..."
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions List with per-row visibility toggles */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Application Questions ({grant.questions?.length || 0})</CardTitle>
                <CardDescription>
                  Toggle eye icons to hide internal questions from the public Case for Support page.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Question Row */}
              <div className="p-3 bg-muted/30 border rounded-xl space-y-3">
                <span className="text-xs font-bold text-foreground">Add New Question</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Enter grant application question..."
                    className="text-xs flex-1"
                  />
                  <Input
                    type="number"
                    value={newQuestionLimit}
                    onChange={(e) => setNewQuestionLimit(e.target.value)}
                    placeholder="Char limit (opt)"
                    className="text-xs w-full sm:w-36"
                  />
                  <Button onClick={handleAddQuestion} size="sm" className="shrink-0 text-xs gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>

              {(!grant.questions || grant.questions.length === 0) ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <FileText className="w-8 h-8 mx-auto opacity-30" />
                  <p>No questions recorded yet. Link a Q&amp;A doc or click "Sync from Google Doc".</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grant.questions.map((q, idx) => (
                    <div key={q.id || idx} className="p-4 border rounded-xl bg-card space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              {idx + 1}. {q.question}
                            </span>
                            {q.questionType && (
                              <Badge variant="secondary" className="text-[10px]">
                                {q.questionType}
                              </Badge>
                            )}
                            {q.publicVisible === false && (
                              <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-50 border-amber-200">
                                Hidden from Public Page
                              </Badge>
                            )}
                          </div>
                          {q.description && (
                            <p className="text-[11px] text-muted-foreground italic">
                              {q.description}
                            </p>
                          )}
                          {q.optionSelected && (
                            <p className="text-[11px] text-primary font-medium">
                              Option Selected: {q.optionSelected}
                            </p>
                          )}
                          {q.charLimit && (
                            <span className="text-[10px] text-muted-foreground">
                              Character Limit: {q.charLimit}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleQuestionVisibility(idx)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title={q.publicVisible === false ? "Show on public page" : "Hide from public page"}
                          >
                            {q.publicVisible === false ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuestion(idx)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                        {q.answerHtml ? q.answerHtml : <em className="text-slate-400">No answer drafted yet in Google Doc. Click "Sync from Google Doc" to pull.</em>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: CASE FOR SUPPORT NARRATIVE & CONTENT */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentTab === "content" && (
        <div className="space-y-6 pt-2">
          {/* Letter to Funder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Letter to Organization</CardTitle>
              <CardDescription>
                Cover letter paragraphs to the funder. Appears on the public Case for Support proposal page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Letter Body Paragraphs (One per line)</Label>
                <Textarea
                  value={(grant.customLetterBody || []).join("\n\n")}
                  onChange={(e) => setGrant({
                    ...grant,
                    customLetterBody: e.target.value.split("\n\n").map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Paste letter paragraphs here, separated by double line breaks..."
                  rows={8}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Short Impact Statement (Optional)</Label>
                <Textarea
                  value={grant.impactStatement || ""}
                  onChange={(e) => setGrant({ ...grant, impactStatement: e.target.value })}
                  placeholder="A concise 2-3 sentence summary of the project's transformative impact..."
                  rows={3}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Values Alignment & Need */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Alignment &amp; Narrative Sections</CardTitle>
              <CardDescription>
                Sections render dynamically when text is provided; left blank, they are cleanly hidden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Why KYO Aligns with {grant.funderName}</Label>
                <Textarea
                  value={grant.valuesAlignment || ""}
                  onChange={(e) => setGrant({ ...grant, valuesAlignment: e.target.value })}
                  placeholder="Explain how KYO's mission and programs align with the funder's funding priorities..."
                  rows={4}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Community Need</Label>
                <Textarea
                  value={grant.communityNeed || ""}
                  onChange={(e) => setGrant({ ...grant, communityNeed: e.target.value })}
                  placeholder="Describe the regional youth community need, accessibility gaps, or socio-economic context..."
                  rows={4}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Program Description</Label>
                <Textarea
                  value={grant.programDescription || ""}
                  onChange={(e) => setGrant({ ...grant, programDescription: e.target.value })}
                  placeholder="Detailed description of the funded activities, rehearsal schedules, faculty, and performances..."
                  rows={4}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Organizational Capacity</Label>
                <Textarea
                  value={grant.organizationalCapacity || ""}
                  onChange={(e) => setGrant({ ...grant, organizationalCapacity: e.target.value })}
                  placeholder="Why KYO is well-positioned to deliver: 20+ year track record, faculty credentials, financial oversight..."
                  rows={4}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reporting & Recognition Plans */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reporting &amp; Funder Recognition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Reporting Plan</Label>
                <Textarea
                  value={grant.reportingPlan || ""}
                  onChange={(e) => setGrant({ ...grant, reportingPlan: e.target.value })}
                  placeholder="How KYO will evaluate outcomes, collect participant feedback, and submit reports..."
                  rows={3}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Recognition Plan</Label>
                <Textarea
                  value={grant.recognitionPlan || ""}
                  onChange={(e) => setGrant({ ...grant, recognitionPlan: e.target.value })}
                  placeholder="Concert program acknowledgement, website logo placement, social media announcements..."
                  rows={3}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Signer & Contact Overrides */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Signer &amp; Contact Overrides</CardTitle>
              <CardDescription>Leave blank to use organization defaults (Bryce Porter, Chair)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Signer Name</Label>
                  <Input
                    value={grant.signerName || ""}
                    onChange={(e) => setGrant({ ...grant, signerName: e.target.value })}
                    placeholder="Bryce Porter"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Signer Title</Label>
                  <Input
                    value={grant.signerTitle || ""}
                    onChange={(e) => setGrant({ ...grant, signerTitle: e.target.value })}
                    placeholder="Chair, Board of Directors"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Custom Contact Name</Label>
                  <Input
                    value={grant.contactName || ""}
                    onChange={(e) => setGrant({ ...grant, contactName: e.target.value })}
                    placeholder="e.g. Bryce Porter"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Custom Contact Email</Label>
                  <Input
                    value={grant.contactEmail || ""}
                    onChange={(e) => setGrant({ ...grant, contactEmail: e.target.value })}
                    placeholder="e.g. contactus@thekyo.ca"
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: DOCUMENTS & DRIVE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentTab === "documents" && (
        <div className="space-y-6 pt-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Google Drive Folder &amp; Assets</CardTitle>
              <CardDescription>Managed automatically or manually linked</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Drive Folder URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={grant.driveFolderUrl || ""}
                    onChange={(e) => setGrant({ ...grant, driveFolderUrl: e.target.value })}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="text-xs"
                  />
                  {grant.driveFolderUrl && (
                    <a href={grant.driveFolderUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Case for Support PDF Download URL (Optional)</Label>
                <Input
                  value={grant.caseForSupportPdfUrl || ""}
                  onChange={(e) => setGrant({ ...grant, caseForSupportPdfUrl: e.target.value })}
                  placeholder="/documents/kyo-case-for-support.pdf"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Grant Application PDF URL (Optional)</Label>
                <Input
                  value={grant.grantApplicationPdfUrl || ""}
                  onChange={(e) => setGrant({ ...grant, grantApplicationPdfUrl: e.target.value })}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: SUBMISSION & EVIDENCE (STEP 8) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentTab === "submit" && (
        <div className="space-y-6 pt-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                <span>Application Submission Record</span>
              </CardTitle>
              <CardDescription>
                Confirm completion, record how the grant was submitted, and upload submission evidence directly to this grant&apos;s Google Drive folder. All fields are optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/30 border rounded-xl space-y-3">
                <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(grant.submission?.isComplete)}
                    onChange={(e) =>
                      setGrant({
                        ...grant,
                        submission: { ...(grant.submission || {}), isComplete: e.target.checked },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span>Grant application is complete &amp; submitted (auto-transitions stage to Submitted: Pending Decision)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Submitted On</Label>
                  <Input
                    type="date"
                    value={grant.submission?.submittedOn || grant.submittedOn || ""}
                    onChange={(e) =>
                      setGrant({
                        ...grant,
                        submission: { ...(grant.submission || {}), submittedOn: e.target.value },
                      })
                    }
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Submission Method</Label>
                  <Select
                    value={grant.submission?.submissionMethod || ""}
                    onValueChange={(val) =>
                      setGrant({
                        ...grant,
                        submission: { ...(grant.submission || {}), submissionMethod: val },
                      })
                    }
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select method..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online Portal">Online Portal</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Mail">Mail</SelectItem>
                      <SelectItem value="In Person">In Person</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Confirmation / Reference Number (Optional)</Label>
                <Input
                  value={grant.submission?.confirmationNumber || ""}
                  onChange={(e) =>
                    setGrant({
                      ...grant,
                      submission: { ...(grant.submission || {}), confirmationNumber: e.target.value },
                    })
                  }
                  placeholder="e.g. APP-2026-9482"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Submission Notes / Portal URL (Optional)</Label>
                <Textarea
                  value={grant.submission?.submissionMethodNotes || ""}
                  onChange={(e) =>
                    setGrant({
                      ...grant,
                      submission: { ...(grant.submission || {}), submissionMethodNotes: e.target.value },
                    })
                  }
                  placeholder="e.g. Submitted via funder online portal under account..."
                  rows={3}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-bold">Submission Evidence PDF (Uploaded to Drive)</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = String(reader.result || "");
                      const base64 = result.includes(",") ? result.split(",")[1] : result;
                      setEvidenceFile({ base64, name: file.name });
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="text-xs"
                />
                {evidenceFile && (
                  <p className="text-xs text-primary font-medium">Ready to upload: {evidenceFile.name}</p>
                )}
                {grant.submission?.evidenceFileUrl && (
                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg text-xs border">
                    <span className="font-medium truncate">{grant.submission.evidenceFileName || "Submission-Evidence.pdf"}</span>
                    <a
                      href={grant.submission.evidenceFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline flex items-center gap-1 shrink-0"
                    >
                      Open in Drive <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <Button
                onClick={handleRecordSubmission}
                disabled={isRecordingSubmission}
                className="gap-2 text-xs shadow-sm"
              >
                {isRecordingSubmission ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Submission Record</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: PUBLIC PAGE & PUBLISHING */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentTab === "publish" && (
        <div className="space-y-6 pt-2">
          {/* 4-Step Pre-Publication Wizard */}
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Pre-Publication Checklist</span>
              </CardTitle>
              <CardDescription>
                Review Q&amp;A visibility, budget visibility, and narrative content before publishing the public Case for Support page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-card border rounded-xl flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-foreground">1. Q&amp;A Synced &amp; Visibility Reviewed</p>
                  <p className="text-muted-foreground">
                    {(grant.questions || []).filter((q) => q.publicVisible !== false).length} public,{" "}
                    {(grant.questions || []).filter((q) => q.publicVisible === false).length} hidden
                    {grant.qaLastSyncedAt ? ` • Last synced ${new Date(grant.qaLastSyncedAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href={`/grants/${grantId}/qa`}>Review Q&amp;A</Link>
                </Button>
              </div>

              <div className="p-3 bg-card border rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-foreground">2. Budget Columns &amp; Rows Visibility</p>
                    <p className="text-muted-foreground">
                      {(grant.budgetHeaders || []).length} columns, {(grant.budgetBreakdown || []).length} rows
                    </p>
                  </div>
                </div>
                {(grant.budgetHeaders || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(grant.budgetHeaders || []).map((col) => {
                      const isHidden = (grant.hiddenBudgetColumns || []).includes(col);
                      return (
                        <Button
                          key={col}
                          type="button"
                          variant={isHidden ? "outline" : "secondary"}
                          size="sm"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => {
                            const current = grant.hiddenBudgetColumns || [];
                            const next = isHidden ? current.filter((c) => c !== col) : [...current, col];
                            setGrant({ ...grant, hiddenBudgetColumns: next });
                          }}
                        >
                          {isHidden ? <EyeOff className="w-3 h-3 text-amber-600" /> : <Eye className="w-3 h-3 text-emerald-600" />}
                          <span>{col}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
                {(grant.budgetBreakdown || []).length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1 pt-1 border-t">
                    {(grant.budgetBreakdown || []).map((row, idx) => {
                      const isHidden = row.publicVisible === false;
                      const label = Object.entries(row)
                        .filter(([k]) => k !== "publicVisible")
                        .slice(0, 2)
                        .map(([, v]) => v)
                        .filter(Boolean)
                        .join(" — ") || `Row ${idx + 1}`;
                      return (
                        <div key={idx} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/40">
                          <span className={isHidden ? "line-through text-muted-foreground" : "text-foreground"}>{label}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              const updated = [...(grant.budgetBreakdown || [])];
                              updated[idx] = { ...updated[idx], publicVisible: isHidden ? true : false };
                              setGrant({ ...grant, budgetBreakdown: updated });
                            }}
                          >
                            {isHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-3 bg-card border rounded-xl flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-foreground">3. Narrative Content</p>
                  <p className="text-muted-foreground">
                    Impact Statement: {grant.impactStatement ? "Set" : "Missing"} • Values Alignment: {grant.valuesAlignment ? "Set" : "Missing"}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href={`/grants/${grantId}/content`}>Edit Narrative</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>Public Case for Support Link</span>
              </CardTitle>
              <CardDescription>
                Canonical URL format: <code>/support-us/case-for-support/{grant.id.substring(0, 6)}/{grant.slug}/{new Date(grant.startedAt || grant.createdAt || Date.now()).getFullYear()}</code>
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

                <div className="flex items-center gap-2">
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
                  {grant.published && publicPageUrl && (
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href={publicPageUrl} target="_blank">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Link to Public Page</span>
                      </Link>
                    </Button>
                  )}
                </div>
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
                    placeholder="e.g. vital-communities"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Appended to URL if applying for a specific sub-program (e.g. /cfgp/2026/vital-communities).
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-foreground">Canonical Public URL:</span>
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

              {/* Reapply / Clone for new year */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Renew or Reapply for Next Cycle</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Clones this grant into a new application record while maintaining lineage.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isCloning}
                  onClick={() => handleCloneCycle(false)}
                  className="gap-1.5 text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Clone for New Cycle</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: AUDIT LOG */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentTab === "audit" && (
        <div className="space-y-4 pt-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Immutable Audit Trail</span>
              </CardTitle>
              <CardDescription>
                Read-only event log tracking every change, stage transition, and Google Doc sync.
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
        </div>
      )}
    </div>
  );
}
