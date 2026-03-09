import { apiFetch } from './client';
import { toSessionDetail } from '@/lib/types/quizzes';
import type {
  GenerateQuizDto,
  GenerateQuizResponse,
  SessionDetail,
  PaginatedSessionsResponse,
  UpdateSessionStatusDto,
  QuizSession,
  SessionAnswer,
  SessionStatus,
  CountQuestionsDto,
  UserTestStats,
  Quiz,
} from '@/lib/types/quizzes';

// ─── Auth header helper ───────────────────────────────────────────────────────

function bearer(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────

/**
 * POST /quizzes
 * Generate a quiz from filters; auto-creates a not_started session.
 * Returns { quiz, session }.
 */
export function generateQuiz(
  dto: GenerateQuizDto,
  token: string,
): Promise<GenerateQuizResponse> {
  return apiFetch<GenerateQuizResponse>('/quizzes', {
    method: 'POST',
    body: dto,
    cache: 'no-store',
    headers: bearer(token),
  });
}

/**
 * POST /quizzes/count
 * Returns the number of available questions for the current filter state.
 * Drives the live counter in the test-generator UI.
 *
 * Uses POST so array fields (subjectIds, chapterIds, lessonIds …) are sent
 * as a JSON body, avoiding query-string array-parsing issues.
 */
export function countQuestions(
  dto: CountQuestionsDto,
  token: string,
): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/quizzes/count', {
    method: 'POST',
    body: dto,
    cache: 'no-store',
    headers: bearer(token),
  });
}

/**
 * GET /quizzes
 * Paginated list of the current user's quizzes.
 */
export function getQuizzes(
  page = 1,
  limit = 20,
  token: string,
): Promise<{ data: Quiz[]; total: number; page: number; limit: number; totalPages: number }> {
  return apiFetch(
    `/quizzes?page=${page}&limit=${limit}`,
    { cache: 'no-store', headers: bearer(token) },
  );
}

/**
 * DELETE /quizzes/:id
 */
export function deleteQuiz(id: number, token: string): Promise<{ id: number }> {
  return apiFetch<{ id: number }>(`/quizzes/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
    headers: bearer(token),
  });
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

/**
 * GET /quiz-sessions
 * Paginated list of the current user's sessions.
 * @param status Optional — only return sessions of this lifecycle status.
 */
export function getSessions(
  token: string,
  page = 1,
  limit = 20,
  status?: SessionStatus,
): Promise<PaginatedSessionsResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set('status', status);
  return apiFetch<PaginatedSessionsResponse>(
    `/quiz-sessions?${qs}`,
    { cache: 'no-store', headers: bearer(token) },
  );
}

/**
 * GET /quiz-sessions/stats
 * Aggregated statistics for the authenticated user's test history.
 */
export function getSessionStats(token: string): Promise<UserTestStats> {
  return apiFetch<UserTestStats>('/quiz-sessions/user-stats', {
    cache: 'no-store',
    headers: bearer(token),
  });
}

/**
 * DELETE /quiz-sessions/:sessionId
 * Permanently removes the session and all its answers. Returns void (204).
 */
export function deleteSession(sessionId: number, token: string): Promise<void> {
  return apiFetch<void>(`/quiz-sessions/${sessionId}`, {
    method: 'DELETE',
    cache: 'no-store',
    headers: bearer(token),
  });
}

/**
 * GET /quiz-sessions/:sessionId
 * Full session detail: session row + answers + quiz with populated questions.
 * The backend returns a flat spread; we normalise it into { session, quiz, answers }.
 */
export async function getSession(sessionId: number, token: string): Promise<SessionDetail> {
  const raw = await apiFetch<QuizSession & { quiz: Quiz; answers: SessionAnswer[] }>(
    `/quiz-sessions/${sessionId}`,
    { cache: 'no-store', headers: bearer(token) },
  );
  return toSessionDetail(raw);
}

/**
 * PATCH /quiz-sessions/:sessionId/status
 * Advances the session lifecycle.
 * The backend returns the full findOne payload (flat spread), identical to GET.
 * We normalise it into { session, quiz, answers } the same way.
 */
export async function updateSessionStatus(
  sessionId: number,
  dto: UpdateSessionStatusDto,
  token: string,
): Promise<SessionDetail> {
  const raw = await apiFetch<QuizSession & { quiz: Quiz; answers: SessionAnswer[] }>(
    `/quiz-sessions/${sessionId}/status`,
    {
      method: 'PATCH',
      body: dto,
      cache: 'no-store',
      headers: bearer(token),
    },
  );
  return toSessionDetail(raw);
}
