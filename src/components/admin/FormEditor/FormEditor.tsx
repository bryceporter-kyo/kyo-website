
"use client";

import { useState, useCallback } from "react";
import {
  RegistrationFormConfig,
  FormQuestion,
  QuestionType,
  QUESTION_TYPE_LABELS,
  createEmptyQuestion,
} from "@/lib/registration-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuestionCard } from "./QuestionCard";
import { QuestionTypeIcon } from "./QuestionTypeIcon";
import {
  Plus,
  Save,
  Loader2,
  Eye,
  EyeOff,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_GROUPS: { label: string; types: QuestionType[] }[] = [
  {
    label: "Text Input",
    types: ["short_text", "long_text", "email", "phone", "number", "date"],
  },
  {
    label: "Choice",
    types: ["single_choice", "multiple_choice", "dropdown", "true_false"],
  },
  {
    label: "Other",
    types: ["rating", "file_upload", "section_header"],
  },
];

interface FormEditorProps {
  initialConfig: RegistrationFormConfig;
  onSave: (config: RegistrationFormConfig) => Promise<void>;
  publicUrl: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function FormEditor({ initialConfig, onSave, publicUrl }: FormEditorProps) {
  const [config, setConfig] = useState<RegistrationFormConfig>(initialConfig);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Config-level helpers ────────────────────────────────────────────────────

  const updateConfig = (patch: Partial<RegistrationFormConfig>) =>
    setConfig((c) => ({ ...c, ...patch }));

  // ── Question helpers ────────────────────────────────────────────────────────

  const addQuestion = (type: QuestionType) => {
    const q = createEmptyQuestion(type, config.questions.length);
    setConfig((c) => ({
      ...c,
      questions: [...c.questions, q],
    }));
  };

  const updateQuestion = useCallback((updated: FormQuestion) => {
    setConfig((c) => ({
      ...c,
      questions: c.questions.map((q) => (q.id === updated.id ? updated : q)),
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setConfig((c) => ({
      ...c,
      questions: c.questions
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, order: i })),
    }));
  }, []);

  const moveQuestion = useCallback((id: string, direction: "up" | "down") => {
    setConfig((c) => {
      const qs = [...c.questions];
      const idx = qs.findIndex((q) => q.id === id);
      if (idx < 0) return c;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= qs.length) return c;
      [qs[idx], qs[target]] = [qs[target], qs[idx]];
      return { ...c, questions: qs.map((q, i) => ({ ...q, order: i })) };
    });
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage(null);
    try {
      await onSave(config);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setSaveStatus("error");
      setErrorMessage(err?.message ?? "An unknown error occurred.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Top Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          {/* Open / Closed toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={config.isOpen}
            onClick={() => updateConfig({ isOpen: !config.isOpen })}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              config.isOpen ? "bg-green-500" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                config.isOpen ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
          <div className="flex items-center gap-2">
            {config.isOpen ? (
              <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                <Eye className="h-3 w-3" /> Form Open
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <EyeOff className="h-3 w-3" /> Form Closed
              </Badge>
            )}
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              Preview public form ↗
            </a>
          </Button>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="gap-2"
          size="sm"
        >
          {saveStatus === "saving" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : saveStatus === "saved" ? (
            <><CheckCircle2 className="h-4 w-4 text-green-300" /> Saved!</>
          ) : saveStatus === "error" ? (
            <><AlertCircle className="h-4 w-4" /> Retry Save</>
          ) : (
            <><Save className="h-4 w-4" /> Save Form</>
          )}
        </Button>
      </div>

      {/* Save Error */}
      {saveStatus === "error" && errorMessage && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Form Metadata ── */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-base">Form Settings</CardTitle>
          <CardDescription>Title, description, and the message shown when the form is closed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Form Title
            </label>
            <Input
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              placeholder="e.g. Orchestra Program Registration 2025–26"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Form Description
            </label>
            <Textarea
              value={config.description ?? ""}
              onChange={(e) => updateConfig({ description: e.target.value })}
              placeholder="Introductory text shown at the top of the form..."
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Closed Message
            </label>
            <Textarea
              value={config.closedMessage ?? ""}
              onChange={(e) => updateConfig({ closedMessage: e.target.value })}
              placeholder="Message shown to users when the form is not open..."
              rows={2}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Submission Page Settings ── */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Submission Page
          </CardTitle>
          <CardDescription>
            Configure what users see after they successfully submit the form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Success Title
              </label>
              <Input
                value={config.submissionPage?.title ?? ""}
                onChange={(e) => updateConfig({ 
                  submissionPage: { ...config.submissionPage!, title: e.target.value } 
                })}
                placeholder="e.g. Thank You!"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Redirect Delay (seconds)
              </label>
              <Input
                type="number"
                value={config.submissionPage?.redirectDelaySeconds ?? ""}
                onChange={(e) => updateConfig({ 
                  submissionPage: { ...config.submissionPage!, redirectDelaySeconds: Number(e.target.value) } 
                })}
                placeholder="e.g. 5"
                className="h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Success Message
            </label>
            <Textarea
              value={config.submissionPage?.message ?? ""}
              onChange={(e) => updateConfig({ 
                submissionPage: { ...config.submissionPage!, message: e.target.value } 
              })}
              placeholder="Message shown after submission..."
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Redirect URL (Optional)
            </label>
            <Input
              value={config.submissionPage?.redirectUrl ?? ""}
              onChange={(e) => updateConfig({ 
                submissionPage: { ...config.submissionPage!, redirectUrl: e.target.value } 
              })}
              placeholder="e.g. /orchestras or https://..."
              className="h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Integrations Settings ── */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Integrations
          </CardTitle>
          <CardDescription>
            Connect your form to external services like Google Sheets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Google Sheets Webhook URL
            </label>
            <Input
              value={config.webhookUrl ?? ""}
              onChange={(e) => updateConfig({ webhookUrl: e.target.value })}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="h-9"
            />
            <p className="text-[10px] text-muted-foreground">
              When a submission is received, the data will be sent to this URL as a POST request.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Questions List ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Questions
            <span className="ml-2 text-muted-foreground font-normal">
              ({config.questions.length})
            </span>
          </h2>
        </div>

        {config.questions.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            <p className="text-sm">No questions yet.</p>
            <p className="text-xs mt-1">Click "Add Question" below to get started.</p>
          </div>
        )}

        <div className="space-y-2">
          {config.questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={config.questions.length}
              onChange={updateQuestion}
              onDelete={() => deleteQuestion(q.id)}
              onMoveUp={() => moveQuestion(q.id, "up")}
              onMoveDown={() => moveQuestion(q.id, "down")}
            />
          ))}
        </div>

        {/* ── Add Question Dropdown ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full gap-2 border-dashed">
              <Plus className="h-4 w-4" />
              Add Question
              <ChevronDown className="h-4 w-4 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="center">
            {TYPE_GROUPS.map((group, gi) => (
              <DropdownMenuGroup key={group.label}>
                {gi > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {group.label}
                </DropdownMenuLabel>
                {group.types.map((t) => (
                  <DropdownMenuItem
                    key={t}
                    onClick={() => addQuestion(t)}
                    className="gap-2 cursor-pointer"
                  >
                    <QuestionTypeIcon type={t} />
                    {QUESTION_TYPE_LABELS[t]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Bottom Save ── */}
      {config.questions.length > 3 && (
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={handleSave} disabled={saveStatus === "saving"} className="gap-2">
            {saveStatus === "saving" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="h-4 w-4" /> Save Form</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
