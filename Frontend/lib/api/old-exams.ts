import { apiFetch } from "./client";
import type { OldExam, OldExamFilters } from "@/lib/types/old-exams";
import type { PaginatedQuestionsResponse } from "@/lib/types/questions";
import type { QuestionType } from "@/lib/types/questions";

// ─── Old Exams ────────────────────────────────────────────────────────────────

export function getOldExams(
  filters: OldExamFilters = {},
  opts?: RequestInit,
): Promise<OldExam[]> {
  const qs = new URLSearchParams();
  if (filters.moduleId != null) qs.set("moduleId", String(filters.moduleId));
  // `subjectType` on the filter maps to `moduleType` on the backend query param
  if (filters.subjectType) qs.set("moduleType", filters.subjectType);
  if (filters.examType) qs.set("examType", filters.examType);
  const query = qs.toString();
  return apiFetch<OldExam[]>(
    `/questions/old-exams${query ? `?${query}` : ""}`,
    { cache: "no-store", ...opts },
  );
}

export function getOldExam(id: number, opts?: RequestInit): Promise<OldExam> {
  return apiFetch<OldExam>(`/questions/old-exams/${id}`, {
    cache: "no-store",
    ...opts,
  });
}

// ─── Old Exam Questions ───────────────────────────────────────────────────────

export function getOldExamQuestions(
  oldExamId: number,
  page = 1,
  limit = 10,
  questionType?: QuestionType,
  opts?: RequestInit,
): Promise<PaginatedQuestionsResponse> {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (questionType) {
    qs.set("qType", questionType);
  }

  return apiFetch<PaginatedQuestionsResponse>(
    `/questions/old-exams/${oldExamId}/questions?${qs}`,
    {
      cache: "no-store",
      ...opts,
    },
  );
}
