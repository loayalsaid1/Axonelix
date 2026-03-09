import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Body payload for POST /quizzes.
 *
 * Combines:
 *  • Material scope filters  (mirrors QuestionFilterDto)
 *  • Question-level filters  (type, questionStatus)
 *  • Quiz generation options (title, questionCount)
 */
export class GenerateQuizDto {
  // ── Optional display info ──────────────────────────────────────────────────

  @IsString()
  @IsOptional()
  title?: string;

  // ── Required: how many questions to include ────────────────────────────────

  @IsInt()
  @Min(1)
  @Type(() => Number)
  questionCount: number;

  // ── Material scope (hierarchy) ─────────────────────────────────────────────

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Type(() => Number)
  moduleIds?: number[];

  @IsEnum(['theoretical', 'practical'])
  @IsOptional()
  moduleType?: 'theoretical' | 'practical';

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Type(() => Number)
  subjectIds?: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Type(() => Number)
  chapterIds?: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Type(() => Number)
  lessonIds?: number[];

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  oldExamId?: number;

  @IsBoolean()
  @IsOptional()
  isMisc?: boolean;

  // ── Question-level filters ─────────────────────────────────────────────────

  /** 'mcq' | 'written' — omit for a mixed quiz */
  @IsEnum(['mcq', 'written'])
  @IsOptional()
  questionType?: 'mcq' | 'written';

  /**
   * 'all'            → include all matching questions  (default)
   * 'incorrect_only' → only questions the user last got wrong
   * 'unread'         → only questions the user has never answered
   */
  @IsEnum(['all', 'incorrect_only', 'unread'])
  @IsOptional()
  questionStatus?: 'all' | 'incorrect_only' | 'unread';
}
