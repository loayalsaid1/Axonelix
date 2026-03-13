import { apiFetch } from "@/lib/api/client";
import type { PaginatedQuestionsResponse } from "@/lib/types/questions";

export interface QuestionOptionInput {
  optionText: string;
  isCorrect: boolean;
}

export interface ReferenceInput {
  id?: number;
  text?: string;
}

export interface BulkCreateQuestionInput {
  questionType: 'mcq' | 'written';
  statement: string;
  statementFormat?: 'text' | 'tiptap_json';
  lessonId?: number | null;
  chapterId?: number | null;
  isMisc?: boolean;
  oldExamId?: number | null;
  options?: QuestionOptionInput[];
}

export interface BulkCreatePayload {
  questions: BulkCreateQuestionInput[];
  /** Single reference shared by the entire batch */
  reference?: ReferenceInput | null;
}

export interface BulkCreateResult {
  count: number;
  questionIds: number[];
}

export function bulkCreateQuestions(
  payload: BulkCreatePayload,
  token?: string,
): Promise<BulkCreateResult> {
  return apiFetch<BulkCreateResult>('/questions/bulk', {
    method: 'POST',
    body: payload,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function getLessonQuestions(
  lessonId: number,
  page = 1,
  limit = 10,
  opts?: RequestInit,
): Promise<PaginatedQuestionsResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<PaginatedQuestionsResponse>(
    `/materials/lessons/${lessonId}/questions?${qs}`,
    { cache: "no-store", ...opts },
  );
}
