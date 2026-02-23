import { IsEnum, IsNumber, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Filter DTO for advanced question queries.
 *
 * All hierarchy arrays are ANDed together; values within each array are ORed.
 *
 *   moduleIds  → narrows to all questions reachable from those modules
 *   moduleType → further narrows subjects within the module scope
 *   subjectIds → narrows to all questions reachable from those subjects
 *   chapterIds → narrows to misc questions on those chapters + lesson questions inside them
 *   lessonIds  → direct lesson match (no join overhead)
 *
 * Any combination is valid; multiple levels narrow the result set further (AND).
 */
export class QuestionFilterDto {
  // ── Hierarchy scope ───────────────────────────────────────────────────────

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Type(() => Number)
  moduleIds?: number[];

  /** Narrows subjects to this type when moduleIds is set */
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

  // ── Question-level filters ────────────────────────────────────────────────

  /** When true, return only misc/chapter-level questions */
  @IsBoolean()
  @IsOptional()
  isMisc?: boolean;

  @IsEnum(['mcq', 'written'])
  @IsOptional()
  questionType?: 'mcq' | 'written';

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  oldExamId?: number;
}
