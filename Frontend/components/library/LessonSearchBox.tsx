"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, File, Search } from "lucide-react";
import {
  Command,
  CommandDialog,
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
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LessonWithHierarchy[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);

  // ── debounced fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const token = await getToken();
        const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const data = await searchLessons(trimmed, opts);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, getToken]);

  function handleSelectLesson(id: number) {
    router.push(`/library/lessons/${id}`);
    setOpen(false);
  }

  // keep input focused when opened; clear query/results when closed
  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (value) {
      // focus input on next tick
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setResults([]);
      setLoading(false);
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="p-3 border-sidebar-border border-b">
        <div className="flex items-center gap-2 bg-sidebar-accent/30 px-3 py-1.5 border border-sidebar-border rounded-md text-sidebar-foreground/50 text-sm">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 w-full text-left"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <Search className="size-3.5 shrink-0" />
            <span>Search lessons…</span>
          </button>
        </div>
      </div>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>

        <Command
          shouldFilter={false}
          className="bg-transparent rounded-none overflow-visible"
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
        >
          <CommandInput
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Search lessons…"
            className="text-sm"
          />

          {/* {open && (
          <div className="top-full right-0 left-0 z-50 absolute bg-popover shadow-md mt-1 border border-border rounded-md overflow-hidden"> */}
          <CommandList>
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-4 text-muted-foreground text-xs">
                <Loader2 className="size-3.5 animate-spin shrink-0" />
                Searching…
              </div>
            ) : results.length === 0 ? (
              <CommandEmpty>No lessons found</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((lesson) => (
                  <CommandItem
                    key={lesson.id}
                    value={String(lesson.id)}
                    onSelect={() => handleSelectLesson(lesson.id)}
                    className="items-start gap-2.5 px-3 py-2 cursor-pointer"
                  >
                    <File className="mt-0.5 size-3.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{lesson.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {lessonBreadcrumb(lesson)}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>

    </>
  );
}
