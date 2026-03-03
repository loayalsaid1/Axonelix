import { quizSessions } from '../../../database/entities/quiz-sessions';
import { quizSessionAnswers } from '../../../database/entities/quiz-session-answers';
import { QuizDetailResponseDto, QuizSummaryResponseDto } from './quiz-response.dto';

type SessionRow = typeof quizSessions.$inferSelect;
type AnswerRow = typeof quizSessionAnswers.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────

export class SessionAnswerResponseDto {
  id!: AnswerRow['id'];
  questionId!: AnswerRow['questionId'];
  selectedOptionId!: AnswerRow['selectedOptionId'];
  writtenAnswer!: AnswerRow['writtenAnswer'];
  isCorrect!: AnswerRow['isCorrect'];
  isMarked!: AnswerRow['isMarked'];
  isEliminated!: AnswerRow['isEliminated'];
  answeredAt!: AnswerRow['answeredAt'];
}

/**
 * Common session fields.  Does NOT include `userId` — the sessions are
 * always scoped to the authenticated user, so including the raw FK is
 * redundant and exposes an internal identifier.
 */
class QuizSessionBaseDto {
  id!: SessionRow['id'];
  quizId!: SessionRow['quizId'];
  status!: SessionRow['status'];
  startedAt!: SessionRow['startedAt'];
  endedAt!: SessionRow['endedAt'];
  timeTakenSecs!: SessionRow['timeTakenSecs'];
  totalQuestions!: SessionRow['totalQuestions'];
  correctCount!: SessionRow['correctCount'];
  incorrectCount!: SessionRow['incorrectCount'];
  skippedCount!: SessionRow['skippedCount'];
  scorePct!: SessionRow['scorePct'];
  metadata!: SessionRow['metadata'];
  createdAt!: SessionRow['createdAt'];
  updatedAt!: SessionRow['updatedAt'];
}

/**
 * Session row returned immediately after creation (POST /quizzes).
 * Does not yet have nested answers or a fully-populated quiz — the quiz is
 * returned separately in `GenerateQuizResponseDto`.
 */
export class QuizSessionCreatedDto extends QuizSessionBaseDto {}

/**
 * Compact session shape for paginated list items (GET /quiz-sessions).
 * The embedded quiz contains only the summary columns needed for the list UI.
 */
export class QuizSessionSummaryResponseDto extends QuizSessionBaseDto {
  quiz!: QuizSummaryResponseDto;
}

/**
 * Full session detail returned by GET /quiz-sessions/:sessionId and
 * PATCH /quiz-sessions/:sessionId/status.
 * The embedded quiz is fully populated (with questions + options) to allow
 * the client to hydrate the test page from a single request.
 */
export class QuizSessionDetailResponseDto extends QuizSessionBaseDto {
  quiz!: QuizDetailResponseDto;
  answers!: SessionAnswerResponseDto[];
}

export class PaginatedQuizSessionsDto {
  data!: QuizSessionSummaryResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

/** Return shape for POST /quizzes. */
export class GenerateQuizResponseDto {
  quiz!: QuizDetailResponseDto;
  session!: QuizSessionCreatedDto;
}
