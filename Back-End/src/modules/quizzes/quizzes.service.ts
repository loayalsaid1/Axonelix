import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { sql, eq, and, isNull, or, count } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { QuestionsService } from '../questions/questions/questions.service';
import { SubscriptionsAccessService } from '../subscriptions/subscriptions-access.service';
import { quizzes } from '../../database/entities/quizzes';
import { quizSessions } from '../../database/entities/quiz-sessions';
import { quizQuestions } from '../../database/entities/quiz-questions';
import { questions } from '../../database/entities/questions';
import { lessons as lessonsTable } from '../../database/entities/lessons';
import { chapters as chaptersTable } from '../../database/entities/chapters';
import { subjects as subjectsTable } from '../../database/entities/subjects';
import { userQuestionStatus } from '../../database/entities/user-question-status';
import { QuestionFilterDto } from '../questions/questions/dto';
import {
  GenerateQuizDto,
  QuizDetailResponseDto,
  QuizSummaryResponseDto,
  PaginatedQuizzesDto,
  GenerateQuizResponseDto,
} from './dto';
import type { UserRecord } from '../users/interfaces/user-record.interface';

// ─── column projections ───────────────────────────────────────────────────────

const QUIZ_COLUMNS = {
  id: true,
  title: true,
  description: true,
  // createdBy is intentionally omitted — callers are always the owner
  oldExamId: true,
  scopeFilter: true,
  questionType: true,
  questionStatus: true,
  questionIds: true,
  totalQuestions: true,
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
export class QuizzesService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly questionsService: QuestionsService,
    private readonly subscriptionsAccessService: SubscriptionsAccessService,
  ) { }

  // ── Quiz Generation ───────────────────────────────────────────────────────

  /**
   * Generate a new quiz from the given filters + question count, then
   * auto-create a `not_started` session for the requesting user.
   *
   * Generation strategy — single DB round-trip:
   *  1. Reuse QuestionsService.getJoinPlan + buildFilterConditions to build the
   *     same hierarchy-aware filter as the questions endpoint.
   *  2. Conditionally LEFT/INNER JOIN `v_latest_user_question_status` to handle
   *     the `incorrect_only` and `unread` question-status filters entirely in SQL.
   *  3. Append `ORDER BY RANDOM() LIMIT n` so Postgres handles randomisation.
   *
   * Returns { quiz, session } to allow an immediate frontend redirect.
   */
  async generate(dto: GenerateQuizDto, user: UserRecord): Promise<GenerateQuizResponseDto> {
    if (dto.oldExamId != null) {
      await this.subscriptionsAccessService.assertCanViewOldExam(user, dto.oldExamId);
    }

    const effectiveModuleIds = await this.subscriptionsAccessService.resolveEffectiveModuleIds(
      user,
      dto.moduleIds,
    );

    if (
      !this.subscriptionsAccessService.isAdmin(user) &&
      effectiveModuleIds &&
      effectiveModuleIds.length === 0
    ) {
      throw new BadRequestException('You need module access before generating quizzes.');
    }

    const scopedDto: GenerateQuizDto = {
      ...dto,
      ...(effectiveModuleIds ? { moduleIds: effectiveModuleIds } : {}),
    };

    // 1. Resolve final question IDs — single DB query
    const selectedIds = await this._resolveQuestionIds(scopedDto, user.id);

    if (!selectedIds.length) {
      const reason =
        scopedDto.questionStatus && scopedDto.questionStatus !== 'all'
          ? `No questions match the '${scopedDto.questionStatus}' filter for this user.`
          : 'No questions found matching the selected filters.';
      throw new BadRequestException(reason);
    }

    // 2. Persist: quiz → quiz_questions → session  (single transaction)
    const { quiz, session } = await this.drizzleService.db.transaction(
      async (tx) => {
        // 2a. Create the quiz row
        const [quiz] = await tx
          .insert(quizzes)
          .values({
            title: scopedDto.title ?? null,
            createdBy: user.id,
            // Snapshot the full DTO as an audit trail of what was requested
            scopeFilter: scopedDto as unknown as Record<string, unknown>,
            questionType: scopedDto.questionType ?? null,
            questionStatus: scopedDto.questionStatus ?? null,
          })
          .returning();

        // 2b. Insert junction rows.
        //     The DB trigger `trg_sync_quiz_question_ids` keeps
        //     quizzes.question_ids / total_questions in sync automatically.
        await tx.insert(quizQuestions).values(
          selectedIds.map((qid) => ({ quizId: quiz.id, questionId: qid })),
        );

        // 2c. Create the initial (not_started) session
        const [session] = await tx
          .insert(quizSessions)
          .values({
            quizId: quiz.id,
            userId: user.id,
            status: 'not_started',
            totalQuestions: selectedIds.length,
          })
          .returning();

        return { quiz, session };
      },
    );

    // 3. Re-fetch quiz with fully populated questions (trigger has run by now)
    const freshQuiz = await this.findOne(quiz.id, user.id);
    return { quiz: freshQuiz, session };
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  /** Paginated list of the requesting user's quizzes */
  async findAll(userId: number, page = 1, limit = 20): Promise<PaginatedQuizzesDto> {
    const offset = (page - 1) * limit;

    const [data, [{ value: total }]] = await Promise.all([
      this.drizzleService.db.query.quizzes.findMany({
        where: eq(quizzes.createdBy, userId),
        columns: QUIZ_COLUMNS,
        orderBy: (q, { desc }) => [desc(q.createdAt)],
        limit,
        offset,
      }),
      this.drizzleService.db
        .select({ value: count() })
        .from(quizzes)
        .where(eq(quizzes.createdBy, userId)),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get a quiz by ID including fully-populated questions + options.
   * The caller is responsible for ensuring the user owns this quiz
   * (ownership is enforced at the HTTP layer by QuizOwnerGuard).
   */
  async findOne(id: number, userId: number): Promise<QuizDetailResponseDto> {
    const quiz = await this.drizzleService.db.query.quizzes.findFirst({
      where: and(eq(quizzes.id, id), eq(quizzes.createdBy, userId)),
      columns: QUIZ_COLUMNS,
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
    });

    if (!quiz) throw new NotFoundException(`Quiz ${id} not found`);

    // Flatten the junction rows into a cleaner `questions` array
    const { quizQuestions: _jq, ...rest } = quiz;
    return { ...rest, questions: _jq.map((jq) => jq.question) };
  }

  /**
   * Delete a quiz (cascades to quiz_questions and quiz_sessions).
   * Single DELETE … RETURNING — if nothing deleted the row didn't exist.
   */
  async remove(id: number, userId: number): Promise<{ id: number }> {
    const [deleted] = await this.drizzleService.db
      .delete(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.createdBy, userId)))
      .returning({ id: quizzes.id });

    if (!deleted) throw new NotFoundException(`Quiz ${id} not found`);
    return deleted;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Orchestrates question ID resolution:
   *  1. Map DTO → shared filter shape
   *  2. Build hierarchy-scoped base query
   *  3. Attach user-status join
   *  4. Randomise + limit entirely in Postgres
   */
  private async _resolveQuestionIds(
    dto: GenerateQuizDto,
    userId: number,
  ): Promise<number[]> {
    const filterDto = this._mapToFilterDto(dto);
    const conditions = this.questionsService.buildFilterConditions(filterDto);
    let query = this._buildBaseQuery(filterDto);

    query = this._applyStatusJoin(query, conditions, dto.questionStatus, userId);

    if (conditions.length) {
      query = query.where(and(...conditions));
    }

    // GROUP BY instead of SELECT DISTINCT so that ORDER BY RANDOM() is valid.
    // PostgreSQL forbids ORDER BY expressions that are not in the SELECT list
    // when DISTINCT is used, but GROUP BY has no such restriction.
    const rows = await query
      .groupBy(questions.id)
      .orderBy(sql`RANDOM()`)
      .limit(dto.questionCount);
    return rows.map((r) => r.id);
  }

  /**
   * Extracts the hierarchy + question-level filter fields from the GenerateQuizDto
   * into the shared QuestionFilterDto shape used by QuestionsService helpers.
   */
  private _mapToFilterDto(dto: GenerateQuizDto): QuestionFilterDto {
    return {
      ...(dto.moduleIds?.length && { moduleIds: dto.moduleIds }),
      ...(dto.moduleType && { moduleType: dto.moduleType }),
      ...(dto.subjectIds?.length && { subjectIds: dto.subjectIds }),
      ...(dto.chapterIds?.length && { chapterIds: dto.chapterIds }),
      ...(dto.lessonIds?.length && { lessonIds: dto.lessonIds }),
      ...(dto.isMisc != null && { isMisc: dto.isMisc }),
      ...(dto.questionType && { questionType: dto.questionType }),
      ...(dto.oldExamId != null && { oldExamId: dto.oldExamId }),
    };
  }

  /**
   * Builds a `SELECT DISTINCT id` query with only the hierarchy joins required
   * by the active filters — mirrors `QuestionsService.buildFilterQuery` but
   * selects only `id` (no `createdAt`) since ordering is done via RANDOM().
   */
  private _buildBaseQuery(filterDto: QuestionFilterDto) {
    const { needsLessons, needsChapters, needsSubjects } =
      this.questionsService.getJoinPlan(filterDto);

    // Use select + groupBy (in _resolveQuestionIds) rather than selectDistinct,
    // because PostgreSQL disallows ORDER BY RANDOM() with SELECT DISTINCT.
    let query = this.drizzleService.db
      .select({ id: questions.id })
      .from(questions)
      .$dynamic();

    if (needsLessons) {
      query = query.leftJoin(lessonsTable, eq(questions.lessonId, lessonsTable.id));
    }
    if (needsChapters) {
      query = query.leftJoin(
        chaptersTable,
        or(
          eq(questions.chapterId, chaptersTable.id),
          eq(lessonsTable.chapterId, chaptersTable.id),
        )!,
      );
    }
    if (needsSubjects) {
      query = query.leftJoin(subjectsTable, eq(chaptersTable.subjectId, subjectsTable.id));
    }

    return query;
  }

  /**
   * Attaches the `user_question_status` join for `incorrect_only` / `unread`
   * filters.  For `unread` an extra IS NULL condition is pushed onto the shared
   * `conditions` array so the caller can apply it in the WHERE clause.
   *
   * Uses the denormalised user_question_status table (upserted on session
   * completion) rather than the live view — indexed, faster, consistent with
   * QuestionCountService.
   *
   * Returns the (possibly augmented) query unchanged for `all` / undefined status.
   */
  private _applyStatusJoin(
    query: ReturnType<typeof this._buildBaseQuery>,
    conditions: ReturnType<typeof this.questionsService.buildFilterConditions>,
    questionStatus: GenerateQuizDto['questionStatus'],
    userId: number,
  ) {
    if (questionStatus === 'incorrect_only') {
      // INNER JOIN — only questions this user last answered incorrectly
      return query.innerJoin(
        userQuestionStatus,
        and(
          eq(userQuestionStatus.questionId, questions.id),
          eq(userQuestionStatus.userId, userId),
          eq(userQuestionStatus.lastIsCorrect, false),
        )!,
      );
    }

    if (questionStatus === 'unread') {
      // LEFT JOIN + IS NULL — questions the user has never answered
      conditions.push(isNull(userQuestionStatus.questionId));
      return query.leftJoin(
        userQuestionStatus,
        and(
          eq(userQuestionStatus.questionId, questions.id),
          eq(userQuestionStatus.userId, userId),
        )!,
      );
    }

    return query;
  }
}
