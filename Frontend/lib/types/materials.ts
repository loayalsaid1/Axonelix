// ─── Core entity types matching backend schema ───────────────────────────────

/** Lightweight module reference – used in filter dropdowns. */
export interface ModuleName {
  id: number;
  name: string;
  accessStatus?: 'owned' | 'locked';
}

export interface Module {
  id: number;
  name: string;
  description: string | null;
  accessStatus?: 'owned' | 'locked';
  orderIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

export type SubjectType = "theoretical" | "practical";

export interface Subject {
  id: number;
  moduleId: number;
  name: string;
  type: SubjectType;
  description: string | null;
  orderIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: number;
  subjectId: number;
  name: string;
  description: string | null;
  isMiscellaneous: boolean;
  orderIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: number;
  chapterId: number;
  name: string;
  description: string | null;
  content: Record<string, unknown> | null;
  orderIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Enriched / relational types ─────────────────────────────────────────────

export interface SubjectWithChapters extends Subject {
  module: Pick<Module, "id" | "name">;
  chapters: Chapter[];
}

export interface ChapterWithLessons extends Chapter {
  subject: Pick<Subject, "id" | "name" | "type"> & {
    module: Pick<Module, "id" | "name">;
  };
  lessons: Lesson[];
}

export interface LessonWithHierarchy extends Lesson {
  chapter: Pick<Chapter, "id" | "name"> & {
    subject: Pick<Subject, "id" | "name" | "type"> & {
      module: Pick<Module, "id" | "name">;
    };
  };
}

// Module with direct subjects
export interface ModuleWithSubjects extends Module {
  subjects: Subject[];
}

// Full hierarchy tree
export interface ModuleHierarchy extends Module {
  subjects: Array<
    Subject & {
      chapters: Array<
        Chapter & {
          lessons: Lesson[];
        }
      >;
    }
  >;
}

// Subject with chapters and lessons per chapter (sidebar tree)
export interface SubjectHierarchy extends Subject {
  chapters: Array<Chapter & { lessons: Lesson[] }>;
}
