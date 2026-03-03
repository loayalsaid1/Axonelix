// ─── Shared enums ─────────────────────────────────────────────────────────────

import { JSONContent } from "@tiptap/core";

export type QuestionType = 'mcq' | 'written';
export type QuestionStatus = 'all' | 'incorrect_only' | 'unread';
export type SessionStatus = 'not_started' | 'in_progress' | 'suspended' | 'completed';
export type SubjectType = 'theoretical' | 'practical';

// ─── Building-block types ─────────────────────────────────────────────────────

export interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  questionType: QuestionType;
  statement: string;
  statementFormat: 'text' | 'tiptap_json';
  explanation: JSONContent | null;
  lessonId: number | null;
  chapterId: number | null;
  isMisc: boolean;
  oldExamId: number | null;
  createdAt: string;
  updatedAt: string;
  questionOptions: QuestionOption[];
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizScopeFilter {
  moduleIds?: number[];
  moduleType?: SubjectType;
  subjectIds?: number[];
  chapterIds?: number[];
  lessonIds?: number[];
  questionType?: QuestionType;
  questionStatus?: QuestionStatus;
  questionCount?: number;
}

export interface Quiz {
  id: number;
  title: string | null;
  description: string | null;
  createdBy: number;
  oldExamId: number | null;
  scopeFilter: QuizScopeFilter;
  questionType: QuestionType | null;
  questionStatus: QuestionStatus | null;
  questionIds: number[];
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface SessionMetadata {
  answered?: number[];
  unanswered?: number[];
  unseen?: number[];
  marked?: number[];
  current_question_id?: number;
}

export interface SessionAnswer {
  id: number;
  questionId: number;
  selectedOptionId: number | null;
  writtenAnswer: string | null;
  isCorrect: boolean | null;
  isMarked: boolean;
  isEliminated: boolean;
  answeredAt: string;
}

export interface QuizSession {
  id: number;
  quizId: number;
  userId: number;
  status: SessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  timeTakenSecs: number | null;
  totalQuestions: number;
  correctCount: number | null;
  incorrectCount: number | null;
  skippedCount: number | null;
  scorePct: number | null;
  metadata: SessionMetadata | null;
  createdAt: string;
  updatedAt: string;
}

/** Full session detail returned by GET /quiz-sessions/:sessionId */
export interface SessionDetail {
  /** The backend spreads session fields at the top level.
   *  We mirror that here for convenience — all QuizSession fields + quiz + answers. */
  session: QuizSession;
  quiz: Quiz;
  answers: SessionAnswer[];
}

/**
 * Transform the flat backend response (session fields spread + quiz + answers)
 * into our nested SessionDetail shape.
 */
export function toSessionDetail(raw: QuizSession & { quiz: Quiz; answers: SessionAnswer[] }): SessionDetail {
  const { quiz, answers, ...session } = raw as QuizSession & { quiz: Quiz; answers: SessionAnswer[] };
  return { session, quiz, answers };
}

// ─── Review mode ──────────────────────────────────────────────────────────────

/**
 * Filter tabs available in the review UI.
 * 'all'       — every question in the quiz
 * 'incorrect' — only wrong or skipped (no answer)
 * 'marked'    — questions the user flagged during the test
 */
export type ReviewFilter = 'all' | 'incorrect' | 'marked';

/**
 * A single entry in review mode: the original question joined with the
 * persisted answer (null when the question was skipped entirely).
 *
 * `isCorrect`:
 *   true  — MCQ and user chose the right option
 *   false — MCQ and user chose wrong, or question was skipped
 *   null  — written question (not auto-graded yet)
 */
export interface ReviewEntry {
  question: QuizQuestion;
  /** Original 1-based position in the full quiz — stable regardless of filter */
  questionNumber: number;
  answer: SessionAnswer | null;
  isCorrect: boolean | null;
}

/**
 * Build a ReviewEntry array from a completed SessionDetail.
 * Preserves question order from quiz.questions.
 */
export function buildReviewEntries(detail: SessionDetail): ReviewEntry[] {
  const answerMap = new Map(detail.answers.map((a) => [a.questionId, a]));
  return detail.quiz.questions.map((q, i) => {
    const answer = answerMap.get(q.id) ?? null;
    // Skipped (no answer at all) counts as incorrect for filtering purposes
    const isCorrect = answer ? (answer.isCorrect ?? null) : false;
    return { question: q, questionNumber: i + 1, answer, isCorrect };
  });
}

// ─── Session list item (from GET /quiz-sessions) ──────────────────────────────

export type SessionListItem = QuizSession & {
  quiz: Pick<Quiz,
    | 'id'
    | 'title'
    | 'questionType'
    | 'questionStatus'
    | 'totalQuestions'
    | 'scopeFilter'
    | 'createdAt'
  >;
};

// ─── API response types ───────────────────────────────────────────────────────

export interface GenerateQuizResponse {
  quiz: Quiz;
  session: QuizSession;
}

export interface PaginatedSessionsResponse {
  data: SessionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Request DTO types (mirroring backend DTOs) ───────────────────────────────

export interface GenerateQuizDto {
  title?: string;
  questionCount: number;
  moduleIds?: number[];
  moduleType?: SubjectType;
  subjectIds?: number[];
  chapterIds?: number[];
  lessonIds?: number[];
  questionType?: QuestionType;
  questionStatus?: QuestionStatus;
}

export interface CountQuestionsDto {
  moduleIds?: number[];
  moduleType?: SubjectType;
  subjectIds?: number[];
  chapterIds?: number[];
  lessonIds?: number[];
  questionType?: QuestionType;
  questionStatus?: QuestionStatus;
}

export interface AnswerDto {
  questionId: number;
  selectedOptionId?: number;
  writtenAnswer?: string;
  isMarked?: boolean;
  isEliminated?: boolean;
}

export interface UpdateSessionStatusDto {
  status: 'in_progress' | 'suspended' | 'completed';
  answers?: AnswerDto[];
  metadata?: SessionMetadata;
  timeTakenSecs?: number;
}
