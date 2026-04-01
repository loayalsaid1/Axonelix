import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { QuestionOptionsService } from '../question-options/question-options.service';
import { ReferencesService } from '../references/references.service';
import { questions } from '../../../database/entities/questions';
import { questionOptions } from '../../../database/entities/question-options';
import { lessons as lessonsTable } from '../../../database/entities/lessons';
import { chapters as chaptersTable } from '../../../database/entities/chapters';
import { subjects as subjectsTable } from '../../../database/entities/subjects';
import { questionReferences } from '../../../database/entities/question-references';
import { ImagesService } from '../../images/images.service';
import { SubscriptionsAccessService } from '../../subscriptions/subscriptions-access.service';
import { extractImageUrls } from '../../../common/utils/tiptap-utils';
import { and, eq, ilike, inArray, or, SQL, count } from 'drizzle-orm';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionFilterDto,
  PaginatedQuestionsDto,
  QuestionIdsDto,
  BulkCreateQuestionsDto,
  BulkCreateResultDto,
} from './dto';
import type { UserRecord } from '../../users/interfaces/user-record.interface';

// Columns returned on a full question fetch
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
  referenceId: true,
  createdAt: true,
  updatedAt: true,
} as const;

const OPTION_COLUMNS = {
  id: true,
  optionText: true,
  isCorrect: true,
} as const;

