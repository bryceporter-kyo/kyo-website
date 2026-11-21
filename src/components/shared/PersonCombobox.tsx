"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type PersonOption = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  category: "board" | "staff" | "user" | "custom";
};

interface PersonComboboxProps {
  value: string; // The person's name or custom text
  onChange: (name: string, person?: PersonOption) => void;
  options: PersonOption[];
  placeholder?: string;
  className?: string;
}

export function PersonCombobox({
  value,
  onChange,
  options,
  placeholder = "Select or type a name...",
  className,
}: PersonComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.role && p.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isExactMatch = options.some(
    (p) => p.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  // Build the full list of selectable items (filtered + optional custom entry)
  const allItems: Array<PersonOption | { id: "__custom__"; name: string }> = [
    ...filtered,
    ...(searchQuery.trim() && !isExactMatch
      ? [{ id: "__custom__" as const, name: searchQuery.trim() }]
      : []),
  ];

  const selectedPerson = options.find((p) => p.name === value);

  const selectItem = useCallback(
    (item: (typeof allItems)[number]) => {
      if (item.id === "__custom__") {
        onChange(item.name);
      } else {
        onChange(item.name, item as PersonOption);
      }
      setOpen(false);
      setSearchQuery("");
      setHighlightedIndex(0);
    },
    [onChange]
  );

  // Reset highlight when list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Focus input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, allItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (allItems[highlightedIndex]) {
          selectItem(allItems[highlightedIndex]);
        } else if (searchQuery.trim()) {
          onChange(searchQuery.trim());
          setOpen(false);
          setSearchQuery("");
        }
        break;
      case "Escape":
        setOpen(false);
        setSearchQuery("");
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal text-xs h-9",
            className
          )}
        >
          <div className="flex items-center gap-1.5 truncate">
            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value || placeholder}
            </span>
            {selectedPerson && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[9px] px-1 py-0 h-4 font-semibold shrink-0 ml-1",
                  selectedPerson.category === "board"
                    ? "bg-purple-100 text-purple-800"
                    : selectedPerson.category === "staff"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-800"
                )}
              >
                {selectedPerson.category === "board"
                  ? "Board"
                  : selectedPerson.category === "staff"
                  ? "Staff"
                  : "User"}
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0" align="start">
        {/* Search Input */}
        <div className="border-b border-border px-3 py-2">
          <Input
            ref={inputRef}
            placeholder="Type a name to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-xs border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {/* Options List */}
        <div
          ref={listRef}
          className="max-h-56 overflow-y-auto py-1"
          role="listbox"
        >
          {allItems.length === 0 ? (
            <div className="py-3 text-center text-xs text-muted-foreground">
              No people found.
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isCustom = item.id === "__custom__";
              const isHighlighted = idx === highlightedIndex;
              const isSelected = !isCustom && value === item.name;
              const person = isCustom ? null : (item as PersonOption);

              return (
                <div
                  key={item.id === "__custom__" ? "__custom__" : `${(item as PersonOption).category}-${item.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectItem(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 cursor-pointer text-xs transition-colors",
                    isHighlighted ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                    isCustom && "text-blue-600 font-medium"
                  )}
                >
                  {isCustom ? (
                    <span>Use custom name: &ldquo;{item.name}&rdquo;</span>
                  ) : (
                    <div className="flex flex-col truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900 truncate">
                          {item.name}
                        </span>
                        {person && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] px-1 py-0 h-3.5 font-bold uppercase shrink-0",
                              person.category === "board"
                                ? "border-purple-300 text-purple-700 bg-purple-50"
                                : person.category === "staff"
                                ? "border-blue-300 text-blue-700 bg-blue-50"
                                : "border-slate-300 text-slate-700 bg-slate-50"
                            )}
                          >
                            {person.category}
                          </Badge>
                        )}
                      </div>
                      {person && (person.role || person.email) && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {person.role ? `${person.role} • ` : ""}
                          {person.email || ""}
                        </span>
                      )}
                    </div>
                  )}
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
