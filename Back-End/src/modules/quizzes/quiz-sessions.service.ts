import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { sql, eq, and, count, inArray } from 'drizzle-orm';
import { DrizzleService, type DRIZZLE_PROVIDER } from '../../database/drizzle.service';
import { quizSessions } from '../../database/entities/quiz-sessions';
import { quizSessionAnswers } from '../../database/entities/quiz-session-answers';
import { quizzes } from '../../database/entities/quizzes';
import { questionOptions } from '../../database/entities/question-options';
import { userQuestionStatus } from '../../database/entities/user-question-status';
import { UpdateSessionStatusDto, AnswerDto } from './dto';
import {
  PaginatedQuizSessionsDto,
  QuizSessionDetailResponseDto,
} from './dto';

/** Transaction type inferred from the database instance — avoids manual generics */
type DrizzleTx = Parameters<Parameters<DRIZZLE_PROVIDER['transaction']>[0]>[0];

// ─── allowed status transitions ──────────────────────────────────────────────

type SessionStatus = 'not_started' | 'in_progress' | 'suspended' | 'completed';

const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  not_started: ['in_progress'],
  suspended: ['in_progress'],
  in_progress: ['suspended', 'completed'],
  completed: [],
};

// ─── column projections ───────────────────────────────────────────────────────

const SESSION_COLUMNS = {
  id: true,
  quizId: true,
  // userId is intentionally omitted — sessions are always scoped to the authenticated user
  status: true,
  startedAt: true,
  endedAt: true,
  timeTakenSecs: true,
  totalQuestions: true,
  correctCount: true,
  incorrectCount: true,
  skippedCount: true,
  scorePct: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} as const;

const QUESTION_COLUMNS = {
  id: true,
  questionType: true,
  statement: true,
  statementFormat: true,
  explanation: true,
  lessonId: true,
  chapterId: true,
  isMisc: true,
  oldExamId: true,
  createdAt: true,
  updatedAt: true,
} as const;

