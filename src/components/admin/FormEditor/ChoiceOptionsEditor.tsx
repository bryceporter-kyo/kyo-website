
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface ChoiceOptionsEditorProps {
  options: string[];
  allowOther: boolean;
  onChange: (options: string[]) => void;
  onAllowOtherChange: (val: boolean) => void;
}

export function ChoiceOptionsEditor({
  options,
  allowOther,
  onChange,
  onAllowOtherChange,
}: ChoiceOptionsEditorProps) {
  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    onChange(next);
  };

  const addOption = () => onChange([...options, `Option ${options.length + 1}`]);

  const removeOption = (index: number) => {
    if (options.length <= 1) return;
    onChange(options.filter((_, i) => i !== index));
  };

  const moveOption = (from: number, to: number) => {
    if (to < 0 || to >= options.length) return;
    const next = [...options];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Options</p>
      <div className="space-y-1.5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <div className="flex flex-col gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => moveOption(i, i - 1)}
                disabled={i === 0}
                className="hover:text-primary disabled:opacity-20 text-muted-foreground"
                aria-label="Move up"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => moveOption(i, i + 1)}
                disabled={i === options.length - 1}
                className="hover:text-primary disabled:opacity-20 text-muted-foreground"
                aria-label="Move down"
              >
                ▼
              </button>
            </div>
            <Input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="h-8 text-sm flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
              onClick={() => removeOption(i)}
              disabled={options.length <= 1}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-7 text-xs gap-1">
          <Plus className="h-3 w-3" />
          Add Option
        </Button>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allowOther}
            onChange={(e) => onAllowOtherChange(e.target.checked)}
            className="rounded"
          />
          Include "Other (please specify)"
        </label>
      </div>
    </div>
  );
}
