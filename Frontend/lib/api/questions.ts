import { apiFetch } from "@/lib/api/client";
import type { PaginatedQuestionsResponse } from "@/lib/types/questions";

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