@Injectable()
export class QuestionsService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly questionOptionsService: QuestionOptionsService,
    private readonly referencesService: ReferencesService,
    private readonly imagesService: ImagesService,
    private readonly subscriptionsAccessService: SubscriptionsAccessService,
  ) { }

  // ── Public CRUD ────────────────────────────────────────────────────────────

  /**
   * Bulk-insert many questions + their options in a single atomic transaction.
   * All questions share the same validation constraints as `create()`.
   * If anything fails, the entire batch is rolled back.
   */
  async bulkCreate(dto: BulkCreateQuestionsDto): Promise<BulkCreateResultDto> {
    return this.drizzleService.db.transaction(async (tx) => {
      // ── 1. Resolve the shared batch reference once ─────────────────────
      // The reference belongs to the whole batch, not per-question, so we
      // resolve it a single time and stamp the resulting ID on every row.
      const referenceId = await this.referencesService.resolve(dto.reference, tx);

      // ── 2. Batch-insert all question rows ──────────────────────────────
      const questionPayloads: (typeof questions.$inferInsert)[] = dto.questions.map((q) => ({
        questionType: q.questionType,
        statement: q.statement,
        statementFormat: q.statementFormat ?? 'text',
        explanation: q.explanation ?? null,
        lessonId: q.lessonId ?? null,
        chapterId: q.chapterId ?? null,
        isMisc: q.isMisc ?? false,
        oldExamId: q.oldExamId ?? null,
        referenceId,
      }));

      const insertedQuestions = await tx
        .insert(questions)
        .values(questionPayloads)
        .returning({ id: questions.id });

      // ── 3. Batch-insert all options (single round-trip) ─────────────────
      const optionPayloads: (typeof questionOptions.$inferInsert)[] = [];

      insertedQuestions.forEach(({ id: questionId }, i) => {
        const q = dto.questions[i];
        if (q.questionType === 'mcq' && q.options?.length) {
          q.options.forEach((opt) => {
            optionPayloads.push({
              questionId,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
            });
          });
        }
      });

      if (optionPayloads.length) {
        await tx.insert(questionOptions).values(optionPayloads);
      }

      return {
        count: insertedQuestions.length,
        questionIds: insertedQuestions.map((q) => q.id),
      };
    });
  }

  async create(dto: CreateQuestionDto) {
    return this.drizzleService.db.transaction(async (tx) => {
      // Resolve reference object to ID (create if needed)
      const referenceId = await this.referencesService.resolve(dto.reference, tx);

      const payload: typeof questions.$inferInsert = {
        questionType: dto.questionType,
        statement: dto.statement,
        statementFormat: dto.statementFormat ?? 'text',
        explanation: dto.explanation,
        lessonId: dto.lessonId ?? null,
        chapterId: dto.chapterId ?? null,
        isMisc: dto.isMisc ?? false,
        oldExamId: dto.oldExamId ?? null,
        referenceId,
      };

      const [question] = await tx
        .insert(questions)
        .values(payload)
        .returning();

      if (dto.questionType === 'mcq' && dto.options?.length) {
        const optionPayloads = dto.options.map((opt) => ({
          questionId: question.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        }));
        await tx.insert(questionOptions).values(optionPayloads);
      }

      // Collect images from both statement and explanation
      const statementUrls = dto.statementFormat === 'tiptap_json' ? extractImageUrls(dto.statement) : [];
      const explanationUrls = dto.explanation ? extractImageUrls(dto.explanation) : [];

      if (statementUrls.length > 0) {
        await this.imagesService.commitImages('question', question.id, statementUrls, tx);
      }

      if (explanationUrls.length > 0) {
        await this.imagesService.commitImages('explanation', question.id, explanationUrls, tx);
      }

      return this.findOne(question.id, tx);
    });
  }

  /**
   * Simple list with optional basic filters.
   * For complex hierarchy-based filtering use `filter()`.
   */
  async findAll(
    params: {
      lessonId?: number;
      chapterId?: number;
      oldExamId?: number;
      referenceId?: number;
      questionType?: string;
      isMisc?: boolean;
    } = {},
    page = 1,
    limit = 40,
    user?: UserRecord,
  ): Promise<PaginatedQuestionsDto> {
    if (user && !this.subscriptionsAccessService.isAdmin(user)) {
      const filterDto: QuestionFilterDto = {
        ...(params.lessonId != null && { lessonIds: [params.lessonId] }),
        ...(params.chapterId != null && { chapterIds: [params.chapterId] }),
        ...(params.oldExamId != null && { oldExamId: params.oldExamId }),
        ...(params.referenceId != null && { referenceId: params.referenceId }),
        ...(params.questionType != null && {
          questionType: params.questionType as 'mcq' | 'written',
        }),
        ...(params.isMisc != null && { isMisc: params.isMisc }),
      };

      return this.filter(filterDto, page, limit, user);
    }

    const conditions: SQL[] = [];

    if (params.lessonId != null) conditions.push(eq(questions.lessonId, params.lessonId));
    if (params.chapterId != null) conditions.push(eq(questions.chapterId, params.chapterId));
    if (params.oldExamId != null) conditions.push(eq(questions.oldExamId, params.oldExamId));
    if (params.referenceId != null) conditions.push(eq(questions.referenceId, params.referenceId));
    if (params.questionType != null) conditions.push(eq(questions.questionType, params.questionType));
    if (params.isMisc != null) conditions.push(eq(questions.isMisc, params.isMisc));

    const where = conditions.length ? and(...conditions) : undefined;
    return this._paginateQuery(where, page, limit);
  }

  async findOne(id: number, tx?: any, user?: UserRecord) {
    const db = tx ? tx : this.drizzleService.db;

    if (user && !this.subscriptionsAccessService.isAdmin(user)) {
      await this.subscriptionsAccessService.assertCanViewQuestion(user, id);
    }

    const question = await db.query.questions.findFirst({
      where: eq(questions.id, id),
      columns: QUESTION_COLUMNS,
      with: {
        questionOptions: { columns: OPTION_COLUMNS },
      },
    });

    if (!question) throw new NotFoundException(`Question with ID ${id} not found`);

    return question;
  }

  async update(id: number, dto: UpdateQuestionDto) {
    // Verify existence first
    const existingQuestion = await this.findOne(id);

    const { options, ...questionFields } = dto;

    // Build the update payload, only include defined fields
    const updatePayload: Partial<typeof questions.$inferInsert> = {};
    if (questionFields.questionType !== undefined) updatePayload.questionType = questionFields.questionType;
    if (questionFields.statement !== undefined) updatePayload.statement = questionFields.statement;
    if (questionFields.statementFormat !== undefined) updatePayload.statementFormat = questionFields.statementFormat;
    if (questionFields.explanation !== undefined) updatePayload.explanation = questionFields.explanation;
    if (questionFields.lessonId !== undefined) updatePayload.lessonId = questionFields.lessonId;
    if (questionFields.chapterId !== undefined) updatePayload.chapterId = questionFields.chapterId;
    if (questionFields.isMisc !== undefined) updatePayload.isMisc = questionFields.isMisc;
    if (questionFields.oldExamId !== undefined) updatePayload.oldExamId = questionFields.oldExamId;

    await this.drizzleService.db.transaction(async (tx) => {
      if (Object.keys(updatePayload).length) {
        await tx
          .update(questions)
          .set(updatePayload)
          .where(eq(questions.id, id));
      }

      const targetStatementFormat = questionFields.statementFormat ?? existingQuestion.statementFormat;

      if (questionFields.statement !== undefined && targetStatementFormat === 'tiptap_json') {
        const newUrls = extractImageUrls(questionFields.statement);
        await this.imagesService.markDeletedByDiff('question', id, newUrls, tx);
        if (newUrls.length > 0) {
          await this.imagesService.commitImages('question', id, newUrls, tx);
        }
      } else if (questionFields.statementFormat !== undefined && questionFields.statementFormat !== 'tiptap_json') {
        await this.imagesService.markDeletedByDiff('question', id, [], tx);
      }

      if (questionFields.explanation !== undefined) {
        const newUrls = extractImageUrls(questionFields.explanation);
        await this.imagesService.markDeletedByDiff('explanation', id, newUrls, tx);
        if (newUrls.length > 0) {
          await this.imagesService.commitImages('explanation', id, newUrls, tx);
        }
      }

      // Replace options if provided
      if (options !== undefined) {
        await this.questionOptionsService.replaceOptions(id, options ?? []);
      }
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    const [deleted] = await this.drizzleService.db.transaction(async (tx) => {
      await this.imagesService.deleteAllForEntity('question', id, tx);
      await this.imagesService.deleteAllForEntity('explanation', id, tx);

      return tx
        .delete(questions)
        .where(eq(questions.id, id))
        .returning();
    });

    if (!deleted) throw new NotFoundException(`Question with ID ${id} not found`);
    return deleted;
  }

  /**
   * Remove a question from an old exam.
   * If the question becomes an orphan (no lesson, chapter, or exam), it will be deleted.
   */
  async removeFromExam(id: number) {
    // We just set oldExamId to null. The DB trigger trg_delete_orphaned_question
    // will handle the deletion if it's now an orphan.
    await this.drizzleService.db
      .update(questions)
      .set({ oldExamId: null })
      .where(eq(questions.id, id));
  }

  // ── Advanced filtering ─────────────────────────────────────────────────────

  /**
   * Complex filter returning paginated questions with options.
   *
   * Strategy:
   *  1. Build a `SELECT DISTINCT id` query with only the joins required by the
   *     active filters (skip joins that aren't referenced in any condition).
   *  2. Run that query twice in parallel: once for the current page of IDs,
   *     once wrapped in a subquery for the total count.
   *  3. Fetch full question rows (with options) using the returned IDs so we
   *     never multiply rows via option joins.
   */
  async filter(
    filterDto: QuestionFilterDto,
    page = 1,
    limit = 40,
    user?: UserRecord,
  ): Promise<PaginatedQuestionsDto> {
    let scopedFilter = filterDto;

    if (user && !this.subscriptionsAccessService.isAdmin(user)) {
      if (filterDto.oldExamId != null) {
        await this.subscriptionsAccessService.assertCanViewOldExam(user, filterDto.oldExamId);
      }

      const effectiveModuleIds = await this.subscriptionsAccessService.resolveEffectiveModuleIds(
        user,
        filterDto.moduleIds,
      );

      if (effectiveModuleIds && effectiveModuleIds.length === 0) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }

      scopedFilter = {
        ...filterDto,
        ...(effectiveModuleIds ? { moduleIds: effectiveModuleIds } : {}),
      };
    }

    const offset = (page - 1) * limit;

    const [idRows, [{ value: total }]] = await Promise.all([
      this.buildFilterQuery(scopedFilter).limit(limit).offset(offset),
      this.drizzleService.db
        .select({ value: count() })
        .from(this.buildFilterQuery(scopedFilter).as('cq')),
    ]);

    const ids = idRows.map((r) => r.id);

    if (!ids.length) {
      return { data: [], total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    const data = await this.drizzleService.db.query.questions.findMany({
      where: inArray(questions.id, ids),
      columns: QUESTION_COLUMNS,
      with: { questionOptions: { columns: OPTION_COLUMNS } },
      orderBy: (q, { asc }) => [asc(q.createdAt)],
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Complex filter returning only question IDs (lightweight, for quiz generation).
   */
  async filterIds(filterDto: QuestionFilterDto, user?: UserRecord): Promise<QuestionIdsDto> {
    let scopedFilter = filterDto;

    if (user && !this.subscriptionsAccessService.isAdmin(user)) {
      if (filterDto.oldExamId != null) {
        await this.subscriptionsAccessService.assertCanViewOldExam(user, filterDto.oldExamId);
      }

      const effectiveModuleIds = await this.subscriptionsAccessService.resolveEffectiveModuleIds(
        user,
        filterDto.moduleIds,
      );

      if (effectiveModuleIds && effectiveModuleIds.length === 0) {
        return { ids: [], total: 0 };
      }

      scopedFilter = {
        ...filterDto,
        ...(effectiveModuleIds ? { moduleIds: effectiveModuleIds } : {}),
      };
    }

    const rows = await this.buildFilterQuery(scopedFilter);
    return { ids: rows.map((r) => r.id), total: rows.length };
  }

  // ── Filter-building helpers (also used by QuizzesService) ──────────────────

  /**
   * Determine which table joins are needed given the active filters.
   *
   * Join chain:  questions
   *               └─ LEFT JOIN lessons   (when chapterIds / subjectIds / moduleIds / moduleType)
   *                   └─ LEFT JOIN chapters (when subjectIds / moduleIds / moduleType)
   *                       └─ LEFT JOIN subjects (when moduleIds / moduleType)
   */
  getJoinPlan(filter: QuestionFilterDto) {
    const needsSubjects =
      !!(filter.moduleIds?.length || filter.moduleType);
    const needsChapters =
      needsSubjects || !!(filter.subjectIds?.length);
    const needsLessons =
      needsChapters || !!(filter.chapterIds?.length);

    return { needsLessons, needsChapters, needsSubjects };
  }

  /**
   * Build WHERE conditions that reference whatever joined tables are present.
   * Callers must ensure the matching joins are added before executing.
   */
  buildFilterConditions(filter: QuestionFilterDto): SQL[] {
    const conditions: SQL[] = [];

    // ── Text search ────────────────────────────────
    if (filter.searchQuery?.trim()) {
      conditions.push(ilike(questions.statement, `%${filter.searchQuery.trim()}%`));
    }

    // ── Question-level (no join needed) ──────────────────────────────────
    if (filter.questionType) conditions.push(eq(questions.questionType, filter.questionType));
    if (filter.isMisc != null) conditions.push(eq(questions.isMisc, filter.isMisc));
    if (filter.oldExamId != null) conditions.push(eq(questions.oldExamId, filter.oldExamId));
    if (filter.referenceId != null) conditions.push(eq(questions.referenceId, filter.referenceId));
    if (filter.lessonIds?.length) conditions.push(inArray(questions.lessonId, filter.lessonIds));

    // ── Chapter-level (needs lessons join) ───────────────────────────────
    // Catches: misc questions directly on the chapter AND lesson questions inside it.
    if (filter.chapterIds?.length) {
      const c = or(
        inArray(questions.chapterId, filter.chapterIds),
        inArray(lessonsTable.chapterId, filter.chapterIds),
      );
      if (c) conditions.push(c);
    }

    // ── Subject-level (needs chapters join) ──────────────────────────────
    if (filter.subjectIds?.length) {
      conditions.push(inArray(chaptersTable.subjectId, filter.subjectIds));
    }

    // ── Module-level (needs subjects join) ───────────────────────────────
    if (filter.moduleIds?.length) conditions.push(inArray(subjectsTable.moduleId, filter.moduleIds));
    if (filter.moduleType) conditions.push(eq(subjectsTable.type, filter.moduleType));

    return conditions;
  }

  /**
   * Returns a `SELECT DISTINCT (id, createdAt)` query with only the joins required
   * by the active filters.  Uses `$dynamic()` to allow conditional join chaining.
   */
  buildFilterQuery(filter: QuestionFilterDto) {
    const { needsLessons, needsChapters, needsSubjects } = this.getJoinPlan(filter);
    const conditions = this.buildFilterConditions(filter);

    let query = this.drizzleService.db
      .selectDistinct({ id: questions.id, createdAt: questions.createdAt })
      .from(questions)
      .$dynamic();

    // Add only the joins actually referenced by the conditions
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

    if (conditions.length) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(questions.createdAt, questions.id);
  }

  /** Shared pagination logic used by the simple `findAll` path */
  private async _paginateQuery(
    where: SQL | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedQuestionsDto> {
    const offset = (page - 1) * limit;

    const [data, [{ value: total }]] = await Promise.all([
      this.drizzleService.db.query.questions.findMany({
        where,
        orderBy: (q, { asc }) => [asc(q.createdAt)],
        columns: QUESTION_COLUMNS,
        with: { questionOptions: { columns: OPTION_COLUMNS } },
        limit,
        offset,
      }),
      this.drizzleService.db
        .select({ value: count() })
        .from(questions)
        .where(where),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
