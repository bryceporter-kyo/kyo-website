
"use client";

import { useState } from "react";
import { FormQuestion, QuestionType, QUESTION_TYPE_LABELS, createEmptyQuestion } from "@/lib/registration-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionTypeIcon } from "./QuestionTypeIcon";
import { ChoiceOptionsEditor } from "./ChoiceOptionsEditor";
import { LinksEditor } from "./LinksEditor";
import { QuestionImageEditor } from "./QuestionImageEditor";
import { Trash2, ChevronUp, ChevronDown, GripVertical, ChevronDown as Collapse, Image as ImageIcon, Link as LinkIcon, Info } from "lucide-react";
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

const HAS_OPTIONS: QuestionType[] = ["single_choice", "multiple_choice", "dropdown"];
const HAS_PLACEHOLDER: QuestionType[] = ["short_text", "long_text", "email", "phone", "number"];
const HAS_RANGE: QuestionType[] = ["number", "rating"];

interface QuestionCardProps {
  question: FormQuestion;
  index: number;
  total: number;
  onChange: (updated: FormQuestion) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function QuestionCard({
  question,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(true);

  const update = (patch: Partial<FormQuestion>) => onChange({ ...question, ...patch });

  const handleTypeChange = (type: QuestionType) => {
    const fresh = createEmptyQuestion(type, question.order);
    onChange({
      ...fresh,
      id: question.id,
      label: question.label,
      helpText: question.helpText,
      required: question.required,
      order: question.order,
    });
  };

  const isSectionHeader = question.type === "section_header";

  return (
    <Card
      className={cn(
        "transition-all duration-200 border-l-4",
        isSectionHeader ? "border-l-muted-foreground/30 bg-muted/30" : "border-l-primary/40 hover:border-l-primary"
      )}
    >
      {/* ── Card Header / Collapsed View ── */}
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-3">
          {/* Drag handle / order indicator */}
          <div className="flex flex-col items-center gap-0 text-muted-foreground/40">
            <GripVertical className="h-4 w-4" />
            <span className="text-[10px] font-mono">{index + 1}</span>
          </div>

          {/* Type icon + label */}
          <div
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpanded((e) => !e)}
          >
            <span className="text-primary flex-shrink-0">
              <QuestionTypeIcon type={question.type} />
            </span>
            <span className="font-medium text-sm truncate">
              {question.label || (
                <span className="text-muted-foreground italic">Untitled question</span>
              )}
            </span>
            <Badge variant="outline" className="text-[10px] flex-shrink-0 hidden sm:inline-flex">
              {QUESTION_TYPE_LABELS[question.type]}
            </Badge>
            {question.required && (
              <Badge variant="destructive" className="text-[10px] flex-shrink-0">
                Required
              </Badge>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={onMoveUp}
              disabled={index === 0}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={onMoveDown}
              disabled={index === total - 1}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              title="Delete question"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setExpanded((e) => !e)}
              title={expanded ? "Collapse" : "Expand"}
            >
              <Collapse className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* ── Expanded Edit Fields ── */}
      {expanded && (
        <CardContent className="pt-0 pb-4 px-4 space-y-4 border-t">
          {/* Question Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Question Type
              </label>
              <Select value={question.type} onValueChange={(v) => handleTypeChange(v as QuestionType)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_GROUPS.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel className="text-xs">{group.label}</SelectLabel>
                      {group.types.map((t) => (
                        <SelectItem key={t} value={t} className="text-sm">
                          <div className="flex items-center gap-2">
                            <QuestionTypeIcon type={t} />
                            {QUESTION_TYPE_LABELS[t]}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Required Toggle */}
            {!isSectionHeader && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Required
                </label>
                <div className="flex items-center gap-3 h-9">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={question.required}
                    onClick={() => update({ required: !question.required })}
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      question.required ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                        question.required ? "translate-x-4" : "translate-x-0.5"
                      )}
                    />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {question.required ? "This field is required" : "Optional"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Question Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isSectionHeader ? "Section Title" : "Question Label"}
            </label>
            <Input
              value={question.label}
              onChange={(e) => update({ label: e.target.value })}
              placeholder={isSectionHeader ? "e.g. Student Information" : "e.g. What is your full name?"}
              className="h-9"
            />
          </div>

          {/* Help Text / Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isSectionHeader ? "Section Description" : "Help Text"}
              </label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="h-2.5 w-2.5" /> Supports Markdown
              </span>
            </div>
            <Textarea
              value={question.helpText ?? ""}
              onChange={(e) => update({ helpText: e.target.value })}
              placeholder={
                isSectionHeader
                  ? "Optional description shown beneath the section title"
                  : "Optional hint displayed below the input"
              }
              className="min-h-[80px] text-sm resize-y"
            />
          </div>

          {/* Image Upload Attachment */}
          <QuestionImageEditor
            imageUrl={question.imageUrl}
            questionId={question.id}
            onChange={(url) => update({ imageUrl: url })}
          />

          {/* Links Attachment */}
          <LinksEditor 
            links={question.links ?? []} 
            onChange={(links) => update({ links })} 
          />

          {/* Placeholder (text-based types) */}
          {HAS_PLACEHOLDER.includes(question.type) && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Placeholder Text
              </label>
              <Input
                value={question.placeholder ?? ""}
                onChange={(e) => update({ placeholder: e.target.value })}
                placeholder="Shown inside the input before the user types"
                className="h-9"
              />
            </div>
          )}

          {/* Min / Max (number, rating) */}
          {HAS_RANGE.includes(question.type) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Minimum
                </label>
                <Input
                  type="number"
                  value={question.min ?? ""}
                  onChange={(e) =>
                    update({ min: e.target.value === "" ? undefined : Number(e.target.value) })
                  }
                  placeholder={question.type === "rating" ? "1" : "0"}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Maximum
                </label>
                <Input
                  type="number"
                  value={question.max ?? ""}
                  onChange={(e) =>
                    update({ max: e.target.value === "" ? undefined : Number(e.target.value) })
                  }
                  placeholder={question.type === "rating" ? "5" : ""}
                  className="h-9"
                />
              </div>
            </div>
          )}

          {/* File Upload settings */}
          {question.type === "file_upload" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Accepted File Types
                </label>
                <Input
                  value={question.acceptedFileTypes ?? ""}
                  onChange={(e) => update({ acceptedFileTypes: e.target.value })}
                  placeholder=".pdf,.doc,.docx,.jpg,.png"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Max File Size (MB)
                </label>
                <Input
                  type="number"
                  value={question.maxFileSizeMb ?? ""}
                  onChange={(e) =>
                    update({
                      maxFileSizeMb: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="10"
                  className="h-9"
                />
              </div>
            </div>
          )}

          {/* Choice Options Editor */}
          {HAS_OPTIONS.includes(question.type) && (
            <ChoiceOptionsEditor
              options={question.options ?? []}
              allowOther={question.allowOther ?? false}
              onChange={(opts) => update({ options: opts })}
              onAllowOtherChange={(val) => update({ allowOther: val })}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
