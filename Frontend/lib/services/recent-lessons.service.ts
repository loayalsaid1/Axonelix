/**
 * RecentLessonsService
 *
 * Client-side only — backed by localStorage.
 * Keeps a capped list of recently-visited lessons for the sidebar.
 */

const STORAGE_KEY = "axonelix:recent-lessons";
const MAX_ITEMS = 8;

export interface RecentLesson {
  id: number;
  name: string;
  /** Path segments used to build breadcrumbs / href */
  chapterName: string;
  subjectName: string;
  moduleName: string;
  visitedAt: number; // Unix ms
}

function read(): RecentLesson[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: RecentLesson[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const RecentLessonsService = {
  /** Return all recent lessons, newest first */
  getAll(): RecentLesson[] {
    return read().sort((a, b) => b.visitedAt - a.visitedAt);
  },

  /** Push or update a lesson visit */
  push(lesson: Omit<RecentLesson, "visitedAt">): void {
    const current = read().filter((l) => l.id !== lesson.id);
    const updated: RecentLesson[] = [
      { ...lesson, visitedAt: Date.now() },
      ...current,
    ].slice(0, MAX_ITEMS);
    write(updated);
  },

  /** Remove a single entry */
  remove(id: number): void {
    write(read().filter((l) => l.id !== id));
  },

  /** Clear all */
  clear(): void {
    write([]);
  },
};
