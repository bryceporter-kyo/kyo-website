"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading3, 
  Quote, 
  Minus, 
  Eye, 
  Edit3 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write narrative discussion, summary, notes, or report highlights...",
  minHeight = "160px",
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const replacement = `${prefix}${selectedText || "text"}${suffix}`;
    const nextValue = `${beforeText}${replacement}${afterText}`;
    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      );
    }, 0);
  };

  const handleBold = () => insertFormatting("**", "**");
  const handleItalic = () => insertFormatting("*", "*");
  const handleHeading = () => insertFormatting("### ");
  const handleBulletList = () => insertFormatting("- ");
  const handleNumberedList = () => insertFormatting("1. ");
  const handleQuote = () => insertFormatting("> ");
  const handleDivider = () => insertFormatting("\n---\n");

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-white shadow-sm", className)}>
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-slate-50/80 px-2 py-1 gap-1">
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBold}
            disabled={activeTab === "preview"}
            className="h-7 w-7 p-0 text-slate-700 hover:bg-slate-200"
            title="Bold (**text**)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            disabled={activeTab === "preview"}
            className="h-7 w-7 p-0 text-slate-700 hover:bg-slate-200"
            title="Italic (*text*)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleHeading}
            disabled={activeTab === "preview"}
            className="h-7 w-7 p-0 text-slate-700 hover:bg-slate-200"
            title="Heading (### text)"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-[1px] bg-slate-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBulletList}
            disabled={activeTab === "preview"}
            className="h-7 w-7 p-0 text-slate-700 hover:bg-slate-200"
            title="Bullet List (- item)"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNumberedList}
            disabled={activeTab === "preview"}
            className="h-7 w-7 p-0 text-slate-700 hover:bg-slate-200"
            title="Numbered List (1. item)"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleQuote}
            disabled={activeTab === "preview"}
            className="h-7 w-7 p-0 text-slate-700 hover:bg-slate-200"
            title="Blockquote (> text)"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDivider}
            disabled={activeTab === "preview"}
            className="h-7 w-7 p-0 text-slate-700 hover:bg-slate-200"
            title="Divider (---)"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* View / Edit Mode Toggles */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={activeTab === "edit" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("edit")}
            className="h-6 px-2 text-[11px] font-medium gap-1"
          >
            <Edit3 className="h-3 w-3" />
            Write
          </Button>
          <Button
            type="button"
            variant={activeTab === "preview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("preview")}
            className="h-6 px-2 text-[11px] font-medium gap-1"
          >
            <Eye className="h-3 w-3" />
            Preview
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === "edit" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-3 text-xs md:text-sm font-sans focus:outline-none resize-y leading-relaxed bg-white text-slate-800"
        />
      ) : (
        <div
          style={{ minHeight }}
          className="p-3 prose prose-xs max-w-none text-slate-800 bg-slate-50/30 overflow-y-auto whitespace-pre-wrap leading-relaxed"
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {value}
            </ReactMarkdown>
          ) : (
            <span className="text-xs text-muted-foreground italic">No discussion notes entered yet.</span>
          )}
        </div>
      )}
    </div>
  );
}
