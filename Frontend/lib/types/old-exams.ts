import type { SubjectType } from "@/lib/types/materials";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const EXAM_TYPES = ["final", "midterm", "tpl", "flipped"] as const;

/** Re-export so consumers can import from one place. */
export const SUBJECT_TYPES = ["theoretical", "practical"] as const;

export type ExamType = (typeof EXAM_TYPES)[number];
export type { SubjectType };

// Human-readable labels for use in UI
export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  final: "Final",
  midterm: "Midterm",
  tpl: "TPL",
  flipped: "Flipped",
};

export const SUBJECT_TYPE_LABELS: Record<SubjectType, string> = {
  theoretical: "Theoretical",
  practical: "Practical",
};

// ─── Entity types ─────────────────────────────────────────────────────────────

export interface OldExam {
  id: number;
  examType: ExamType;
  moduleId: number;
  /** Subject type within the module this exam covers (theoretical | practical). */
  moduleType: SubjectType;
  universityId: number;
  year: number;
  createdAt: string;
  module: { id: number; name: string };
  university: { id: number; name: string };
}

// ─── Filter state ─────────────────────────────────────────────────────────────

export interface OldExamFilters {
  moduleId?: number;
  /** Subject type within the module (maps to `moduleType` query param on the API). */
  subjectType?: SubjectType;
  examType?: ExamType;
}
