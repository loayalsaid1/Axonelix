"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, X } from "lucide-react";
import {
  RecentLessonsService,
  type RecentLesson,
} from "@/lib/services/recent-lessons.service";

export function RecentLessonsPanel() {
  const [lessons, setLessons] = useState<RecentLesson[]>([]);

  // Read from localStorage on mount (client only)
  useEffect(() => {
    setLessons(RecentLessonsService.getAll());
  }, []);

  if (lessons.length === 0) return null;

  function handleRemove(id: number, e: React.MouseEvent) {
    e.preventDefault();
    RecentLessonsService.remove(id);
    setLessons(RecentLessonsService.getAll());
  }

  return (
    <div className="space-y-1">
      <p className="px-3 py-1 font-semibold text-[10px] text-sidebar-foreground/40 uppercase tracking-widest">
        Recent
      </p>
      {lessons.slice(0, 5).map((lesson) => (
        <div key={lesson.id} className="flex items-center group">
          <Link
            href={`/library/lessons/${lesson.id}`}
            className="flex flex-1 items-center gap-2 hover:bg-sidebar-accent px-3 py-1.5 rounded-md text-sidebar-foreground/70 text-sm transition-colors hover:text-sidebar-accent-foreground"
          >
            <Clock className="opacity-50 size-3.5 shrink-0" />
            <span className="truncate">{lesson.name}</span>
          </Link>
          <button
            onClick={(e) => handleRemove(lesson.id, e)}
            className="items-center justify-center hidden mr-1 transition-colors rounded group-hover:flex size-5 text-sidebar-foreground/30 hover:text-sidebar-foreground"
            aria-label="Remove from recent"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
