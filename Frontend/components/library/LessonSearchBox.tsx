"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, File } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchLessons } from "@/lib/api/materials";
import type { LessonWithHierarchy } from "@/lib/types/materials";

// ─── helpers ─────────────────────────────────────────────────────────────────

function lessonBreadcrumb(lesson: LessonWithHierarchy): string {
  const { chapter } = lesson;
  const { subject } = chapter;
  const { module } = subject;
  return [module.name, subject.name, chapter.name].join(" › ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LessonSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LessonWithHierarchy[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── debounced search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchLessons(trimmed);
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateTo(id: number) {
    router.push(`/library/lessons/${id}`);
    setQuery("");
    setOpen(false);
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative border-sidebar-border border-b">
      <Command
        shouldFilter={false}
        className="bg-transparent rounded-none"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQuery("");
            setOpen(false);
          }
        }}
      >
        {/* Input row */}
        <div className="relative px-3 py-2">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            placeholder="Search lessons…"
            className="h-7 text-sm"
          />
          {loading && (
            <Loader2 className="top-1/2 right-5 absolute size-3.5 text-sidebar-foreground/50 -translate-y-1/2 animate-spin pointer-events-none" />
          )}
        </div>

        {/* Floating dropdown */}
        {open && (
          <div className="right-3 left-3 z-50 absolute bg-popover shadow-lg border border-sidebar-border rounded-md overflow-hidden">
            <CommandList>
              <CommandEmpty className="py-4 text-xs">
                No lessons found
              </CommandEmpty>
              <CommandGroup>
                {results.map((lesson) => (
                  <CommandItem
                    key={lesson.id}
                    value={String(lesson.id)}
                    onSelect={() => navigateTo(lesson.id)}
                    className="flex items-start gap-2.5 px-3 py-2 cursor-pointer"
                  >
                    <File className="mt-0.5 size-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{lesson.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {lessonBreadcrumb(lesson)}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}