const OPTION_COLUMNS = {
  id: true,
  optionText: true,
  isCorrect: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class QuizSessionsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  // ── List ──────────────────────────────────────────────────────────────────

  /** Paginated list of the user's sessions, including basic quiz info */
  async findAll(userId: number, page = 1, limit = 20): Promise<PaginatedQuizSessionsDto> {
    const offset = (page - 1) * limit;

    const [data, [{ value: total }]] = await Promise.all([
      this.drizzleService.db.query.quizSessions.findMany({
        where: eq(quizSessions.userId, userId),
        columns: SESSION_COLUMNS,
        with: {
          quiz: {
            columns: {
              id: true,
              title: true,
              questionType: true,
              questionStatus: true,
              totalQuestions: true,
              scopeFilter: true,
              createdAt: true,
            },
          },
        },
        orderBy: (s, { desc }) => [desc(s.createdAt)],
        limit,
        offset,
      }),
      this.drizzleService.db
        .select({ value: count() })
        .from(quizSessions)
        .where(eq(quizSessions.userId, userId)),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Detail ────────────────────────────────────────────────────────────────

  /**
   * Returns the session with its answers and the quiz's fully-populated
   * questions (with options).
   *
   * This single call is the sole source of truth for the session page on
   * initial load and resume hydration.
   */
  async findOne(sessionId: number, userId: number): Promise<QuizSessionDetailResponseDto> {
    const session = await this.drizzleService.db.query.quizSessions.findFirst({
      where: and(
        eq(quizSessions.id, sessionId),
        eq(quizSessions.userId, userId),
      ),
      columns: SESSION_COLUMNS,
      with: {
        quiz: {
          columns: {
            id: true,
            title: true,
            description: true,
            oldExamId: true,
            questionType: true,
            questionStatus: true,
            scopeFilter: true,
            questionIds: true,
            totalQuestions: true,
            createdAt: true,
            updatedAt: true,
          },
          with: {
            quizQuestions: {
              with: {
                question: {
                  columns: QUESTION_COLUMNS,
                  with: { questionOptions: { columns: OPTION_COLUMNS } },
                },
              },
            },
          },
        },
        quizSessionAnswers: {
          columns: {
            id: true,
            questionId: true,
            selectedOptionId: true,
            writtenAnswer: true,
            isCorrect: true,
            isMarked: true,
            isEliminated: true,
            answeredAt: true,
          },
        },
      },
    });

    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    // Destructure nested relation fields before spreading to avoid leaking raw
    // Drizzle relation props (quizSessionAnswers, quiz.quizQuestions) into the response.
    const { quiz: rawQuiz, quizSessionAnswers: rawAnswers, ...sessionBase } = session;
    const { quizQuestions, ...quizRest } = rawQuiz;
    const questions = quizQuestions.map((jq) => jq.question);

    return {
      ...sessionBase,
      quiz: { ...quizRest, questions },
      answers: rawAnswers,
    };
  }

  // ── Status Transition ─────────────────────────────────────────────────────

  /**
   * Drives the full session lifecycle.
   *
   * in_progress  → sets startedAt (only on the first start)
   * suspended    → upserts answers + metadata snapshot
   * completed    → upserts answers + metadata + stats, sets endedAt
   */
  async updateStatus(
    sessionId: number,
    userId: number,
    dto: UpdateSessionStatusDto,
  ): Promise<QuizSessionDetailResponseDto> {
    // 1. Fetch current session
    const session = await this.drizzleService.db.query.quizSessions.findFirst({
      where: and(
        eq(quizSessions.id, sessionId),
        eq(quizSessions.userId, userId),
      ),
      columns: { id: true, status: true, totalQuestions: true, startedAt: true },
    });

    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    // 2. Validate transition
    this._assertValidTransition(
      session.status as SessionStatus,
      dto.status as SessionStatus,
    );

    // 3. Perform the transition inside a transaction
    await this.drizzleService.db.transaction(async (tx) => {
      switch (dto.status) {
        case 'in_progress':
          await this._startOrResume(tx, session, dto);
          break;

        case 'suspended':
          await this._suspend(tx, sessionId, session.totalQuestions, dto);
          break;

        case 'completed':
          await this._complete(tx, sessionId, userId, session.totalQuestions, dto);
          break;
      }
    });

    // 4. Return the fresh session (with nested quiz info)
    return this.findOne(sessionId, userId);
  }

  // ── Transition side-effect handlers ───────────────────────────────────────

  private async _startOrResume(
    tx: DrizzleTx,
    session: { id: number; startedAt: string | null },
    _dto: UpdateSessionStatusDto,
  ) {
    await tx
      .update(quizSessions)
      .set({
        status: 'in_progress',
        // Only stamp startedAt the very first time
        startedAt: session.startedAt ?? sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(quizSessions.id, session.id));
  }

  private async _suspend(
    tx: DrizzleTx,
    sessionId: number,
    totalQuestions: number,
    dto: UpdateSessionStatusDto,
  ) {
    if (dto.answers?.length) {
      await this._upsertAnswers(tx, sessionId, dto.answers);
    }

    await tx
      .update(quizSessions)
      .set({
        status: 'suspended',
        ...(dto.metadata != null && { metadata: dto.metadata }),
        ...(dto.timeTakenSecs != null && { timeTakenSecs: dto.timeTakenSecs }),
      })
      .where(eq(quizSessions.id, sessionId));
  }

  private async _complete(
    tx: DrizzleTx,
    sessionId: number,
    userId: number,
    totalQuestions: number,
    dto: UpdateSessionStatusDto,
  ) {
    if (dto.answers?.length) {
      await this._upsertAnswers(tx, sessionId, dto.answers);
    }

    // Snapshot per-user per-question correctness for count filter queries
    await this._upsertUserQuestionStatus(tx, sessionId, userId);

    const stats = await this._buildSessionStats(tx, sessionId, totalQuestions);

    await tx
      .update(quizSessions)
      .set({
        status: 'completed',
        endedAt: sql`CURRENT_TIMESTAMP`,
        ...(dto.metadata != null && { metadata: dto.metadata }),
        ...(dto.timeTakenSecs != null && { timeTakenSecs: dto.timeTakenSecs }),
        ...stats,
      })
      .where(eq(quizSessions.id, sessionId));
  }

  // ── User question status upsert ──────────────────────────────────────────

  /**
   * Batch-upserts `user_question_status` rows from the completed session's
   * answer records.  Called once per session completion, inside the same
   * transaction as answer persistence.
   *
   * ON CONFLICT: update last_is_correct, increment attempt_count, refresh
   * last_answered_at — always keeping the MOST RECENT result.
   */
  private async _upsertUserQuestionStatus(
    tx: DrizzleTx,
    sessionId: number,
    userId: number,
  ) {
    const answers = await tx
      .select({
        questionId: quizSessionAnswers.questionId,
        isCorrect:  quizSessionAnswers.isCorrect,
      })
      .from(quizSessionAnswers)
      .where(eq(quizSessionAnswers.sessionId, sessionId));

    if (!answers.length) return;

    await tx
      .insert(userQuestionStatus)
      .values(
        answers.map((a) => ({
          userId,
          questionId:     a.questionId,
          lastIsCorrect:  a.isCorrect,
          attemptCount:   1,
          lastAnsweredAt: sql`CURRENT_TIMESTAMP`,
        })),
      )
      .onConflictDoUpdate({
        target: [userQuestionStatus.userId, userQuestionStatus.questionId],
        set: {
          lastIsCorrect:  sql`EXCLUDED.last_is_correct`,
          attemptCount:   sql`${userQuestionStatus.attemptCount} + 1`,
          lastAnsweredAt: sql`CURRENT_TIMESTAMP`,
        },
      });
  }

  // ── Answer upsert ─────────────────────────────────────────────────────────

  /**
   * Batch-upserts answers for a session.
   *
   * For MCQ answers, correctness is computed server-side by looking up the
   * chosen option row.  Written answers always get `isCorrect: null` (manual
   * grading not implemented yet).
   */
  private async _upsertAnswers(
    tx: DrizzleTx,
    sessionId: number,
    answers: AnswerDto[],
  ) {
    if (!answers.length) return;

    // Resolve correctness for MCQ answers (batch option lookup)
    const optionIds = answers
      .map((a) => a.selectedOptionId)
      .filter((id): id is number => id != null);

    const correctOptionIds = new Set<number>();

    if (optionIds.length) {
      const optionRows = await tx
        .select({ id: questionOptions.id, isCorrect: questionOptions.isCorrect })
        .from(questionOptions)
        .where(inArray(questionOptions.id, optionIds));

      optionRows
        .filter((o) => o.isCorrect)
        .forEach((o) => correctOptionIds.add(o.id));
    }

    // Build insert rows
    const rows = answers.map((a) => {
      const isMcq = a.selectedOptionId != null;
      const isCorrect = isMcq
        ? correctOptionIds.has(a.selectedOptionId!)
        : null; // written → null until manually graded

      return {
        sessionId,
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId ?? null,
        writtenAnswer: a.writtenAnswer ?? null,
        isCorrect,
        isMarked: a.isMarked ?? false,
        isEliminated: a.isEliminated ?? false,
        answeredAt: sql`CURRENT_TIMESTAMP`,
      };
    });

    await tx
      .insert(quizSessionAnswers)
      .values(rows)
      .onConflictDoUpdate({
        target: [quizSessionAnswers.sessionId, quizSessionAnswers.questionId],
        set: {
          selectedOptionId: sql`EXCLUDED.selected_option_id`,
          writtenAnswer: sql`EXCLUDED.written_answer`,
          isCorrect: sql`EXCLUDED.is_correct`,
          isMarked: sql`EXCLUDED.is_marked`,
          isEliminated: sql`EXCLUDED.is_eliminated`,
          answeredAt: sql`CURRENT_TIMESTAMP`,
        },
      });
  }

  // ── Session stats ─────────────────────────────────────────────────────────

  /**
   * Re-computes session stats from the persisted answer rows.
   * Called at the end of a session so the server is the source of truth
   * rather than relying on the client-side tallies.
   */
  private async _buildSessionStats(
    tx: DrizzleTx,
    sessionId: number,
    totalQuestions: number,
  ) {
    const answerRows = await tx
      .select({
        isCorrect: quizSessionAnswers.isCorrect,
        selectedOptionId: quizSessionAnswers.selectedOptionId,
        writtenAnswer: quizSessionAnswers.writtenAnswer,
      })
      .from(quizSessionAnswers)
      .where(eq(quizSessionAnswers.sessionId, sessionId));

    // An answer "exists" (not skipped) if the user selected an option or wrote something
    const answeredRows = answerRows.filter(
      (r) => r.selectedOptionId != null || (r.writtenAnswer?.trim() ?? '') !== '',
    );

    const correctCount = answeredRows.filter((r) => r.isCorrect === true).length;
    const incorrectCount = answeredRows.filter((r) => r.isCorrect === false).length;
    const skippedCount = totalQuestions - answeredRows.length;

    // Written questions with isCorrect = null are excluded from score
    const gradedCount = answeredRows.filter((r) => r.isCorrect !== null).length;
    const scorePct =
      gradedCount > 0
        ? ((correctCount / gradedCount) * 100).toFixed(2)
        : null;

    return {
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount: Math.max(0, skippedCount),
      scorePct,
    };
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  private _assertValidTransition(from: SessionStatus, to: SessionStatus) {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Cannot transition session from '${from}' to '${to}'. ` +
          `Allowed: [${allowed.join(', ') || 'none'}]`,
      );
    }
  }
}
