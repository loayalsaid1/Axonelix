"use client";

import { useEffect } from "react";
import { RecentLessonsService } from "@/lib/services/recent-lessons.service";
import type { LessonWithHierarchy } from "@/lib/types/materials";

/**
 * Invisible component that registers the lesson visit in localStorage.
 */
export function RecentLessonTracker({ lesson }: { lesson: LessonWithHierarchy }) {
  useEffect(() => {
    RecentLessonsService.push({
      id: lesson.id,
      name: lesson.name,
      chapterName: lesson.chapter.name,
      subjectName: lesson.chapter.subject.name,
      moduleName: lesson.chapter.subject.module.name,
    });
  }, [lesson]);

  return null;
}
