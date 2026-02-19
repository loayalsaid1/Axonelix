"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, BookOpen, Layers, BookMarked, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ModuleHierarchy, Subject, Chapter, Lesson } from "@/lib/types/materials";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HierarchyTreeClientProps {
  modules: ModuleHierarchy[];
}

// ─── Helper: is a given url prefix active in the current path? ───────────────

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

// ─── Leaf row (lesson) ───────────────────────────────────────────────────────

function LessonRow({ lesson }: { lesson: Lesson }) {
  const isActive = useIsActive();
  const href = `/library/lessons/${lesson.id}`;
  const active = isActive(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
      )}
    >
      <File className="opacity-60 size-3.5 shrink-0" />
      <span className="truncate">{lesson.name}</span>
    </Link>
  );
}

// ─── Chapter level ───────────────────────────────────────────────────────────

function ChapterItem({
  chapter,
  defaultOpen,
}: {
  chapter: Chapter & { lessons: Lesson[] };
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isActive = useIsActive();
  const href = `/library/chapters/${chapter.id}`;
  const active = isActive(href);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex justify-center items-center hover:bg-sidebar-accent rounded-sm w-6 h-6 text-sidebar-foreground/50 shrink-0"
          aria-label={open ? "Collapse chapter" : "Expand chapter"}
        >
          <ChevronRight
            className={cn("size-3.5 transition-transform", open && "rotate-90")}
          />
        </button>
        <Link
          href={href}
          className={cn(
            "flex flex-1 items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
            "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
            chapter.isMiscellaneous && "italic opacity-70"
          )}
        >
          <BookMarked className="size-3.5 shrink-0" />
          <span className="truncate">{chapter.name}</span>
          {chapter.lessons.length > 0 && (
            <span className="ml-auto text-sidebar-foreground/40 text-xs">
              {chapter.lessons.length}
            </span>
          )}
        </Link>
      </div>
      {open && chapter.lessons.length > 0 && (
        <div className="space-y-0.5 ml-6 pl-2 border-sidebar-border border-l">
          {chapter.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Subject level ────────────────────────────────────────────────────────────

function SubjectItem({
  subject,
  defaultOpen,
}: {
  subject: Subject & { chapters: Array<Chapter & { lessons: Lesson[] }> };
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isActive = useIsActive();
  const href = `/library/subjects/${subject.id}`;
  const active = isActive(href);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex justify-center items-center hover:bg-sidebar-accent rounded-sm w-6 h-6 text-sidebar-foreground/50 shrink-0"
          aria-label={open ? "Collapse subject" : "Expand subject"}
        >
          <ChevronRight
            className={cn("size-3.5 transition-transform", open && "rotate-90")}
          />
        </button>
        <Link
          href={href}
          className={cn(
            "flex flex-1 items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          )}
        >
          <Layers className="size-3.5 shrink-0" />
          <span className="truncate">{subject.name}</span>
          <Badge
            variant="outline"
            className={cn(
              "ml-auto uppercase",
              subject.type === "theoretical"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-500"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
            )}
          >
            {subject.type === "theoretical" ? "TH" : "PR"}
          </Badge>
        </Link>
      </div>
      {open && subject.chapters.length > 0 && (
        <div className="space-y-0.5 ml-6 pl-2 border-sidebar-border border-l">
          {subject.chapters.map((chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              defaultOpen={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Module level ─────────────────────────────────────────────────────────────

function ModuleItem({ module, defaultOpen }: { module: ModuleHierarchy; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const isActive = useIsActive();
  const href = `/library/modules/${module.id}`;
  const active = isActive(href);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex justify-center items-center hover:bg-sidebar-accent rounded-sm w-6 h-6 text-sidebar-foreground/50 shrink-0"
          aria-label={open ? "Collapse module" : "Expand module"}
        >
          <ChevronRight
            className={cn("size-3.5 transition-transform", open && "rotate-90")}
          />
        </button>
        <Link
          href={href}
          className={cn(
            "flex flex-1 items-center gap-2 px-2 py-1.5 rounded-md font-medium text-sm transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            active && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <BookOpen className="size-3.5 shrink-0" />
          <span className="truncate">{module.name}</span>
        </Link>
      </div>
      {open && module.subjects.length > 0 && (
        <div className="space-y-0.5 ml-6 pl-2 border-sidebar-border border-l">
          {module.subjects.map((subject) => (
            <SubjectItem
              key={subject.id}
              subject={subject}
              defaultOpen={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function HierarchyTreeClient({ modules }: HierarchyTreeClientProps) {
  const pathname = usePathname();

  // Auto-open the module whose path is currently active
  function isModuleActive(module: ModuleHierarchy): boolean {
    if (pathname.includes(`/modules/${module.id}`)) return true;
    return module.subjects.some(
      (s) =>
        pathname.includes(`/subjects/${s.id}`) ||
        s.chapters.some(
          (c) =>
            pathname.includes(`/chapters/${c.id}`) ||
            c.lessons.some((l) => pathname.includes(`/lessons/${l.id}`))
        )
    );
  }

  if (modules.length === 0) {
    return (
      <p className="px-3 py-2 text-sidebar-foreground/40 text-xs">
        No modules found.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {modules.map((module) => (
        <ModuleItem
          key={module.id}
          module={module}
          defaultOpen={isModuleActive(module)}
        />
      ))}
    </div>
  );
}
