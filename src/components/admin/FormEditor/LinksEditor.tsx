
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";

interface LinkItem {
  label: string;
  url: string;
}

interface LinksEditorProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
}

export function LinksEditor({ links, onChange }: LinksEditorProps) {
  const updateLink = (index: number, field: keyof LinkItem, value: string) => {
    const next = [...links];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const addLink = () => onChange([...links, { label: "", url: "" }]);

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 pt-2 border-t mt-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <LinkIcon className="h-3 w-3" /> External Links
      </p>
      <div className="space-y-2">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              placeholder="Label (e.g. Policies)"
              className="h-8 text-sm flex-1"
            />
            <Input
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              placeholder="https://..."
              className="h-8 text-sm flex-[2]"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
              onClick={() => removeLink(i)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLink}
        className="h-7 text-xs gap-1 mt-1"
      >
        <Plus className="h-3 w-3" />
        Add Link
      </Button>
    </div>
  );
}
