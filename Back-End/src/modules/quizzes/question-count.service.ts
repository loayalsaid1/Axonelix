import { Injectable } from '@nestjs/common';
import { and, count, eq, inArray, isNull, SQL } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { vwQuestionAncestry } from '../../database/entities/question-hierarchy-views';
import { userQuestionStatus } from '../../database/entities/user-question-status';
import { CountQuestionsDto } from './dto';

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class QuestionCountService {
  constructor(private readonly drizzleService: DrizzleService) {}

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Count questions that match the given filters for the requesting user.
   *
   * Scope filters      → WHERE clauses against vw_question_ancestry
   * questionStatus     → optional JOIN against user_question_status
   *
   * Returns { count } — the number of questions the user can generate a quiz
   * from with the current filter configuration.
   */
  async count(dto: CountQuestionsDto, userId: number): Promise<{ count: number }> {
    const scopeConditions = this._buildScopeConditions(dto);

    let query = this.drizzleService.db
      .select({ count: count() })
      .from(vwQuestionAncestry)
      .$dynamic();

    query = this._applyStatusJoin(query, scopeConditions, dto.questionStatus, userId);

    if (scopeConditions.length) {
      query = query.where(and(...scopeConditions));
    }

    const [{ count: result }] = await query;
    return { count: result };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Translates the DTO scope/type fields into SQL WHERE conditions against
   * vw_question_ancestry columns.
   *
   * No joins required — all ancestry columns are pre-resolved in the view.
   */
  private _buildScopeConditions(dto: CountQuestionsDto): SQL[] {
    const conditions: SQL[] = [];

    // ── Hierarchy scope ────────────────────────────────────────────────────
    if (dto.moduleIds?.length)
      conditions.push(inArray(vwQuestionAncestry.moduleId, dto.moduleIds));

    if (dto.moduleType)
      conditions.push(eq(vwQuestionAncestry.subjectType, dto.moduleType));

    if (dto.subjectIds?.length)
      conditions.push(inArray(vwQuestionAncestry.subjectId, dto.subjectIds));

    if (dto.chapterIds?.length)
      conditions.push(inArray(vwQuestionAncestry.chapterId, dto.chapterIds));

    if (dto.lessonIds?.length)
      conditions.push(inArray(vwQuestionAncestry.lessonId, dto.lessonIds));

    // ── Question-level ─────────────────────────────────────────────────────
    if (dto.oldExamId != null)
      conditions.push(eq(vwQuestionAncestry.oldExamId, dto.oldExamId));

    if (dto.isMisc != null)
      conditions.push(eq(vwQuestionAncestry.isMisc, dto.isMisc));

    if (dto.questionType)
      conditions.push(eq(vwQuestionAncestry.questionType, dto.questionType));

    return conditions;
  }

  /**
   * Attaches the user_question_status join for 'incorrect_only' / 'unread'
   * filters.  The 'all' case (or undefined) returns the query unchanged.
   *
   * incorrect_only:
   *   INNER JOIN — only rows where the user's last answer was wrong.
   *
   * unread:
   *   LEFT JOIN + IS NULL — rows with no entry for this user (never answered).
   *   The IS NULL condition is pushed onto the shared conditions array so the
   *   caller applies it in the final WHERE clause.
   */
  private _applyStatusJoin(
    query: ReturnType<typeof this._baseQuery>,
    conditions: SQL[],
    questionStatus: CountQuestionsDto['questionStatus'],
    userId: number,
  ) {
    if (questionStatus === 'incorrect_only') {
      return query.innerJoin(
        userQuestionStatus,
        and(
          eq(userQuestionStatus.questionId, vwQuestionAncestry.questionId),
          eq(userQuestionStatus.userId, userId),
          eq(userQuestionStatus.lastIsCorrect, false),
        )!,
      );
    }

    if (questionStatus === 'unread') {
      conditions.push(isNull(userQuestionStatus.questionId));
      return query.leftJoin(
        userQuestionStatus,
        and(
          eq(userQuestionStatus.questionId, vwQuestionAncestry.questionId),
          eq(userQuestionStatus.userId, userId),
        )!,
      );
    }

    return query;
  }

  // Helper for return-type inference used by _applyStatusJoin
  private _baseQuery() {
    return this.drizzleService.db
      .select({ count: count() })
      .from(vwQuestionAncestry)
      .$dynamic();
  }
}
