"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Globe,
  RefreshCw,
  Save,
  Send,
  Shield,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TourStep {
  id: number;
  tab: "overview" | "qa" | "financials" | "content" | "documents" | "publish" | "submit" | "audit";
  target: string;
  title: string;
  description: string;
  pointerLabel: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    tab: "overview",
    target: "header-stage",
    title: "1. Grant Identity, Stage & Save",
    description:
      "Every grant starts on 1. Overview & Dates. Use the Stage dropdown to track pipeline status and click Save Changes after editing dates or owner details.",
    pointerLabel: "Stage Dropdown & Save",
  },
  {
    id: 2,
    tab: "qa",
    target: "csv-templates",
    title: "2. Download & Import CSV Templates",
    description:
      "On 2. Workspace & Sync, download the Questions CSV and Budget CSV templates. Format your funder's instructions with AI, then upload both CSVs here.",
    pointerLabel: "Download & Upload CSVs",
  },
  {
    id: 3,
    tab: "qa",
    target: "generate-workspace",
    title: "3. Generate Google Doc, Sheet & LOI",
    description:
      "Click 'Generate Workspace in Drive' to create the linked Google Doc (Q&A + Case for Support Narrative) and Budget Sheet. Or skip CSVs using the blank file buttons below.",
    pointerLabel: "Creates Files in Drive",
  },
  {
    id: 4,
    tab: "qa",
    target: "sync-portal",
    title: "4. Sync with Portal",
    description:
      "After drafting answers, narrative sections, and budget rows in Google Workspace, click 'Sync with Portal' to pull everything into the portal at once.",
    pointerLabel: "Pulls Doc + Sheet",
  },
  {
    id: 5,
    tab: "financials",
    target: "financials-card",
    title: "5. Budget & Financials",
    description:
      "Track Amount Requested, Amount Awarded, Funding Type, and Funds Restrictions on 3. Budget & Financials (also synced from the Google Doc tables).",
    pointerLabel: "Award & Restrictions",
  },
  {
    id: 6,
    tab: "content",
    target: "content-card",
    title: "6. Case for Support Narrative",
    description:
      "All narrative sections on 4. Case for Support are synced directly from the Google Doc's Case for Support Narrative table—no need to edit them twice.",
    pointerLabel: "Synced from Google Doc",
  },
  {
    id: 7,
    tab: "documents",
    target: "documents-card",
    title: "7. Documents & Drive",
    description:
      "The grant's Google Drive folder is linked automatically when you generate the workspace—you don't need to do anything here unless you want to attach extra PDFs.",
    pointerLabel: "Auto-Linked Drive Folder",
  },
  {
    id: 8,
    tab: "publish",
    target: "publish-checklist",
    title: "8. Pre-Publication Checklist",
    description:
      "On 6. Public Page, review Q&A visibility, toggle visibility on specific budget columns or rows, and click Publish Public Page. Once published, a Link to Public Page appears here and in the main /grants table.",
    pointerLabel: "Review & Publish",
  },
  {
    id: 9,
    tab: "submit",
    target: "submission-form",
    title: "9. Record Submission & Archive PDF",
    description:
      "On 7. Submission, checking 'Mark as Complete' automatically moves the stage to Submitted: Pending Decision. You can set the Submitted On date manually, and uploading a PDF to Drive is optional.",
    pointerLabel: "Optional PDF & Date",
  },
  {
    id: 10,
    tab: "audit",
    target: "audit-card",
    title: "10. Immutable Audit Log",
    description:
      "Every stage change, Workspace sync, and submission upload is recorded in the Audit Log.",
    pointerLabel: "Full History",
  },
];

const TABS = [
  { id: "overview", label: "1. Overview & Dates" },
  { id: "qa", label: "2. Workspace & Sync" },
  { id: "financials", label: "3. Budget & Financials" },
  { id: "content", label: "4. Case for Support" },
  { id: "documents", label: "5. Documents & Drive" },
  { id: "publish", label: "6. Public Page" },
  { id: "submit", label: "7. Submission" },
  { id: "audit", label: "Audit Log" },
] as const;

