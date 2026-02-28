import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { QuestionOptionsService } from '../question-options/question-options.service';
import { questions } from '../../../database/entities/questions';
import { lessons as lessonsTable } from '../../../database/entities/lessons';
import { chapters as chaptersTable } from '../../../database/entities/chapters';
import { subjects as subjectsTable } from '../../../database/entities/subjects';
import { and, eq, inArray, or, SQL, count } from 'drizzle-orm';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionFilterDto,
  PaginatedQuestionsDto,
  QuestionIdsDto,
} from './dto';

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
  ) {}

  // ── Public CRUD ────────────────────────────────────────────────────────────

  async create(dto: CreateQuestionDto) {
    const payload: typeof questions.$inferInsert = {
      questionType: dto.questionType,
      statement: dto.statement,
      statementFormat: dto.statementFormat ?? 'text',
      explanation: dto.explanation,
      lessonId: dto.lessonId ?? null,
      chapterId: dto.chapterId ?? null,
      isMisc: dto.isMisc ?? false,
      oldExamId: dto.oldExamId ?? null,
    };

    const [question] = await this.drizzleService.db
      .insert(questions)
      .values(payload)
      .returning();

    if (dto.questionType === 'mcq' && dto.options?.length) {
      await this.questionOptionsService.createMany(question.id, dto.options);
    }

    return this.findOne(question.id);
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
      questionType?: string;
      isMisc?: boolean;
    } = {},
    page = 1,
    limit = 40,
  ): Promise<PaginatedQuestionsDto> {
    const conditions: SQL[] = [];

    if (params.lessonId != null)    conditions.push(eq(questions.lessonId, params.lessonId));
    if (params.chapterId != null)   conditions.push(eq(questions.chapterId, params.chapterId));
    if (params.oldExamId != null)   conditions.push(eq(questions.oldExamId, params.oldExamId));
    if (params.questionType != null) conditions.push(eq(questions.questionType, params.questionType));
    if (params.isMisc != null)      conditions.push(eq(questions.isMisc, params.isMisc));

    const where = conditions.length ? and(...conditions) : undefined;
    return this._paginateQuery(where, page, limit);
  }

  async findOne(id: number) {
    const question = await this.drizzleService.db.query.questions.findFirst({
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
    await this.findOne(id);

    const { options, ...questionFields } = dto;

    // Build the update payload, only include defined fields
    const updatePayload: Partial<typeof questions.$inferInsert> = {};
    if (questionFields.questionType !== undefined) updatePayload.questionType = questionFields.questionType;
    if (questionFields.statement !== undefined)    updatePayload.statement = questionFields.statement;
    if (questionFields.statementFormat !== undefined) updatePayload.statementFormat = questionFields.statementFormat;
    if (questionFields.explanation !== undefined)  updatePayload.explanation = questionFields.explanation;
    if (questionFields.lessonId !== undefined)     updatePayload.lessonId = questionFields.lessonId;
    if (questionFields.chapterId !== undefined)    updatePayload.chapterId = questionFields.chapterId;
    if (questionFields.isMisc !== undefined)       updatePayload.isMisc = questionFields.isMisc;
    if (questionFields.oldExamId !== undefined)    updatePayload.oldExamId = questionFields.oldExamId;

    if (Object.keys(updatePayload).length) {
      await this.drizzleService.db
        .update(questions)
        .set(updatePayload)
        .where(eq(questions.id, id));
    }

    // Replace options if provided
    if (options !== undefined) {
      await this.questionOptionsService.replaceOptions(id, options ?? []);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const [deleted] = await this.drizzleService.db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning();

    if (!deleted) throw new NotFoundException(`Question with ID ${id} not found`);

    return deleted;
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
  async filter(filterDto: QuestionFilterDto, page = 1, limit = 40): Promise<PaginatedQuestionsDto> {
    const offset = (page - 1) * limit;

    const [idRows, [{ value: total }]] = await Promise.all([
      this.buildFilterQuery(filterDto).limit(limit).offset(offset),
      this.drizzleService.db
        .select({ value: count() })
        .from(this.buildFilterQuery(filterDto).as('cq')),
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
  async filterIds(filterDto: QuestionFilterDto): Promise<QuestionIdsDto> {
    const rows = await this.buildFilterQuery(filterDto);
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

    // ── Question-level (no join needed) ──────────────────────────────────
    if (filter.questionType)       conditions.push(eq(questions.questionType, filter.questionType));
    if (filter.isMisc != null)     conditions.push(eq(questions.isMisc, filter.isMisc));
    if (filter.oldExamId != null)  conditions.push(eq(questions.oldExamId, filter.oldExamId));
    if (filter.lessonIds?.length)  conditions.push(inArray(questions.lessonId, filter.lessonIds));

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
    if (filter.moduleIds?.length)  conditions.push(inArray(subjectsTable.moduleId, filter.moduleIds));
    if (filter.moduleType)         conditions.push(eq(subjectsTable.type, filter.moduleType));

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
