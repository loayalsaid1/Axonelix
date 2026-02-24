import { apiFetch } from "./client";
import type {
  Module,
  ModuleName,
  ModuleWithSubjects,
  ModuleHierarchy,
  Subject,
  SubjectWithChapters,
  Chapter,
  ChapterWithLessons,
  Lesson,
  LessonWithHierarchy,
} from "@/lib/types/materials";

// ─── Modules ─────────────────────────────────────────────────────────────────

/** Fetch only id+name for every module – best for filter dropdowns. */
export function getModuleNames(opts?: RequestInit): Promise<ModuleName[]> {
  return apiFetch<ModuleName[]>("/materials/modules/names", {
    next: { revalidate: 60 },
    ...opts,
  });
}

export function getModules(opts?: RequestInit): Promise<ModuleWithSubjects[]> {
  return apiFetch<ModuleWithSubjects[]>("/materials/modules", {
    next: { revalidate: 60 },
    ...opts,
  });
}

export function getModule(
  id: number,
  opts?: RequestInit
): Promise<ModuleWithSubjects> {
  return apiFetch<ModuleWithSubjects>(`/materials/modules/${id}`, {
    next: { revalidate: 60 },
    ...opts,
  });
}

export function getModuleHierarchy(
  id: number,
  opts?: RequestInit
): Promise<ModuleHierarchy> {
  return apiFetch<ModuleHierarchy>(`/materials/modules/${id}/hierarchy`, {
    next: { revalidate: 60 },
    ...opts,
  });
}

// ─── Subjects ────────────────────────────────────────────────────────────────

export function getSubjects(
  moduleId?: number,
  opts?: RequestInit
): Promise<SubjectWithChapters[]> {
  const qs = moduleId ? `?moduleId=${moduleId}` : "";
  return apiFetch<SubjectWithChapters[]>(`/materials/subjects${qs}`, {
    next: { revalidate: 60 },
    ...opts,
  });
}

export function getSubject(
  id: number,
  opts?: RequestInit
): Promise<SubjectWithChapters> {
  return apiFetch<SubjectWithChapters>(`/materials/subjects/${id}`, {
    next: { revalidate: 60 },
    ...opts,
  });
}

export function getSubjectChapters(
  id: number,
  opts?: RequestInit
): Promise<Chapter[]> {
  return apiFetch<Chapter[]>(`/materials/subjects/${id}/chapters`, {
    next: { revalidate: 60 },
    ...opts,
  });
}

// ─── Chapters ────────────────────────────────────────────────────────────────

export function getChapter(
  id: number,
  opts?: RequestInit
): Promise<ChapterWithLessons> {
  return apiFetch<ChapterWithLessons>(`/materials/chapters/${id}`, {
    next: { revalidate: 60 },
    ...opts,
  });
}

export function getChapterLessons(
  id: number,
  opts?: RequestInit
): Promise<Lesson[]> {
  return apiFetch<Lesson[]>(`/materials/chapters/${id}/lessons`, {
    next: { revalidate: 60 },
    ...opts,
  });
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

export function getLesson(
  id: number,
  opts?: RequestInit
): Promise<LessonWithHierarchy> {
  return apiFetch<LessonWithHierarchy>(`/materials/lessons/${id}`, {
    next: { revalidate: 60 },
    ...opts,
  });
}

export function getLessons(
  chapterId?: number,
  opts?: RequestInit
): Promise<Lesson[]> {
  const qs = chapterId ? `?chapterId=${chapterId}` : "";
  return apiFetch<Lesson[]>(`/materials/lessons${qs}`, {
    next: { revalidate: 60 },
    ...opts,
  });
}

export function searchLessons(
  query: string,
  opts?: RequestInit
): Promise<LessonWithHierarchy[]> {
  const qs = `?q=${encodeURIComponent(query)}`;
  return apiFetch<LessonWithHierarchy[]>(`/materials/lessons/search${qs}`, {
    cache: "no-store",
    ...opts,
  });
}

// ─── Re-export raw types so consumers import from one place ──────────────────
export type {
  Module,
  ModuleWithSubjects,
  ModuleHierarchy,
  Subject,
  SubjectWithChapters,
  Chapter,
  ChapterWithLessons,
  Lesson,
  LessonWithHierarchy,
};