export default function GrantsTrainingPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = TOUR_STEPS[stepIndex];

  const highlightClass = (targetName: string) =>
    currentStep.target === targetName
      ? "relative ring-2 ring-primary ring-offset-4 ring-offset-background rounded-xl transition-all duration-200 z-20"
      : "opacity-55 transition-opacity duration-200";

  return (
    <div className="space-y-6 relative pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground text-[10px]">Interactive Walkthrough</Badge>
            <span className="text-xs text-muted-foreground">Template Grantor: Azrieli Foundation</span>
          </div>
          <h2 className="text-xl font-bold font-headline text-foreground mt-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Grants Portal Guided Tour</span>
          </h2>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
          <Link href="/grants">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Live Pipeline</span>
          </Link>
        </Button>
      </div>

      <div className="border rounded-2xl bg-background p-4 sm:p-6 space-y-6 shadow-sm">
        {/* Top Banner */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${highlightClass("header-stage")}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 px-2 pointer-events-none">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Pipeline
              </Button>
              <Badge variant="outline" className="text-xs bg-muted/40 font-mono">ID: TEMPLATE</Badge>
            </div>
            <h2 className="text-2xl font-bold font-headline text-foreground">
              Azrieli Foundation — Upbeat! Youth Strings
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Stage: <strong>Drafting</strong></span>
              <span>•</span>
              <span>Assignee: <strong>director@thekyo.ca</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-[180px] h-9 px-3 border rounded-md flex items-center text-xs font-semibold bg-card">
              Drafting
            </div>
            <Button size="sm" className="gap-1.5 h-9 shadow-sm pointer-events-none">
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>

        {/* 8-Tab Navigation */}
        <div className="border-b">
          <div className="flex items-center gap-1 overflow-x-auto pb-px text-sm font-medium">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  const idx = TOUR_STEPS.findIndex((s) => s.tab === t.id);
                  if (idx !== -1) setStepIndex(idx);
                }}
                className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                  currentStep.tab === t.id
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {currentStep.tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Grant Identity</CardTitle>
                <CardDescription>Primary linkages and ownership</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs font-bold">Funder Name</Label>
                  <Input value="Azrieli Foundation" readOnly className="bg-muted/40 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold">Grant Program Name</Label>
                  <Input value="" placeholder="e.g. Vital Communities Grant" readOnly className="text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold">Specific Grant Name (Optional)</Label>
                  <Input value="Upbeat! Youth Strings" readOnly className="text-xs mt-1" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Critical Dates</CardTitle>
                <CardDescription>Deadlines, submissions, and decision milestones</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <Label className="text-xs font-bold">Application Deadline</Label>
                  <Input value="2026-12-15" readOnly className="text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold">Expected Decision Date</Label>
                  <Input value="2027-02-01" readOnly className="text-xs mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep.tab === "qa" && (
          <div className="space-y-6 pt-2">
            <Card className={`border-primary/30 bg-primary/[0.02] ${highlightClass("csv-templates")}`}>
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
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl pointer-events-none">
                    <FileSpreadsheet className="w-4 h-4" /> Questions CSV Template &amp; Import
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl pointer-events-none">
                    <FileSpreadsheet className="w-4 h-4" /> Budget CSV Template &amp; Import
                  </Button>
                  <div className={highlightClass("generate-workspace")}>
                    <Button size="sm" className="gap-2 text-xs shadow-sm pointer-events-none">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Generate Workspace in Drive</span>
                    </Button>
                  </div>
                </div>
                <div className="pt-2 border-t space-y-2">
                  <p className="text-xs font-semibold text-foreground">Or skip CSVs and generate blank files directly:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs pointer-events-none">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Generate Questions Document</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs pointer-events-none">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Generate Budget File</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs pointer-events-none">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Generate LOI</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs pointer-events-none">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Generate Free-Response LOI</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-primary/20 bg-primary/[0.02] ${highlightClass("sync-portal")}`}>
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
                  <Button size="sm" className="gap-2 shadow-sm text-xs pointer-events-none">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync with Portal</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 shadow-sm text-xs pointer-events-none">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Push Questions to Doc</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs pointer-events-none">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Q&amp;A Doc</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs pointer-events-none">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Budget Sheet</span>
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">Already have Q&amp;A or Budget Files?</span>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep.tab === "financials" && (
          <Card className={highlightClass("financials-card")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span>Award Structure &amp; Allocations</span>
              </CardTitle>
              <CardDescription>Requested sums, awarded amounts, and restrictions</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <Label className="text-xs font-bold">Amount Requested ($CAD)</Label>
                <Input value="25000" readOnly className="text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs font-bold">Amount Awarded ($CAD)</Label>
                <Input value="0" readOnly className="text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs font-bold">Funding Type</Label>
                <Input value="One-time grant" readOnly className="text-xs mt-1" />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep.tab === "content" && (
          <Card className={highlightClass("content-card")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Case for Support Narrative</CardTitle>
              <CardDescription>Synced automatically from the Google Doc&apos;s Case for Support Narrative table</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 border rounded-lg">Letter to Organization: Synced</div>
              <div className="p-3 border rounded-lg">Short Impact Statement: Synced</div>
              <div className="p-3 border rounded-lg">Why KYO Aligns with Azrieli Foundation: Synced</div>
            </CardContent>
          </Card>
        )}

        {currentStep.tab === "documents" && (
          <Card className={highlightClass("documents-card")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Google Drive Folder &amp; Assets</CardTitle>
              <CardDescription>Linked automatically when workspace files are generated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <Label className="text-xs font-bold">Drive Folder URL</Label>
                <Input value="https://drive.google.com/drive/folders/..." readOnly className="text-xs mt-1" />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep.tab === "publish" && (
          <Card className={`border-primary/20 bg-primary/[0.02] ${highlightClass("publish-checklist")}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Pre-Publication Checklist</span>
              </CardTitle>
              <CardDescription>
                Review Q&amp;A visibility, budget visibility, and narrative content before publishing the public Case for Support page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 bg-card border rounded-xl flex items-center justify-between">
                <span>1. Q&amp;A Synced &amp; Visibility Reviewed (8 public, 1 hidden)</span>
                <Eye className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="p-3 bg-card border rounded-xl flex items-center justify-between">
                <span>2. Budget Columns &amp; Rows Visibility (3 columns, 10 rows)</span>
                <EyeOff className="w-4 h-4 text-amber-600" />
              </div>
              <div className="p-3 bg-card border rounded-xl flex items-center justify-between">
                <span>3. Narrative Content (Synced from Google Doc)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="pt-2 flex items-center gap-2">
                <Button size="sm" className="gap-1.5 text-xs pointer-events-none">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Publish Public Page</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs pointer-events-none">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Link to Public Page</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep.tab === "submit" && (
          <Card className={highlightClass("submission-form")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                <span>Application Submission Record</span>
              </CardTitle>
              <CardDescription>
                Confirm completion, record how the grant was submitted, and optionally upload submission evidence to Google Drive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-muted/30 border rounded-xl font-semibold">
                Mark as Complete (auto-transitions stage to Submitted: Pending Decision)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold">Submitted On (Manual Date)</Label>
                  <Input value="2026-12-10" readOnly className="text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold">Submission Method</Label>
                  <Input value="Online Portal" readOnly className="text-xs mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold">Submission Evidence PDF (Optional, Uploaded to Drive)</Label>
                <div className="p-3 bg-muted/40 rounded-lg border mt-1 flex items-center justify-between">
                  <span>Azrieli-Submission-2026.pdf</span>
                  <span className="text-primary underline flex items-center gap-1">
                    Open in Drive <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
              <Button size="sm" className="gap-2 text-xs shadow-sm pointer-events-none">
                <Save className="w-3.5 h-3.5" />
                <span>Save Submission Record</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep.tab === "audit" && (
          <Card className={highlightClass("audit-card")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Immutable Audit Trail</span>
              </CardTitle>
              <CardDescription>Read-only event log tracking every change, stage transition, and Google Doc sync.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <div className="p-2.5 border rounded-lg">Synced 8 Q&amp;A rows and 10 budget rows from Google Workspace.</div>
              <div className="p-2.5 border rounded-lg">Generated Google Doc and Budget Sheet from CSV import.</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Guided Tour Dialogue */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl bg-card border-2 border-primary/40 shadow-2xl rounded-2xl p-4 z-40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wide">
              Step {stepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <h4 className="text-sm font-bold text-foreground">{currentStep.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{currentStep.description}</p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t">
          <div className="flex gap-1">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setStepIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              className="text-xs h-8 gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
            {stepIndex < TOUR_STEPS.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setStepIndex((i) => Math.min(TOUR_STEPS.length - 1, i + 1))}
                className="text-xs h-8 gap-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button asChild size="sm" className="text-xs h-8 gap-1">
                <Link href="/grants">
                  <span>Finish Tour</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
